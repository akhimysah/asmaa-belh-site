#!/usr/bin/env node
/* Audit Lighthouse de plusieurs pages, avec résumé lisible (et tableau dans GitHub Actions).
   Lancé par le workflow GitHub ; en local : npx --yes lighthouse@12 doit être disponible.
   Seuils bloquants : accessibilité, bonnes pratiques et référencement (la performance
   varie trop selon la machine pour bloquer, elle est seulement rapportée).
   L'audit « page indexable » est ignoré tant que le site est volontairement en noindex. */
const { execFileSync } = require("child_process");
const fs = require("fs");

const BASE = (process.env.BASE || "http://localhost:8765").replace(/\/$/, "");
const PAGES = (process.env.PAGES || "index.html,asmaa.html,programmes.html,livres.html,galerie.html,contact.html").split(",");
const SEUILS = { accessibility: 95, "best-practices": 90, seo: 90 };
const NOMS = { performance: "Performance", accessibility: "Accessibilité", "best-practices": "Bonnes pratiques", seo: "Référencement" };

const lignes = []; const echecs = []; const remarques = new Map();
for (const forme of ["mobile", "desktop"]) {
  for (const p of PAGES) {
    const sortie = `/tmp/lh-${forme}-${p}.json`;
    const args = ["--yes", "lighthouse@12", `${BASE}/${p}`, "--quiet", "--output=json", `--output-path=${sortie}`,
      "--chrome-flags=--headless=new --no-sandbox --disable-gpu", "--skip-audits=is-crawlable",
      "--only-categories=performance,accessibility,best-practices,seo"];
    if (forme === "desktop") args.push("--preset=desktop");
    try { execFileSync("npx", args, { stdio: ["ignore", "ignore", "inherit"], timeout: 180000 }); }
    catch (e) { echecs.push(`${p} (${forme}) : audit impossible`); continue; }
    const r = JSON.parse(fs.readFileSync(sortie, "utf8"));
    const s = Object.fromEntries(Object.entries(r.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
    lignes.push({ page: p, forme, ...s, lcp: r.audits["largest-contentful-paint"]?.displayValue, lcpEl: (r.audits["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node?.nodeLabel || "").slice(0, 40), lcpPhases: (r.audits["largest-contentful-paint-element"]?.details?.items?.[1]?.items || []).map((x) => `${x.phase}: ${Math.round(x.timing)} ms`).join(", "), cls: r.audits["cumulative-layout-shift"]?.displayValue });
    for (const [k, min] of Object.entries(SEUILS)) if (s[k] < min) echecs.push(`${p} (${forme}) : ${NOMS[k]} ${s[k]} < ${min}`);
    for (const cat of ["accessibility", "best-practices", "seo"]) {
      for (const ref of r.categories[cat].auditRefs) {
        const a = r.audits[ref.id];
        if (ref.weight > 0 && a.score !== null && a.score < 1) {
          const cle = `${NOMS[cat]} — ${a.title}`;
          remarques.set(cle, (remarques.get(cle) || new Set()).add(p));
        }
      }
    }
  }
}

const tableau = ["| Page | Écran | Performance | Accessibilité | Bonnes pratiques | Référencement | Affichage principal (LCP) | Élément | Stabilité (CLS) |",
  "|---|---|---|---|---|---|---|---|---|",
  ...lignes.map((l) => `| ${l.page} | ${l.forme} | ${l.performance} | ${l.accessibility} | ${l["best-practices"]} | ${l.seo} | ${l.lcp || "-"} | ${l.lcpEl || "-"} | ${l.cls || "-"} |`)].join("\n");
const notes = [...remarques].map(([k, v]) => `- ${k} (${[...v].join(", ")})`).join("\n");
const phases = lignes.filter((l) => l.forme === "mobile" && l.lcpPhases).map((l) => `- ${l.page} : ${l.lcpPhases}`).join("\n");
const resume = `## Audit Lighthouse\n\n${tableau}\n\n${phases ? "### Décomposition du LCP (mobile)\n\n" + phases + "\n\n" : ""}${notes ? "### Points relevés\n\n" + notes + "\n" : "Aucun point relevé hors performance.\n"}\n${echecs.length ? "### Seuils non atteints\n\n" + echecs.map((e) => "- " + e).join("\n") : "Tous les seuils sont atteints."}\n`;
console.log(resume);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, resume);
process.exit(echecs.length ? 1 : 0);
