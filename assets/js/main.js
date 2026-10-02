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
        <div class="photo" data-missing="Photo du menu — assets/img/menu-arch.jpg"><picture><source srcset="assets/img/menu-arch.webp" type="image/webp"><img src="assets/img/menu-arch.jpg" alt="" loading="lazy" decoding="async" onerror="this.closest('.photo').classList.add('missing')"></picture></div>
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
            <h2 class="f-title">Explorer</h2>
            <ul>
              ${MENU.map((m) => `<li><a href="${m.href}">${m.label}</a></li>`).join("")}
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>
          <div>
            <h2 class="f-title">Suivre</h2>
            <ul>
              ${SOCIAL.map((s) => `<li><a href="${s.href}">${s.label} <span class="ph ph-inline">lien</span></a></li>`).join("")}
              <li><a href="#">TikTok <span class="ph ph-inline">lien</span></a></li>
            </ul>
          </div>
          <div>
            <h2 class="f-title">Contact</h2>
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
    filters.querySelectorAll("button").forEach((x) => { x.classList.remove("active"); x.setAttribute("aria-pressed", "false"); });
    b.classList.add("active");
    b.setAttribute("aria-pressed", "true");
    const cat = b.dataset.filter;
    items.forEach((it) => { it.style.display = cat === "all" || it.dataset.cat === cat ? "" : "none"; });
  });
}

function initLightbox() {
  const triggers = () => [...document.querySelectorAll(".g-open")].filter((b) => b.closest(".g-item").style.display !== "none");
  if (!document.querySelector(".g-open")) return;
  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Visionneuse");
  box.inert = true;
  box.innerHTML = `
    <button class="lb-close" type="button" aria-label="Fermer">✕</button>
    <button class="lb-prev" type="button" aria-label="Image précédente">←</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button class="lb-next" type="button" aria-label="Image suivante">→</button>
    <span class="lb-count" aria-live="polite"></span>`;
  document.body.appendChild(box);
  const img = box.querySelector("img"), cap = box.querySelector("figcaption"), count = box.querySelector(".lb-count");
  let list = [], i = 0, opener = null;
  const show = (n) => {
    i = (n + list.length) % list.length;
    const t = list[i];
    img.src = t.dataset.full; img.alt = t.dataset.caption;
    cap.textContent = t.dataset.caption;
    count.textContent = `${i + 1} / ${list.length}`;
  };
  const open = (t) => {
    list = triggers(); opener = t;
    show(list.indexOf(t));
    box.inert = false; box.classList.add("open"); document.body.classList.add("menu-open");
    requestAnimationFrame(() => requestAnimationFrame(() => box.querySelector(".lb-close").focus()));
  };
  const close = () => {
    box.classList.remove("open"); box.inert = true; document.body.classList.remove("menu-open");
    if (opener) opener.focus();
  };
  document.addEventListener("click", (e) => { const t = e.target.closest(".g-open"); if (t) open(t); });
  box.querySelector(".lb-close").addEventListener("click", close);
  box.querySelector(".lb-prev").addEventListener("click", () => show(i - 1));
  box.querySelector(".lb-next").addEventListener("click", () => show(i + 1));
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(i - 1);
    if (e.key === "ArrowRight") show(i + 1);
    if (e.key === "Tab") {
      const f = [...box.querySelectorAll("button")];
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  let x0 = null;
  box.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1)); x0 = null; });
}

/* ---------------------------------------------------------
   FORMULAIRES
   Coller ici l'adresse d'envoi fournie par le service choisi
   (Formspree, Getform, Basin…). Vide = mode démonstration.
   On peut aussi définir une adresse par formulaire.
   --------------------------------------------------------- */
const FORM_ENDPOINTS = {
  default: "",
  contact: "",
  "liste-attente": "",
  newsletter: "",
};

const FORM_MESSAGES = {
  contact: "Merci, votre message est bien parti. Asmaa vous répondra personnellement.",
  "liste-attente": "Merci, vous êtes inscrit·e sur la liste d'attente. Vous serez parmi les premiers informés des prochaines dates.",
  newsletter: "Merci, c'est noté. À très vite dans ta boîte mail.",
};

function fieldError(field) {
  const v = field.validity;
  if (v.valueMissing) return field.type === "email" ? "Merci d'indiquer votre adresse email." : "Ce champ est nécessaire.";
  if (v.typeMismatch && field.type === "email") return "Cette adresse email ne semble pas valide.";
  if (v.tooShort || (field.minLength > 0 && field.value && field.value.trim().length < field.minLength)) return `Encore quelques mots (au moins ${field.minLength} caractères).`;
  return "";
}

function showFieldError(field, msg) {
  const host = field.closest(".field") || field.closest(".nl-row") || field.parentElement;
  let el = host.querySelector(".field-error");
  if (!el) {
    el = document.createElement("p");
    el.className = "field-error";
    el.id = (field.id || field.name) + "-erreur";
    host.appendChild(el);
  }
  el.textContent = msg;
  field.setAttribute("aria-invalid", msg ? "true" : "false");
  if (msg) field.setAttribute("aria-describedby", el.id); else field.removeAttribute("aria-describedby");
}

function initForms() {
  document.querySelectorAll("form[data-form]").forEach((form) => {
    const type = form.dataset.form;
    const status = form.querySelector(".form-status");
    const btn = form.querySelector('button[type="submit"]');
    const fields = [...form.querySelectorAll("input, select, textarea")].filter((f) => f.name !== "_gotcha");
    const setStatus = (msg, kind) => { status.textContent = msg; status.className = "form-status " + (kind || ""); };

    fields.forEach((f) => f.addEventListener("blur", () => { if (f.value) showFieldError(f, fieldError(f)); }));
    fields.forEach((f) => f.addEventListener("input", () => { if (f.getAttribute("aria-invalid") === "true") showFieldError(f, fieldError(f)); }));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let firstBad = null;
      fields.forEach((f) => { const m = fieldError(f); showFieldError(f, m); if (m && !firstBad) firstBad = f; });
      if (firstBad) { setStatus("Quelques informations manquent, voir ci-dessus.", "is-error"); firstBad.focus(); return; }

      const done = (demo) => {
        form.reset();
        setStatus(FORM_MESSAGES[type] + (demo ? " (Démonstration : aucun envoi réel pour l'instant.)" : ""), "is-ok");
      };
      if (form.querySelector('[name="_gotcha"]').value) { done(false); return; }

      const endpoint = FORM_ENDPOINTS[type] || FORM_ENDPOINTS.default;
      if (!endpoint) { done(true); return; }

      const label = btn.innerHTML;
      btn.disabled = true; btn.textContent = "Envoi…";
      try {
        const data = new FormData(form);
        data.append("_formulaire", type);
        data.append("_page", location.pathname);
        const res = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(res.status);
        done(false);
      } catch (err) {
        setStatus("L'envoi n'a pas abouti. Merci de réessayer dans un instant, ou d'écrire directement par email.", "is-error");
      } finally {
        btn.disabled = false; btn.innerHTML = label;
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  initReveal();
  initPlaceholderToggle();
  initGalleryFilters();
  initLightbox();
  initForms();
});
