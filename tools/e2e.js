#!/usr/bin/env node
/* Tests de bout en bout du site, dans un vrai Chrome sans fenêtre (aucune dépendance, Node 22+).

   Local :   python3 -m http.server 8765   (dans site/)   puis   node tools/e2e.js
   GitHub :  lancé automatiquement à chaque publication (workflow « Vérification du site »).

   Variables : BASE (défaut http://localhost:8765), CHROME (chemin du navigateur). */
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const BASE = (process.env.BASE || "http://localhost:8765").replace(/\/$/, "");
const CHROME = process.env.CHROME || [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
].find((p) => fs.existsSync(p));
const PAGES = ["index.html", "asmaa.html", "programmes.html", "immersions-retraites.html", "orr.html", "podcasts.html",
  "livres.html", "galerie.html", "contact.html", "mentions-legales.html", "confidentialite.html", "a-fournir.html"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function lancerChrome() {
  if (!CHROME) throw new Error("Chrome introuvable (définir CHROME=…)");
  const profil = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-"));
  const proc = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run",
    "--remote-debugging-port=0", `--user-data-dir=${profil}`, "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  const ws = await new Promise((ok, ko) => {
    let buf = "";
    const t = setTimeout(() => ko(new Error("Chrome ne répond pas")), 20000);
    proc.stderr.on("data", (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); ok(m[1]); } });
  });
  const port = new URL(ws).port;
  const cibles = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  return { proc, profil, pageWs: cibles.find((c) => c.type === "page").webSocketDebuggerUrl };
}

async function connecter(url) {
  const ws = new WebSocket(url);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const attente = new Map(); const ecouteurs = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && attente.has(d.id)) { attente.get(d.id)(d); attente.delete(d.id); }
    else if (d.method) ecouteurs.forEach((f) => f(d));
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; attente.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  return { ws, send, on: (f) => ecouteurs.push(f) };
}

(async () => {
  const { proc, profil, pageWs } = await lancerChrome();
  const cdp = await connecter(pageWs);
  const erreursJS = [];
  cdp.on((e) => {
    if (e.method === "Runtime.exceptionThrown") erreursJS.push(e.params.exceptionDetails.exception?.description?.split("\n")[0] || e.params.exceptionDetails.text);
    if (e.method === "Runtime.consoleAPICalled" && e.params.type === "error") erreursJS.push(e.params.args.map((a) => a.value || a.description).join(" "));
  });
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable");

  const js = async (expr) => {
    const r = await cdp.send("Runtime.evaluate", { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || "erreur JS");
    return r.result?.result?.value;
  };
  const taille = (w, h = 900) => cdp.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });
  const aller = async (p) => {
    const charge = new Promise((r) => cdp.on((e) => { if (e.method === "Page.loadEventFired") r(); }));
    await cdp.send("Page.navigate", { url: `${BASE}/${p}` });
    await Promise.race([charge, sleep(10000)]);
    await sleep(500);
  };
  const touche = async (key, code = key) => {
    for (const type of ["keyDown", "keyUp"]) await cdp.send("Input.dispatchKeyEvent", { type, key, code, windowsVirtualKeyCode: { Escape: 27, Tab: 9, ArrowRight: 39, ArrowLeft: 37 }[key] || 0 });
  };

  const resultats = [];
  const test = async (nom, fn) => {
    erreursJS.length = 0;
    try { const detail = await fn(); resultats.push({ nom, ok: true, detail }); }
    catch (e) { resultats.push({ nom, ok: false, detail: e.message }); }
  };
  const verifier = (cond, msg) => { if (!cond) throw new Error(msg); };

  await taille(1440);
  await aller("index.html?presentation=0");

  // 1. Toutes les pages : chargement sans erreur JavaScript, en-tête rendu
  for (const p of PAGES) {
    await test(`chargement sans erreur — ${p}`, async () => {
      await aller(p);
      const ok = await js(`return !!document.querySelector('.site-header') && !!document.querySelector('.site-footer')`);
      verifier(ok, "en-tête ou pied de page absent");
      verifier(erreursJS.length === 0, "erreur JS : " + erreursJS[0]);
    });
  }

  // 2. Mobile : aucune page ne déborde en largeur
  await taille(375, 812);
  await test("mobile 375 px — aucun débordement horizontal", async () => {
    const trop = [];
    for (const p of PAGES) { await aller(p); const w = await js(`return document.documentElement.scrollWidth`); if (w > 375) trop.push(`${p} (${w}px)`); }
    verifier(!trop.length, "débordement : " + trop.join(", "));
    return `${PAGES.length} pages`;
  });
  await taille(1440);

  // 3. Menu plein écran au clavier
  await test("menu : ouverture, focus sur la croix, Échap, focus rendu", async () => {
    await aller("index.html");
    await js(`document.querySelector('.menu-btn').click()`); await sleep(400);
    const ouvert = await js(`return [document.querySelector('.menu-overlay').classList.contains('open'), document.activeElement.className]`);
    verifier(ouvert[0], "le menu ne s'ouvre pas"); verifier(ouvert[1] === "menu-close", "focus pas sur la croix : " + ouvert[1]);
    await touche("Escape"); await sleep(400);
    const ferme = await js(`return [document.querySelector('.menu-overlay').classList.contains('open'), document.activeElement.className, document.querySelector('.menu-overlay').inert]`);
    verifier(!ferme[0], "Échap ne ferme pas"); verifier(ferme[1] === "menu-btn", "focus non rendu au bouton"); verifier(ferme[2], "menu fermé non inerte");
  });

  // 4. Formulaire de contact : validation puis succès (mode démonstration)
  await test("contact : erreurs en français puis confirmation", async () => {
    await aller("contact.html");
    const r = await js(`const f = document.querySelector('form[data-form=contact]'); f.requestSubmit(); await new Promise(r => setTimeout(r, 150));
      const erreurs = [...f.querySelectorAll('.field-error')].filter(e => e.textContent).length;
      f.prenom.value = 'Test'; f.email.value = 'test@exemple.fr'; f.message.value = 'Bonjour, une question sur les retraites.';
      f.requestSubmit(); await new Promise(r => setTimeout(r, 200));
      return [erreurs, f.querySelector('.form-status').className, f.prenom.value];`);
    verifier(r[0] >= 3, `${r[0]} erreurs affichées au lieu de 3`); verifier(r[1].includes("is-ok"), "pas de confirmation"); verifier(r[2] === "", "formulaire non vidé");
  });

  // 5. Préremplissage depuis un bouton
  await test("contact : sujet et message préremplis (?sujet=programme&programme=cartographie)", async () => {
    await aller("contact.html?sujet=programme&programme=cartographie");
    const r = await js(`return [document.querySelector('select[name=sujet]').value, document.querySelector('textarea[name=message]').value]`);
    verifier(r[0] === "programme", "sujet : " + r[0]); verifier(r[1].includes("Cartographie"), "message non prérempli");
  });

  // 6. Liste d'attente : le bouton présélectionne l'accompagnement
  await test("liste d'attente : « Demander une immersion » présélectionne l'immersion", async () => {
    await aller("immersions-retraites.html");
    const v = await js(`document.querySelector('a[data-choix="Une immersion individuelle"]').click(); return document.querySelector('select[name=accompagnement]').value`);
    verifier(v === "Une immersion individuelle", "valeur : " + v);
  });

  // 7. Galerie : visionneuse
  await test("galerie : visionneuse, flèche droite, Échap", async () => {
    await aller("galerie.html");
    await js(`document.querySelector('.g-open').click()`); await sleep(500);
    const a = await js(`return [document.querySelector('.lightbox').classList.contains('open'), document.querySelector('.lb-count').textContent]`);
    verifier(a[0], "la visionneuse ne s'ouvre pas");
    await touche("ArrowRight"); await sleep(200);
    const b = await js(`return document.querySelector('.lb-count').textContent`);
    verifier(b !== a[1], "la flèche ne change pas d'image");
    await touche("Escape"); await sleep(300);
    verifier(!(await js(`return document.querySelector('.lightbox').classList.contains('open')`)), "Échap ne ferme pas");
    return `${a[1]} → ${b}`;
  });

  // 8. Mode présentation : aucune consigne visible
  await test("mode présentation : ni bandeau ni consigne visible", async () => {
    const restes = [];
    for (const p of ["index.html", "programmes.html", "orr.html", "podcasts.html", "livres.html", "contact.html"]) {
      await aller(p + "?presentation");
      const n = await js(`return [!!document.querySelector('.wip-banner'), [...document.querySelectorAll('.ph')].filter(e => e.offsetParent && !e.closest('[hidden]')).length]`);
      if (n[0] || n[1]) restes.push(`${p} (bandeau ${n[0]}, consignes ${n[1]})`);
    }
    await aller("index.html?presentation=0");
    verifier(!restes.length, restes.join(", "));
  });

  // 9. Repères de section (grand écran)
  await test("repères de section : section active au défilement (Asmaa)", async () => {
    await aller("asmaa.html");
    const r = await js(`const rail = document.querySelector('.section-rail'); if (!rail) return 'absent';
      window.scrollTo({ top: document.getElementById('methodes').offsetTop + 100, behavior: 'instant' }); rail.update();
      return [rail.classList.contains('show'), rail.querySelector('a.active')?.getAttribute('href')];`);
    verifier(Array.isArray(r), "repères absents"); verifier(r[0] && r[1] === "#methodes", "actif : " + r[1]);
  });

  // 10. Retour en haut
  await test("bouton retour en haut : apparaît après défilement", async () => {
    await aller("asmaa.html");
    const r = await js(`window.scrollTo({ top: 3000, behavior: 'instant' }); await new Promise(r => setTimeout(r, 300)); return document.querySelector('.to-top').classList.contains('show')`);
    verifier(r, "le bouton n'apparaît pas");
  });

  // 11. Page de suivi : liste générée
  await test("page de suivi : éléments à fournir listés et exportables", async () => {
    await aller("a-fournir.html"); await sleep(1500);
    const n = await js(`return [document.querySelectorAll('.todo-item textarea').length, !!document.getElementById('todo-download')]`);
    verifier(n[0] > 10, `${n[0]} éléments seulement`); verifier(n[1], "bouton de téléchargement absent");
    return `${n[0]} éléments`;
  });

  cdp.ws.close(); proc.kill(); await sleep(300); fs.rmSync(profil, { recursive: true, force: true });
  const ko = resultats.filter((r) => !r.ok);
  for (const r of resultats) console.log(`${r.ok ? "  ok  " : "  ÉCHEC"} ${r.nom}${r.detail ? " — " + r.detail : ""}`);
  console.log(`\n${resultats.length - ko.length}/${resultats.length} tests réussis`);
  process.exit(ko.length ? 1 : 0);
})().catch((e) => { console.error("Erreur :", e.message); process.exit(2); });
