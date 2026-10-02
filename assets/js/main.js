/* =========================================================
   ASMAA BELH — Squelette : header, menu plein écran, footer, interactions
   Arborescence (réf. maquette menu)
   ========================================================= */

const MENU = [
  { num: "01", label: "Accueil", href: "index.html" },
  {
    num: "02", label: "Asmaa", href: "asmaa.html",
    sub: [
      { label: "Biographie", href: "asmaa.html#biographie" },
      { label: "Approche", href: "asmaa.html#approche" },
      { label: "Méthodes & pratiques", href: "asmaa.html#methodes" },
      { label: "Photos professionnelles", href: "asmaa.html#photos" },
    ],
  },
  {
    num: "03", label: "Programmes", href: "programmes.html",
    sub: [
      { label: "Programme « Sexy & Sacrée »", href: "programmes.html#sexy-et-sacree" },
      { label: "Cartographie", href: "programmes.html#cartographie" },
      { label: "Avoir une conversation difficile", href: "programmes.html#conversation-difficile" },
      { label: "Comprendre ma femme", href: "programmes.html#comprendre-ma-femme" },
    ],
  },
  {
    num: "04", label: "Immersions & Retraites", short: "Retraites", href: "immersions-retraites.html",
    sub: [
      { label: "Les retraites", href: "immersions-retraites.html#retraites" },
      { label: "Les immersions", href: "immersions-retraites.html#immersions" },
    ],
  },
  {
    num: "05", label: "ORR", href: "orr.html",
    sub: [
      { label: "Découvrir l'expérience ORR", href: "orr.html#experience" },
      { label: "Les rituels ORR", href: "orr.html#rituels" },
      { label: "La boutique ORR", href: "orr.html#boutique" },
    ],
  },
  {
    num: "06", label: "Podcasts", href: "podcasts.html",
    sub: [
      { label: "Les derniers épisodes", href: "podcasts.html#derniers" },
      { label: "Tous les podcasts", href: "podcasts.html#tous" },
    ],
  },
  {
    num: "07", label: "Livres", href: "livres.html",
    sub: [
      { label: "« Sexy & Sacrée »", href: "livres.html#sexy-et-sacree" },
      { label: "Love Programme", href: "livres.html#love-programme" },
      { label: "L'ouvrage autour de l'argent", href: "livres.html#argent" },
      { label: "Tous les livres", href: "livres.html#tous" },
    ],
  },
  {
    num: "08", label: "Galerie", href: "galerie.html",
    sub: [{ label: "Galerie photographique", href: "galerie.html" }],
  },
];

const SOCIAL = [
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "Spotify", href: "#" },
];

function currentPage() {
  const p = location.pathname.split("/").pop();
  return p === "" ? "index.html" : p;
}

function renderHeader() {
  const el = document.querySelector("[data-site-header]");
  if (!el) return;
  const page = currentPage();

  el.innerHTML = `
    <a class="skip-link" href="#contenu">Aller au contenu</a>
    <div class="wip-banner">Squelette de site — version de travail, contenus à compléter</div>
    <header class="site-header">
      <div class="container">
        <a class="logo" href="index.html">Asmaa Belh<small>Thérapeute • Autrice • Entrepreneure • Créatrice de l'univers ORR</small></a>
        <nav class="nav-inline" aria-label="Navigation principale">
          ${MENU.filter((m) => m.href !== "index.html").map(
            (m) => `<a href="${m.href}" class="${page === m.href ? "active" : ""}"${page === m.href ? ' aria-current="page"' : ""}>${m.short || m.label}</a>`
          ).join("")}
        </nav>
        <div class="header-right">
          <a href="contact.html" class="btn">Contact</a>
          <button class="menu-btn" aria-label="Ouvrir le menu" aria-expanded="false">
            <span>Menu</span><span class="lines"><i></i><i></i><i></i></span>
          </button>
        </div>
      </div>
    </header>
    <div class="menu-overlay" role="dialog" aria-modal="true" aria-label="Menu">
      <div class="menu-panel">
        <div class="menu-top">
          <a class="logo" href="index.html">Asmaa Belh</a>
          <button class="menu-close" aria-label="Fermer le menu">✕</button>
        </div>
        <div class="menu-label">Menu</div>
        <ol class="menu-list">
          ${MENU.map(
            (m) => `
            <li>
              <span class="num">${m.num}</span>
              <span class="bar"></span>
              <div>
                <a class="menu-main" href="${m.href}"${page === m.href ? ' aria-current="page"' : ""}>${m.label}</a>
                ${m.sub ? `<ul class="menu-sub">${m.sub.map((s) => `<li><a href="${s.href}">${s.label}</a></li>`).join("")}</ul>` : ""}
              </div>
            </li>`
          ).join("")}
        </ol>
        <div class="menu-foot">
          <a class="menu-contact" href="contact.html">Contact</a>
          <div class="menu-social">
            ${SOCIAL.map((s) => `<a href="${s.href}">${s.label}</a>`).join('<span>•</span>')}
          </div>
        </div>
      </div>
      <div class="menu-visual">
        <div class="photo" data-missing="Photo du menu — assets/img/menu-arch.jpg"><img src="assets/img/menu-arch.jpg" alt="" onerror="this.parentNode.classList.add('missing')"></div>
      </div>
    </div>`;

  document.body.classList.add("has-banner");
  const firstSection = document.querySelector("body > section");
  if (firstSection && !document.getElementById("contenu")) {
    const anchor = document.createElement("span");
    anchor.id = "contenu"; anchor.tabIndex = -1;
    firstSection.prepend(anchor);
  }

  const banner = el.querySelector(".wip-banner");
  const setBannerH = () =>
    document.documentElement.style.setProperty("--banner-h", banner.offsetHeight + "px");
  setBannerH();
  window.addEventListener("resize", setBannerH);

  const header = el.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const overlay = el.querySelector(".menu-overlay");
  const openBtn = el.querySelector(".menu-btn");
  const closeBtn = el.querySelector(".menu-close");
  overlay.inert = true;
  let isOpen = false;
  const setOpen = (open) => {
    if (open === isOpen) return;
    isOpen = open;
    overlay.classList.toggle("open", open);
    overlay.inert = !open;
    document.body.classList.toggle("menu-open", open);
    openBtn.setAttribute("aria-expanded", String(open));
    requestAnimationFrame(() => requestAnimationFrame(() => (open ? closeBtn : openBtn).focus()));
  };
  overlay.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const f = [...overlay.querySelectorAll("a, button")].filter((x) => x.offsetParent !== null);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  openBtn.addEventListener("click", () => setOpen(true));
  closeBtn.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen) setOpen(false); });
  overlay.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      const target = a.getAttribute("href").split("#")[0];
      if (target === currentPage() || target === "") setOpen(false);
    });
  });
}

function renderFooter() {
  const el = document.querySelector("[data-site-footer]");
  if (!el) return;
  el.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <a class="logo" href="index.html">Asmaa Belh<small>Thérapeute · Autrice · Entrepreneure</small></a>
            <p style="margin-top:1.2rem;max-width:320px">Quand une femme se réaligne, tout son monde change.</p>
          </div>
          <div>
            <h4>Explorer</h4>
            <ul>
              ${MENU.map((m) => `<li><a href="${m.href}">${m.label}</a></li>`).join("")}
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4>Suivre</h4>
            <ul>
              ${SOCIAL.map((s) => `<li><a href="${s.href}">${s.label} <span class="ph ph-inline">lien</span></a></li>`).join("")}
              <li><a href="#">TikTok <span class="ph ph-inline">lien</span></a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><span class="ph ph-inline">email@…</span></li>
              <li><span class="ph ph-inline">téléphone (si souhaité)</span></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} Asmaa Belh — Tous droits réservés</span>
          <span><a href="mentions-legales.html">Mentions légales</a> · <a href="confidentialite.html">Politique de confidentialité</a></span>
        </div>
      </div>
    </footer>`;
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { items.forEach((i) => i.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  items.forEach((i) => io.observe(i));
}

function initPlaceholderToggle() {
  const btn = document.createElement("button");
  btn.className = "ph-toggle";
  const KEY = "asmaa-hide-ph";
  const apply = (hide) => {
    document.body.classList.toggle("hide-ph", hide);
    btn.textContent = hide ? "Afficher les repères" : "Masquer les repères";
  };
  let hidden = false;
  try { hidden = localStorage.getItem(KEY) === "1"; } catch (_) {}
  apply(hidden);
  btn.addEventListener("click", () => {
    hidden = !hidden; apply(hidden);
    try { localStorage.setItem(KEY, hidden ? "1" : "0"); } catch (_) {}
  });
  document.body.appendChild(btn);
}

function initGalleryFilters() {
  const filters = document.querySelector(".filters");
  if (!filters) return;
  const items = document.querySelectorAll(".masonry [data-cat]");
  filters.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    filters.querySelectorAll("button").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    const cat = b.dataset.filter;
    items.forEach((it) => { it.style.display = cat === "all" || it.dataset.cat === cat ? "" : "none"; });
  });
}

function initForms() {
  document.querySelectorAll("form[data-demo]").forEach((f) => {
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Formulaire de démonstration — l'envoi sera branché lors de la mise en production.");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  initReveal();
  initPlaceholderToggle();
  initGalleryFilters();
  initForms();
});
