/* Comparateur de rendu — vérifie qu'une modification de style.css ne change rien à l'écran.

   1. Avant de modifier : cp assets/css/style.css assets/css/_avant.css
   2. Modifier style.css
   3. Lancer le site en local (python3 -m http.server 8765), ouvrir index.html,
      coller ce fichier dans la console du navigateur, puis :
         await comparerRendu(1440); await comparerRendu(800); await comparerRendu(375);
   4. Chaque page doit afficher « 0 écart ». Supprimer ensuite _avant.css.

   Pour chaque élément de chaque page, compare ~50 propriétés calculées (taille, position,
   marges, typographie, couleurs, bordures, transformations, pseudo-éléments), animations figées. */
async function comparerRendu(largeur, pages = ["index.html", "asmaa.html", "programmes.html", "immersions-retraites.html", "orr.html", "podcasts.html", "livres.html", "galerie.html", "contact.html", "mentions-legales.html", "confidentialite.html", "a-fournir.html"]) {
  const PROPS = ["display", "position", "top", "right", "bottom", "left", "width", "height", "margin-top", "margin-right", "margin-bottom", "margin-left", "padding-top", "padding-right", "padding-bottom", "padding-left", "font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing", "text-transform", "text-align", "color", "background-color", "background-image", "border-top", "border-right", "border-bottom", "border-left", "border-radius", "opacity", "transform", "object-fit", "object-position", "grid-template-columns", "gap", "flex-direction", "justify-content", "align-items", "z-index", "visibility", "overflow", "box-shadow", "aspect-ratio", "max-width", "white-space"];
  const charger = async (page, ancien) => {
    const f = document.createElement("iframe");
    f.style.cssText = `position:fixed;left:-99999px;top:0;width:${largeur}px;height:900px;border:0`;
    f.src = page + "?cmp=" + Math.random();
    document.body.appendChild(f);
    await new Promise((r) => (f.onload = r));
    const d = f.contentDocument;
    if (ancien) {
      const l = d.querySelector('link[href*="style.css"]');
      await new Promise((r) => { l.onload = r; l.href = "assets/css/_avant.css?x=" + Math.random(); });
    }
    const st = d.createElement("style");
    st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
    d.head.appendChild(st);
    d.documentElement.classList.add("is-loaded");
    d.querySelectorAll(".reveal").forEach((e) => e.classList.add("in"));
    await new Promise((r) => setTimeout(r, 250));
    const w = f.contentWindow;
    const data = [...d.body.querySelectorAll("*")].filter((e) => !["SCRIPT", "STYLE", "SOURCE"].includes(e.tagName)).map((e) => {
      const cs = w.getComputedStyle(e), b = w.getComputedStyle(e, "::before"), a = w.getComputedStyle(e, "::after");
      return { el: (e.tagName + "." + [...e.classList].join(".")).slice(0, 60), v: PROPS.map((k) => cs.getPropertyValue(k)).concat(["content", "display", "background-image"].map((k) => "b:" + b.getPropertyValue(k) + "|a:" + a.getPropertyValue(k))) };
    });
    f.remove();
    return data;
  };
  const resultat = {};
  for (const page of pages) {
    const A = await charger(page, false), B = await charger(page, true);
    const ecarts = [];
    if (A.length !== B.length) ecarts.push(`nombre d'éléments ${A.length} / ${B.length}`);
    else A.forEach((x, i) => x.v.forEach((v, j) => { if (v !== B[i].v[j]) ecarts.push(`${x.el} [${PROPS[j] || "pseudo"}] nouveau=${v.slice(0, 60)} ancien=${B[i].v[j].slice(0, 60)}`); }));
    resultat[page] = ecarts.length ? ecarts.slice(0, 10) : "0 écart";
  }
  console.table(resultat);
  return resultat;
}
