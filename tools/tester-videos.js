// Piloté par tools/tester-videos.sh : clique sur les boutons de lecture et vérifie que les vidéos avancent.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const targets = await (await fetch("http://127.0.0.1:9333/json")).json();
  const page = targets.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
  await new Promise((r) => (ws.onopen = r));
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJS = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
  await send("Page.enable");
  await send("Page.navigate", { url: "http://localhost:8765/index.html?presentation=0" });
  await sleep(2500);
  console.log("visibilité :", await evalJS("document.visibilityState"));
  await evalJS(`(() => { const f = document.querySelector('.video-frame'); const v = f.querySelector('video'); v.muted = true; f.querySelector('.video-play').click(); return true; })()`);
  for (let s = 3; s <= 15; s += 3) {
    await sleep(3000);
    console.log(`après ${s} s :`, await evalJS(`(() => { const f = document.querySelector('.video-frame'); const v = f.querySelector('video'); return JSON.stringify({ enLecture: !v.paused, temps: +v.currentTime.toFixed(1), pret: v.readyState, erreur: f.classList.contains('is-error') }); })()`));
  }
  const fin = await evalJS(`(() => { const v = document.querySelector(".video-frame video"); return v.currentTime; })()`);
  console.log("2e vidéo :", await evalJS(`(async () => { const fs = [...document.querySelectorAll('.video-frame')]; const v1 = fs[0].querySelector('video'), v2 = fs[1].querySelector('video'); v2.muted = true; fs[1].querySelector('.video-play').click(); await new Promise(r => setTimeout(r, 6000)); return JSON.stringify({ v1EnPause: v1.paused, v1Erreur: fs[0].classList.contains('is-error'), v2EnLecture: !v2.paused, v2Temps: +v2.currentTime.toFixed(1) }); })()`));
  const ok = fin > 3;
  console.log(ok ? "OK : la lecture avance" : "ÉCHEC : la vidéo ne démarre pas");
  ws.close(); process.exit(ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
