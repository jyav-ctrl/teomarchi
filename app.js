(function bootTeomarchiTheme() {
  try {
    const raw = localStorage.getItem("teomarchi.theme");
    const theme = raw ? JSON.parse(raw) : "dark";
    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
  } catch {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

const ENABLE_DEMO_DATA = false;

/*
  Configuration publique côté client.
  Firebase apiKey côté client n'est pas un secret : la sécurité doit venir des
  Firebase Authorized Domains, des Firestore Rules et des règles Auth.
  ne jamais mettre sk_live, ne jamais mettre sk_test, service account, webhook secret, whsec,
  token GitHub ou clé privée dans ce fichier. Stripe Checkout doit utiliser
  des Price IDs publics ou, idéalement, une Cloud Function pour créer la session.
*/
window.TEOMARCHI_CONFIG = window.TEOMARCHI_CONFIG || {
  firebase: {
    apiKey:            "AIzaSyAa41Fvf6TWt-yV-KANju7IIpXz3EG5nx0",
    authDomain:        "teomarchi-7eeae.firebaseapp.com",
    projectId:         "teomarchi-7eeae",
    storageBucket:     "teomarchi-7eeae.firebasestorage.app",
    messagingSenderId: "923051128049",
    appId:             "1:923051128049:web:c3efa3c59dde62cd2ae550",
    measurementId:     "G-S9T43WPBK8"
  },
  stripe: {
    publishableKey: "pk_live_51TUEOL3WxFY8ACg4Vy8sPX1sGHjMa6FW3vU5zWzaTFcNmb2dEG3wdFr3WLDaoptcuIobqe5GdJMyc3PbbdCWUOYc004byVd23R",
    priceIds: {
      studio: "id_de_ton_produit_stripe",
      agence: "id_de_ton_produit_stripe_agence"
    },
    paymentLinks: {
      studio: "https://buy.stripe.com/4gMaEQ7S72TD1YM8Sg1RC04",
      agence: "https://buy.stripe.com/4gM6oAegvfGp9re3xW1RC02"
    }
  }
};

window.TEOMARCHI_OPEN_LOGIN = window.TEOMARCHI_OPEN_LOGIN || (() => {
  document.dispatchEvent(new CustomEvent("teomarchi:open-login"));
});

(function () {
    "use strict";

    /* ── Config ───────────────────────────────────────────────── */
    const STORAGE = {
      theme:   "teomarchi.theme",
      session: "teomarchi.session"
    };

    const MODULES = [
      /* ── Modules dans la sidebar ── */
      { id: "atlas",      label: "Atlas"      },
      { id: "chronos",    label: "Chronos"    },
      { id: "pantheon",   label: "Panthéon"   },
      { id: "fiches",     label: "Fiches"     },
      { id: "etudes",     label: "Études"     },
      { id: "outils",     label: "Outils"     },
      { id: "journalier", label: "Journalier" },
      { id: "showroom",   label: "Showroom"   },
      { id: "feed",       label: "Feed"       },
      /* ── Modules accédés via la navbar (hors sidebar) ── */
      { id: "profil",     label: "Profil",     noSidebar: true },
      { id: "messagerie", label: "Messagerie", noSidebar: true },
      { id: "admin",      label: "Admin",      noSidebar: true, hidden: true }
    ];

    /* Icônes SVG par module */
    const MODULE_ICONS = {
      atlas:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9"/></svg>`,
      chronos:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
      pantheon:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18M5 20V10M19 20V10M9 20V10M15 20V10M12 4l8 6H4l8-6z"/></svg>`,
      fiches:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>`,
      etudes:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
      outils:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
      journalier: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>`,
      showroom:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/></svg>`,
      feed:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
      profil:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
      messagerie: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>`,
      admin:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`
    };

    const METRICS = [
      { value: "10", label: "Modules"        },
      { value: "6",  label: "Fiches matières"},
      { value: "5",  label: "Phases PRO"     },
      { value: "1",  label: "Bouclier légal" }
    ];

    /* ── Utilitaires ──────────────────────────────────────────── */
    const $  = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const store = {
      get (key, fallback = null) {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
        catch { return fallback; }
      },
      set (key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
      },
      remove (key) {
        try { localStorage.removeItem(key); } catch {}
      }
    };

    const normalize = str =>
      String(str ?? "").toLowerCase()
        .normalize("NFD").replace(/[̀-ͯ]/g, "");

    /* ── État ─────────────────────────────────────────────────── */
    let currentModule = "atlas";

    /* ── Thème ────────────────────────────────────────────────── */
    function applyTheme (theme) {
      document.documentElement.setAttribute("data-theme", theme);
    }

    function toggleTheme () {
      const next = document.documentElement.getAttribute("data-theme") === "dark"
        ? "light" : "dark";
      applyTheme(next);
      store.set(STORAGE.theme, next);
    }

    /* ── Sidebar ──────────────────────────────────────────────── */
    function buildTabs () {
      const container = $("#sidebar-nav");
      if (!container) return;
      container.innerHTML = MODULES.filter(m => !m.noSidebar).map(m =>
        `<button
          class="sidebar-item nav-tab${m.hidden ? " tm-admin-tab" : ""}"
          type="button"
          role="tab"
          id="tab-${m.id}"
          data-nav="${m.id}"
          aria-selected="false"
          aria-controls="module-${m.id}"
          ${m.hidden ? 'style="display:none"' : ""}
        >${MODULE_ICONS[m.id] || ""}<span>${m.label}</span></button>`
      ).join("");
    }

    function syncTabs (activeId) {
      $$(".sidebar-item, .nav-tab").forEach(btn => {
        const active = btn.dataset.nav === activeId;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", String(active));
      });
    }

    /* ── Métriques ────────────────────────────────────────────── */
    function buildMetrics () {
      const bar = $("#metrics-bar");
      if (!bar) return;
      bar.innerHTML = METRICS.map(m =>
        `<div class="metric">
          <span class="metric__value">${m.value}</span>
          <span class="metric__label">${m.label}</span>
        </div>`
      ).join("");
    }

    /* ── Navigation ───────────────────────────────────────────── */
    function resolveHash () {
      const hash = location.hash.replace("#", "").trim();
      return MODULES.some(m => m.id === hash) ? hash : "atlas";
    }

    function navigateTo (moduleId, pushHistory = true) {
      if (!MODULES.some(m => m.id === moduleId)) moduleId = "atlas";
      currentModule = moduleId;

      /* Modules : afficher le courant, masquer les autres */
      $$(".module").forEach(section => {
        section.classList.toggle("is-active", section.dataset.module === moduleId);
      });

      /* Hero visible uniquement sur Atlas */
      const hero = $("#hero");
      if (hero) hero.style.display = moduleId === "atlas" ? "" : "none";

      syncTabs(moduleId);

      if (pushHistory && location.hash !== "#" + moduleId) {
        history.pushState(null, "", "#" + moduleId);
      }

      /* Scroll vers la zone de vue */
      $("#view")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    /* ── Session ──────────────────────────────────────────────── */
    function syncSessionBtn () {
      const session = store.get(STORAGE.session);
      const label   = $("#session-label");
      if (label) label.textContent = session ? session.grade + " connecté" : "Session";
    }

    function toggleSession () {
      if (store.get(STORAGE.session)) {
        store.remove(STORAGE.session);
      } else {
        window.TEOMARCHI_OPEN_LOGIN?.();
      }
      syncSessionBtn();
    }

    /* ── Recherche (stub — logique complète en phase 2) ───────── */
    function getSearchUsers () {
      const feed = typeof DATA_FEED !== "undefined" && Array.isArray(DATA_FEED)
        ? DATA_FEED
        : [];

      return feed.map(p => ({
        slug:  p.slug,
        name:  p.auteur,
        role:  p.role,
        init:  p.initiales
      }));
    }

    function handleSearch (e) {
      const q       = normalize(e.target.value.trim());
      const results = $("#search-results");
      if (!results) return;

      if (!q) {
        results.classList.remove("is-open");
        results.innerHTML = "";
        return;
      }

      const modMatches  = MODULES
        .filter(m => normalize(m.label).includes(q))
        .slice(0, 4);

      const userMatches = getSearchUsers()
        .filter(u => normalize(u.name).includes(q) || normalize(u.role).includes(q))
        .slice(0, 3);

      const modHTML = modMatches.map(m =>
        `<button class="result-item" type="button" data-result="${m.id}">
          <strong>${m.label}</strong>
          <span>Module · ${m.id}</span>
        </button>`
      ).join("");

      const userHTML = userMatches.map(u =>
        `<button class="result-item" type="button" data-user-slug="${u.slug}"
                 style="display:flex;align-items:center;gap:.62rem">
          <span style="width:26px;height:26px;border-radius:50%;background:rgba(201,169,110,.15);
                       border:0.5px solid rgba(201,169,110,.32);display:grid;place-items:center;
                       font-size:.6rem;font-weight:600;color:var(--gold);flex-shrink:0">${u.init}</span>
          <span>
            <strong>${u.name}</strong>
            <span style="display:block;font-size:.65rem">${u.role}</span>
          </span>
        </button>`
      ).join("");

      if (!modMatches.length && !userMatches.length) {
        results.innerHTML = `<div class="result-item">
          <strong>Aucun résultat</strong>
          <span>Essayez : Atlas, Chronos, Fiches, PMR…</span>
        </div>`;
      } else {
        results.innerHTML =
          (userMatches.length ? `<div style="padding:.3rem .75rem .15rem;font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">Membres</div>` + userHTML : "") +
          (modMatches.length  ? `<div style="padding:.3rem .75rem .15rem;font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)">Modules</div>`  + modHTML  : "");
      }

      results.classList.add("is-open");
    }

    /* ── Volet légal SPA ─────────────────────────────────────── */
    function syncLegalNav (sectionId) {
      $$(".legal-slider-nav__item").forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.legalJump === sectionId);
      });
    }

    function jumpLegalSection (sectionId = "mentions") {
      const target = document.getElementById(sectionId);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      syncLegalNav(sectionId);
    }

    function openLegalSlider (sectionId = "mentions") {
      const panel = $("#legal-slider");
      if (!panel) return;
      const sheet = $(".sliding-panel__sheet", panel);
      if (!sheet) return;

      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      document.body.classList.add("has-open-panel");
      sheet.focus({ preventScroll: true });
      setTimeout(() => jumpLegalSection(sectionId), 120);
    }

    function closeLegalSlider () {
      const panel = $("#legal-slider");
      if (!panel) return;

      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      document.body.classList.remove("has-open-panel");
    }

    /* ── Événements globaux ───────────────────────────────────── */
    function bindEvents () {
      /* Clics délégués : navigation, thème, session, recherche, légal. */
      document.addEventListener("click", e => {
        const legalClose = e.target.closest("[data-legal-close]");
        if (legalClose) {
          e.preventDefault();
          closeLegalSlider();
          return;
        }

        const legalOpen = e.target.closest("[data-legal-open]");
        if (legalOpen) {
          e.preventDefault();
          openLegalSlider(legalOpen.dataset.legalSection || "mentions");
          return;
        }

        const legalJump = e.target.closest("[data-legal-jump]");
        if (legalJump) {
          e.preventDefault();
          jumpLegalSection(legalJump.dataset.legalJump);
          return;
        }

        const result = e.target.closest("[data-result]");
        if (result) {
          const results = $("#search-results");
          const input = $("#global-search");
          if (results) results.classList.remove("is-open");
          if (input) input.value = "";
          navigateTo(result.dataset.result);
          return;
        }

        const userResult = e.target.closest("[data-user-slug]");
        if (userResult) {
          const results = $("#search-results");
          const input = $("#global-search");
          if (results) results.classList.remove("is-open");
          if (input) input.value = "";
          window.open(`profil-public.html?user=${userResult.dataset.userSlug}`, "_blank");
          return;
        }

        const external = e.target.closest("[data-external-url]");
        if (external) {
          e.preventDefault();
          window.open(external.dataset.externalUrl, "_blank", "noopener");
          return;
        }

        const themeBtn = e.target.closest("#theme-toggle");
        if (themeBtn) {
          e.preventDefault();
          toggleTheme();
          return;
        }

        const sessionBtn = e.target.closest("#session-btn");
        if (sessionBtn) {
          e.preventDefault();
          toggleSession();
          if (currentModule === "profil") navigateTo("profil", false);
          return;
        }

        const navEl = e.target.closest("[data-nav]");
        if (navEl) { e.preventDefault(); navigateTo(navEl.dataset.nav); }
      });

      /* Recherche */
      $("#global-search")?.addEventListener("input", handleSearch);

      /* Fermer résultats au clic hors recherche */
      document.addEventListener("click", e => {
        if (!e.target.closest(".search-wrap"))
          $("#search-results")?.classList.remove("is-open");
      });

      /* Bloquer clic-droit sur images protégées */
      document.addEventListener("contextmenu", e => {
        if (e.target.closest("[data-protected]")) e.preventDefault();
      });

      /* Navigation navigateur arrière/avant */
      window.addEventListener("popstate", () => navigateTo(resolveHash(), false));
      window.addEventListener("keydown", e => {
        if (e.key === "Escape") closeLegalSlider();
      });
    }

    /* ── Curseur custom ──────────────────────────────────────── */
    function initCursor () {
      if (window.matchMedia("(max-width: 767px)").matches) return;
      if (window.matchMedia("(pointer: coarse)").matches)  return;

      const dot     = document.getElementById("cursor-dot");
      const outline = document.getElementById("cursor-outline");
      if (!dot || !outline) return;

      let ox = 0, oy = 0, rafId;

      window.addEventListener("mousemove", e => {
        const x = e.clientX, y = e.clientY;
        dot.style.opacity = "1";
        outline.style.opacity = "1";
        dot.style.left = x + "px";
        dot.style.top  = y + "px";

        cancelAnimationFrame(rafId);
        function ease () {
          ox += (x - ox) * 0.14;
          oy += (y - oy) * 0.14;
          outline.style.left = ox + "px";
          outline.style.top  = oy + "px";
          if (Math.abs(x - ox) > 0.3 || Math.abs(y - oy) > 0.3)
            rafId = requestAnimationFrame(ease);
        }
        rafId = requestAnimationFrame(ease);
      });

      /* Hover sur cliquables */
      document.addEventListener("mouseover", e => {
        if (e.target.closest("a, button, [data-nav], input, select, textarea, [role='tab']"))
          document.body.classList.add("cursor-hover");
      });
      document.addEventListener("mouseout", e => {
        if (e.target.closest("a, button, [data-nav], input, select, textarea, [role='tab']"))
          document.body.classList.remove("cursor-hover");
      });

      /* Feedback clic */
      document.addEventListener("mousedown", () => document.body.classList.add("cursor-click"));
      document.addEventListener("mouseup",   () => document.body.classList.remove("cursor-click"));

      /* Quitter la fenêtre */
      document.addEventListener("mouseleave", () => {
        dot.style.opacity = "0";
        outline.style.opacity = "0";
      });
      document.addEventListener("mouseenter", () => {
        dot.style.opacity = "1";
        outline.style.opacity = "1";
      });
    }

    /* ── Initialisation ───────────────────────────────────────── */
    function init () {
      const run = (name, fn) => { try { fn(); } catch(e) { /* silencieux en prod */ } };
      run("applyTheme",   () => applyTheme(store.get(STORAGE.theme, "dark")));
      run("buildTabs",    buildTabs);
      run("buildMetrics", buildMetrics);
      run("syncSession",  syncSessionBtn);
      run("navigate",     () => navigateTo(resolveHash(), false));
      run("bindEvents",   bindEvents);
      run("cursor",       initCursor);
    }

    window.navigateTo  = navigateTo;
    window.toggleTheme = toggleTheme;

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();

/* ── CSS responsive Journalier (injecté une fois) ─────────────── */
  (function injectJournalierCSS() {
    if (document.getElementById("tm-journalier-css")) return;
    const s = document.createElement("style");
    s.id = "tm-journalier-css";
    s.textContent = `
      #journalier-layout,
      .tm-journalier {
        min-width: 0;
        max-width: 100%;
        overflow-x: hidden;
      }
      .tm-journalier {
        display: grid;
        gap: 1rem;
        isolation: isolate;
      }
      .tm-journalier *,
      .tm-journalier *::before,
      .tm-journalier *::after { box-sizing: border-box; min-width: 0; }
      .tm-journalier button,
      .tm-journalier input,
      .tm-journalier select,
      .tm-journalier textarea {
        pointer-events: auto;
        touch-action: manipulation;
      }
      .tm-journalier-nav {
        display: flex;
        gap: .42rem;
        overflow-x: auto;
        padding: .2rem .05rem .35rem;
        scrollbar-width: thin;
      }
      .tm-journalier-tab {
        flex: 0 0 auto;
        border: var(--border);
        border-radius: var(--r-pill);
        background: color-mix(in srgb, var(--surface-2) 54%, transparent);
        color: var(--muted);
        padding: .46rem .78rem;
        font-size: .62rem;
        letter-spacing: .1em;
        text-transform: uppercase;
        cursor: pointer;
        transition: background .18s ease, color .18s ease, border-color .18s ease;
      }
      .tm-journalier-tab:hover,
      .tm-journalier-tab.is-active {
        color: var(--gold);
        border-color: rgba(201,169,110,.36);
        background: rgba(201,169,110,.1);
      }
      .tm-journalier-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.35fr) minmax(300px, .65fr);
        gap: 1rem;
        align-items: start;
      }
      .tm-journalier-stack { display: grid; gap: 1rem; }
      .tm-journalier-kpis {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: .72rem;
      }
      .tm-journalier-kpi {
        border: var(--border);
        border-radius: var(--r-md);
        padding: .9rem 1rem;
        background: color-mix(in srgb, var(--surface-2) 60%, transparent);
      }
      .tm-journalier-kpi strong {
        display: block;
        font-family: var(--serif);
        font-size: clamp(1.6rem, 4vw, 2.6rem);
        font-weight: 300;
        line-height: 1;
        color: var(--gold);
      }
      .tm-journalier-kpi span,
      .tm-journalier-muted {
        color: var(--muted);
        font-size: .68rem;
        line-height: 1.55;
      }
      .tm-journalier-panel {
        display: grid;
        gap: .86rem;
      }
      .tm-journalier-panel-head {
        display: flex;
        justify-content: space-between;
        align-items: end;
        gap: 1rem;
        flex-wrap: wrap;
        padding-bottom: .72rem;
        border-bottom: var(--border);
      }
      .tm-journalier-eyebrow {
        margin: 0 0 .18rem;
        color: var(--gold);
        font-size: .58rem;
        letter-spacing: .17em;
        text-transform: uppercase;
      }
      .tm-journalier-title {
        margin: 0;
        font-family: var(--serif);
        font-size: clamp(1.35rem, 3.2vw, 2rem);
        font-weight: 300;
        line-height: 1;
        color: var(--ink);
      }
      .tm-journalier-projects {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: .72rem;
      }
      .tm-journalier-project-card {
        display: grid;
        gap: .5rem;
        text-align: left;
        border: var(--border);
        border-radius: var(--r-md);
        background: color-mix(in srgb, var(--surface-2) 58%, transparent);
        padding: .92rem;
        color: var(--ink);
        cursor: pointer;
        transition: transform .18s ease, border-color .18s ease, background .18s ease;
      }
      .tm-journalier-project-card:hover,
      .tm-journalier-project-card.is-active {
        transform: translateY(-1px);
        border-color: rgba(201,169,110,.42);
        background: rgba(201,169,110,.07);
      }
      .tm-journalier-chip,
      .tm-journalier-pill {
        display: inline-flex;
        align-items: center;
        width: fit-content;
        gap: .28rem;
        padding: .16rem .48rem;
        border: var(--border);
        border-radius: var(--r-pill);
        color: var(--muted);
        font-size: .58rem;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .tm-journalier-form,
      .tm-journalier-task-form,
      .tm-journalier-deadline-form {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: .68rem;
      }
      .tm-journalier .field {
        align-items: stretch;
        flex-direction: column;
        gap: .32rem;
        min-height: 0;
        padding: .62rem .72rem;
        background: color-mix(in srgb, var(--surface-2) 62%, transparent);
      }
      .tm-journalier .field > span {
        color: var(--muted);
        font-size: .58rem;
        letter-spacing: .12em;
        line-height: 1;
        text-transform: uppercase;
      }
      .tm-journalier .field input,
      .tm-journalier .field select,
      .tm-journalier .field textarea {
        width: 100%;
      }
      .tm-journalier-form textarea {
        width: 100%;
        min-height: 82px;
        resize: vertical;
        border: var(--border);
        border-radius: var(--r-sm);
        background: var(--surface-2);
        color: var(--ink);
        padding: .7rem .8rem;
        font: inherit;
      }
      .tm-journalier-form .is-wide,
      .tm-journalier-task-form .is-wide,
      .tm-journalier-deadline-form .is-wide { grid-column: 1 / -1; }
      .tm-journalier-list,
      .tm-journalier-deadline-list {
        display: grid;
        gap: .5rem;
      }
      .tm-journalier-task,
      .tm-journalier-deadline {
        display: grid;
        gap: .42rem;
        border: var(--border);
        border-radius: var(--r-md);
        background: color-mix(in srgb, var(--surface-2) 50%, transparent);
        padding: .78rem .86rem;
        transition: border-color .18s ease, background .18s ease;
      }
      .tm-journalier-task[draggable="true"] { cursor: grab; }
      .tm-journalier-task:hover,
      .tm-journalier-deadline:hover {
        border-color: rgba(201,169,110,.28);
        background: rgba(201,169,110,.045);
      }
      .tm-journalier-task-line {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        gap: .62rem;
        align-items: start;
      }
      .tm-journalier-task-line input[type="checkbox"] {
        width: 16px;
        height: 16px;
        margin-top: .16rem;
        accent-color: var(--gold);
      }
      .tm-journalier-calendar {
        display: grid;
        gap: .45rem;
      }
      .tm-journalier-calendar-mode {
        display: flex;
        align-items: center;
        gap: .38rem;
        flex-wrap: wrap;
      }
      .tm-journalier-calendar-mode .tm-journalier-tab {
        padding-inline: .6rem;
      }
      .tm-journalier-calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 3px;
      }
      .tm-journalier-day,
      .tm-journalier-day-head {
        min-height: 42px;
        border-radius: 8px;
        padding: .34rem .22rem;
        text-align: center;
      }
      .tm-journalier-day-head {
        min-height: auto;
        color: var(--muted);
        font-size: .54rem;
        letter-spacing: .14em;
        text-transform: uppercase;
      }
      .tm-journalier-day {
        width: 100%;
        display: grid;
        align-content: start;
        gap: .24rem;
        border: 0.5px solid transparent;
        background: transparent;
        color: var(--ink-2);
        cursor: pointer;
        text-align: left;
        transition: background .16s ease, border-color .16s ease;
      }
      .tm-journalier-day > span:first-child {
        font-family: var(--mono);
        font-size: .68rem;
        color: inherit;
      }
      .tm-journalier-day.is-muted {
        visibility: hidden;
        pointer-events: none;
      }
      .tm-journalier-day.is-today {
        color: var(--gold);
        background: var(--gold-dim);
        border-color: rgba(201,169,110,.34);
      }
      .tm-journalier-day.has-items {
        background: rgba(201,169,110,.055);
        border-color: rgba(201,169,110,.22);
      }
      .tm-journalier-day.is-drop {
        outline: 1px dashed rgba(201,169,110,.6);
        outline-offset: -3px;
      }
      .tm-journalier-cal-item {
        display: block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--gold);
        font-size: .52rem;
        line-height: 1.25;
      }
      .tm-journalier-empty {
        border: 1px dashed rgba(201,169,110,.24);
        border-radius: var(--r-md);
        padding: 1.1rem;
        background: rgba(201,169,110,.035);
      }
      .tm-journalier-empty p {
        margin: .24rem 0 0;
        color: var(--muted);
        font-size: .74rem;
      }
      .tm-journalier-progress-track {
        height: 3px;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(245,245,241,.08);
      }
      .tm-journalier-progress-track span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--gold);
        transition: width .24s ease;
      }
      .tm-journalier-subtasks {
        display: flex;
        flex-wrap: wrap;
        gap: .35rem;
      }
      .tm-journalier-subtasks span {
        border: var(--border);
        border-radius: var(--r-pill);
        padding: .12rem .42rem;
        color: var(--muted);
        font-size: .58rem;
      }
      .tm-journalier-subtasks span.is-done {
        color: var(--ok);
        border-color: rgba(90,154,106,.34);
      }
      @media (max-width: 1100px) {
        .tm-journalier-grid,
        .tm-journalier-projects { grid-template-columns: 1fr; }
        .tm-journalier-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 680px) {
        .tm-journalier-kpis,
        .tm-journalier-form,
        .tm-journalier-task-form,
        .tm-journalier-deadline-form { grid-template-columns: 1fr; }
        .tm-journalier-task-line { grid-template-columns: auto minmax(0, 1fr); }
      }
    `;
    document.head.appendChild(s);
  })();

  /* ── Données statiques ─────────────────────────────────────────── */
  const JOURNALIER_PROJECT_TYPES = [
    { id: "personnel", label: "Projet Personnel", tag: "PERSO", color: "#C9A96E" },
    { id: "cours",     label: "Projet Cours",     tag: "COURS", color: "#8FA6C9" },
    { id: "travail",   label: "Projet Travail",   tag: "PRO",   color: "#8CBF9F" }
  ];

  const JOURNALIER_EMPTY_PROJECT = {
    title: "",
    color: "",
    tag: "",
    deadline: "",
    notes: "",
    status: "a-definir",
    priority: "normal",
    tasks: [],
    deadlines: [],
    updatedAt: null
  };

  const _MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août",
                      "Septembre","Octobre","Novembre","Décembre"];

  /* ── TEOMARCHI_APP : Persistance Globale ───────────────────────── */
  const TEOMARCHI_APP = (() => {
    const P = "teomarchi.";

    const _ls = {
      get: (k, fb = null) => { try { return JSON.parse(localStorage.getItem(P + k)) ?? fb; } catch { return fb; } },
      set: (k, v)         => { try { localStorage.setItem(P + k, JSON.stringify(v)); }        catch {}              },
      del: (k)            => { try { localStorage.removeItem(P + k); }                         catch {}              }
    };

    const _cbs  = {};
    const _emit = k => (_cbs[k] || []).forEach(fn => fn(_ls.get(k)));

    const _uid = prefix =>
      prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);

    const _clampProgress = value => {
      const n = Number(value);
      if (!Number.isFinite(n)) return 0;
      return Math.max(0, Math.min(100, Math.round(n)));
    };

    const _makeSubtask = item => ({
      id: item?.id || _uid("subtask"),
      label: String(item?.label || "").trim(),
      done: Boolean(item?.done)
    });

    const _makeTask = task => {
      const subtasks = Array.isArray(task?.subtasks)
        ? task.subtasks.map(_makeSubtask).filter(item => item.label)
        : [];
      const done = Boolean(task?.done);
      const progress = subtasks.length
        ? Math.round(subtasks.filter(item => item.done).length / subtasks.length * 100)
        : done ? 100 : _clampProgress(task?.progress);

      return {
        id:        task?.id || _uid("task"),
        label:     String(task?.label || "").trim(),
        detail:    String(task?.detail || "").trim(),
        done:      progress >= 100 || done,
        priority:  task?.priority || "normal",
        deadline:  task?.deadline || "",
        subtasks,
        progress,
        createdAt: task?.createdAt || new Date().toISOString(),
        custom:    task?.custom !== false
      };
    };

    const _makeDeadline = item => ({
      id:        item?.id || _uid("deadline"),
      label:     String(item?.label || item?.nom || item?.code || "").trim(),
      deadline:  item?.deadline || "",
      note:      String(item?.note || item?.detail || "").trim(),
      priority:  item?.priority || "normal",
      createdAt: item?.createdAt || new Date().toISOString(),
      custom:    item?.custom !== false
    });

    const _projectType = type =>
      JOURNALIER_PROJECT_TYPES.some(t => t.id === type) ? type : "cours";

    const _defaultProject = type => {
      const meta = JOURNALIER_PROJECT_TYPES.find(t => t.id === type) || JOURNALIER_PROJECT_TYPES[1];
      return {
        ...JOURNALIER_EMPTY_PROJECT,
        color: meta.color,
        tag: meta.tag,
        type
      };
    };

    const _normalizeProject = (type, project = {}) => {
      const fallback = _defaultProject(type);
      const tasks = Array.isArray(project.tasks)
        ? project.tasks.map(_makeTask).filter(task => task.label)
        : [];
      const deadlines = Array.isArray(project.deadlines)
        ? project.deadlines.map(_makeDeadline).filter(item => item.label || item.deadline)
        : [];

      return {
        title: String(project.title || "").trim(),
        color: project.color || fallback.color,
        tag: project.tag || fallback.tag,
        deadline: project.deadline || "",
        notes: String(project.notes || "").trim(),
        status: project.status || fallback.status,
        priority: project.priority || fallback.priority,
        tasks,
        deadlines,
        updatedAt: project.updatedAt || null
      };
    };

    const _normalizeJournalier = state => {
      const activeProjectType = _projectType(state?.activeProjectType);
      const projects = {};
      JOURNALIER_PROJECT_TYPES.forEach(type => {
        projects[type.id] = _normalizeProject(type.id, state?.projects?.[type.id]);
      });
      return { activeProjectType, projects };
    };

    const _readJournalier = () => _normalizeJournalier(_ls.get("journalier", null));

    const _writeJournalier = state => {
      const next = _normalizeJournalier(state);
      const active = next.projects[next.activeProjectType];
      if (active) active.updatedAt = new Date().toISOString();
      _ls.set("journalier", next);
      _emit("journalier");
      return next;
    };

    const _readJournal = () => {
      const s = _ls.get("journal", {});
      return {
        checklist: Array.isArray(s.checklist) ? s.checklist : [],
        logs:      s.logs      || [],
        materials: s.materials || [],
        products:  s.products  || [],
        updatedAt: s.updatedAt || null
      };
    };

    const _writeJournal = j => {
      j.updatedAt = new Date().toISOString();
      _ls.set("journal", j);
      _emit("journal");
    };

    return {
      /* Abonnement réactif : TEOMARCHI_APP.on("journal", fn) */
      on: (key, fn) => { _cbs[key] = _cbs[key] || []; _cbs[key].push(fn); },

      theme: {
        get: ()  => _ls.get("theme", "dark"),
        set: (v) => { _ls.set("theme", v); _emit("theme"); }
      },

      session: {
        get:   ()  => _ls.get("session"),
        set:   (v) => { _ls.set("session", v); _emit("session"); },
        clear: ()  => { _ls.del("session");    _emit("session"); }
      },

      journalier: {
        get: _readJournalier,
        set: _writeJournalier,

        setActiveProjectType: type => {
          const j = _readJournalier();
          j.activeProjectType = _projectType(type);
          return _writeJournalier(j);
        },

        updateProject: patch => {
          const j = _readJournalier();
          const project = j.projects[j.activeProjectType];
          if (project) {
            project.title = String(patch?.title ?? project.title ?? "").trim();
            project.deadline = patch?.deadline ?? project.deadline ?? "";
            project.notes = String(patch?.notes ?? project.notes ?? "").trim();
            project.status = patch?.status || project.status || "a-definir";
            project.priority = patch?.priority || project.priority || "normal";
          }
          return _writeJournalier(j);
        },

        updateTitle: title => {
          const j = _readJournalier();
          const project = j.projects[j.activeProjectType];
          if (project) project.title = String(title || "").trim();
          return _writeJournalier(j);
        },

        addTask: ({ label, detail = "", deadline = "", priority = "normal", subtasks = [] }) => {
          if (!String(label || "").trim()) return null;
          const j = _readJournalier();
          const project = j.projects[j.activeProjectType];
          if (!project) return null;
          const task = _makeTask({ label, detail, deadline, priority, subtasks, custom: true });
          project.tasks.push(task);
          _writeJournalier(j);
          return task.id;
        },

        toggleTask: id => {
          const j = _readJournalier();
          const project = j.projects[j.activeProjectType];
          const task = project?.tasks.find(item => item.id === id);
          if (!task) return false;
          task.done = !task.done;
          task.progress = task.done ? 100 : 0;
          _writeJournalier(j);
          return task.done;
        },

        updateTaskDeadline: (id, deadline) => {
          const j = _readJournalier();
          const project = j.projects[j.activeProjectType];
          const task = project?.tasks.find(item => item.id === id);
          if (!task) return false;
          task.deadline = deadline || "";
          _writeJournalier(j);
          return true;
        },

        removeTask: id => {
          const j = _readJournalier();
          const project = j.projects[j.activeProjectType];
          if (!project?.tasks.find(item => item.id === id)) return;
          project.tasks = project.tasks.filter(item => item.id !== id);
          _writeJournalier(j);
        },

        addDeadline: ({ label, deadline, note = "", priority = "normal" }) => {
          if (!String(label || "").trim() || !deadline) return null;
          const j = _readJournalier();
          const project = j.projects[j.activeProjectType];
          if (!project) return null;
          const item = _makeDeadline({ label, deadline, note, priority, custom: true });
          project.deadlines.push(item);
          _writeJournalier(j);
          return item.id;
        },

        removeDeadline: id => {
          const j = _readJournalier();
          const project = j.projects[j.activeProjectType];
          if (!project?.deadlines.find(item => item.id === id)) return;
          project.deadlines = project.deadlines.filter(item => item.id !== id);
          _writeJournalier(j);
        }
      },

      journal: {
        get: _readJournal,
        set: _writeJournal,

        addLog: entry => {
          const j = _readJournal();
          j.logs.unshift({ ...entry, date: new Date().toISOString() });
          _writeJournal(j);
        },

        toggleCheck: id => {
          const j   = _readJournal();
          const itm = j.checklist.find(c => c.id === id);
          if (itm) { itm.done = !itm.done; _writeJournal(j); }
          return itm?.done ?? false;
        },

        addTask: (label, detail = "") => {
          if (!label.trim()) return null;
          const j  = _readJournal();
          const id = "custom-" + Date.now();
          j.checklist.push({ id, label: label.trim(), detail, done: false, custom: true });
          _writeJournal(j);
          return id;
        },

        /* Protection : seules les tâches custom (ajoutées par l'utilisateur) sont supprimables */
        removeTask: id => {
          const j = _readJournal();
          if (!j.checklist.find(c => c.id === id && c.custom)) return;
          j.checklist = j.checklist.filter(c => c.id !== id);
          _writeJournal(j);
        }
      }
    };
  })();

  /* ── Helpers internes ──────────────────────────────────────────── */
  const _esc = str =>
    String(str ?? "").replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const _deadlineAsDate = value => {
    if (!value) return null;
    const raw = String(value);
    const date = new Date(raw.includes("T") ? raw : raw + "T12:00:00");
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const _formatDate = value => {
    const date = _deadlineAsDate(value);
    return date
      ? date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
      : "Sans date";
  };

  const _journalierState = () => TEOMARCHI_APP.journalier.get();

  const _journalierMeta = type =>
    JOURNALIER_PROJECT_TYPES.find(item => item.id === type) || JOURNALIER_PROJECT_TYPES[1];

  const _journalierProject = () => {
    const state = _journalierState();
    return state.projects[state.activeProjectType] || { ...JOURNALIER_EMPTY_PROJECT };
  };

  const _journalierTypeLabel = type => _journalierMeta(type)?.label || "Projet";

  const _progressValue = value => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0;
  };

  const _dateToKey = date =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const _deadlineKey = value => {
    const date = _deadlineAsDate(value);
    return date ? _dateToKey(date) : "";
  };

  const _taskProgress = task => {
    const subtasks = Array.isArray(task?.subtasks) ? task.subtasks : [];
    if (subtasks.length) return Math.round(subtasks.filter(item => item.done).length / subtasks.length * 100);
    return task?.done ? 100 : _progressValue(task?.progress);
  };

  const _projectProgress = project => {
    const tasks = Array.isArray(project?.tasks) ? project.tasks : [];
    if (!tasks.length) return 0;
    return Math.round(tasks.reduce((sum, task) => sum + _taskProgress(task), 0) / tasks.length);
  };

  const _completionRate = project => {
    const tasks = Array.isArray(project?.tasks) ? project.tasks : [];
    if (!tasks.length) return 0;
    return Math.round(tasks.filter(task => _taskProgress(task) >= 100).length / tasks.length * 100);
  };

  const _hasProjectContent = project =>
    Boolean(project?.title || project?.deadline || project?.notes || project?.tasks?.length || project?.deadlines?.length);

  const _priorityLabel = value => ({
    normal: "Normal",
    moyenne: "Moyenne",
    haute: "Haute",
    critique: "Critique"
  }[value] || "Normal");

  const _statusLabel = value => ({
    "a-definir": "À définir",
    actif: "Actif",
    pause: "En pause",
    termine: "Terminé"
  }[value] || "À définir");

  const _journalierDeadlines = (project, type = "") => {
    const meta = _journalierMeta(type);
    const projectDeadline = project?.deadline ? [{
      id: "project-" + (type || "active"),
      label: project.title || "Deadline globale",
      code: meta?.tag || "PROJET",
      deadline: project.deadline,
      note: "Deadline du projet",
      source: "project",
      priority: project.priority || "normal"
    }] : [];

    const fromTasks = (project?.tasks || [])
      .filter(task => task.deadline)
      .map(task => ({
        id: "task-" + task.id,
        taskId: task.id,
        label: task.label,
        code: "TASK",
        deadline: task.deadline,
        note: task.detail || "Tâche planifiée",
        source: "task",
        priority: task.priority || "normal"
      }));

    const explicit = (project?.deadlines || []).map(item => ({
      id: item.id,
      label: item.label,
      code: "DL",
      deadline: item.deadline,
      note: item.note,
      custom: item.custom,
      source: "deadline",
      priority: item.priority || "normal"
    }));

    return [...projectDeadline, ...explicit, ...fromTasks]
      .filter(item => item.label && _deadlineAsDate(item.deadline))
      .sort((a, b) => _deadlineAsDate(a.deadline) - _deadlineAsDate(b.deadline));
  };

  /* Calcule le délai humain et l'état sémantique d'une deadline */
  const _countdown = deadline => {
    const target = _deadlineAsDate(deadline);
    if (!target) return { text: "Sans date", state: "none" };
    const diff = target.getTime() - Date.now();
    const abs  = Math.abs(diff);
    const d    = Math.floor(abs / 86400000);
    const h    = Math.floor((abs % 86400000) / 3600000);
    if (diff < 0) return { text: `Dépassé · ${d}j ${h}h`,                         state: "past"   };
    if (d < 1)    return { text: `Aujourd'hui · ${h}h restante${h > 1 ? "s" : ""}`, state: "today"  };
    if (d < 8)    return { text: `${d}j ${h}h restant${d > 1 ? "s" : ""}`,          state: "soon"   };
    return               { text: `${d}j ${h}h`,                                    state: "future" };
  };

  /* Détermine le statut d'une phase selon sa deadline */
  const _phaseStatus = deadline => {
    const target = _deadlineAsDate(deadline);
    if (!target) return "À planifier";
    const diff = target.getTime() - Date.now();
    if (diff < -3600000)     return "Clôturé";
    if (diff < 7 * 86400000) return "En cours";
    return "À venir";
  };

  const _renderProgressTrack = (pct, label = "Progression") => `
    <div class="tm-journalier-progress-track" role="progressbar" aria-label="${_esc(label)}"
         aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
      <span style="width:${pct}%"></span>
    </div>
  `;

  const _renderPanelHead = (eyebrow, title, action = "") => `
    <div class="tm-journalier-panel-head">
      <div>
        <p class="tm-journalier-eyebrow">${_esc(eyebrow)}</p>
        <h3 class="tm-journalier-title">${_esc(title)}</h3>
      </div>
      ${action}
    </div>
  `;

  const _renderKpis = (state, project) => {
    const today = _dateToKey(new Date());
    const deadlines = _journalierDeadlines(project, state.activeProjectType);
    const todayTasks = (project.tasks || []).filter(task => _deadlineKey(task.deadline) === today);
    const upcoming = deadlines.filter(item => {
      const d = _deadlineAsDate(item.deadline);
      if (!d) return false;
      const diff = d.getTime() - Date.now();
      return diff >= -86400000 && diff <= 7 * 86400000;
    });
    const activeProjects = Object.values(state.projects || {}).filter(_hasProjectContent).length;
    const progress = _projectProgress(project);

    return `
      <div class="tm-journalier-kpis">
        <div class="tm-journalier-kpi">
          <strong>${progress}%</strong>
          <span>Avancement global</span>
        </div>
        <div class="tm-journalier-kpi">
          <strong>${todayTasks.length}</strong>
          <span>Tâche${todayTasks.length > 1 ? "s" : ""} du jour</span>
        </div>
        <div class="tm-journalier-kpi">
          <strong>${upcoming.length}</strong>
          <span>Deadline${upcoming.length > 1 ? "s" : ""} proche${upcoming.length > 1 ? "s" : ""}</span>
        </div>
        <div class="tm-journalier-kpi">
          <strong>${activeProjects}</strong>
          <span>Projet${activeProjects > 1 ? "s" : ""} actif${activeProjects > 1 ? "s" : ""}</span>
        </div>
      </div>
    `;
  };

  const _renderProjectForm = (state, project) => `
    <form id="journalier-project-form" class="tm-journalier-form" autocomplete="off">
      <label class="field">
        <span>Type de projet</span>
        <select name="type" id="journalier-project-type">
          ${JOURNALIER_PROJECT_TYPES.map(type => `
            <option value="${_esc(type.id)}" ${type.id === state.activeProjectType ? "selected" : ""}>
              ${_esc(type.label)}
            </option>
          `).join("")}
        </select>
      </label>
      <label class="field">
        <span>Nom du projet</span>
        <input id="journalier-project-title" name="title" type="text" value="${_esc(project.title)}"
               maxlength="90" placeholder="Nom du projet" />
      </label>
      <label class="field">
        <span>Deadline globale</span>
        <input name="deadline" type="date" value="${_esc(project.deadline)}" />
      </label>
      <label class="field">
        <span>Statut</span>
        <select name="status">
          ${["a-definir","actif","pause","termine"].map(value => `
            <option value="${value}" ${project.status === value ? "selected" : ""}>${_esc(_statusLabel(value))}</option>
          `).join("")}
        </select>
      </label>
      <label class="field">
        <span>Priorité</span>
        <select name="priority">
          ${["normal","moyenne","haute","critique"].map(value => `
            <option value="${value}" ${project.priority === value ? "selected" : ""}>${_esc(_priorityLabel(value))}</option>
          `).join("")}
        </select>
      </label>
      <label class="field is-wide">
        <span>Notes</span>
        <textarea name="notes" maxlength="600" placeholder="Notes de projet, contraintes, livrables...">${_esc(project.notes)}</textarea>
      </label>
      <button type="submit" class="text-btn text-btn--primary" data-journalier-action="save-project">Enregistrer</button>
    </form>
  `;

  const _renderDashboard = (state, project) => {
    const typeLabel = _journalierTypeLabel(state.activeProjectType);
    const progress = _projectProgress(project);
    const title = project.title || "Aucun titre défini";

    return `
      <section id="journalier-dashboard" class="card tm-journalier-panel">
        ${_renderPanelHead("Dashboard", "Pilotage du projet")}
        <div>
          <p class="tm-journalier-muted" style="margin:0 0 .28rem">${_esc(typeLabel)}</p>
          <h2 style="margin:0;font-family:var(--serif);font-size:clamp(2rem,5vw,3.4rem);font-weight:300;line-height:.96;color:var(--ink)">
            ${_esc(title)}
          </h2>
        </div>
        <div id="journalier-progress">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:1rem;margin-bottom:.55rem">
            <span class="tm-journalier-muted">Progression consolidée</span>
            <strong style="font-family:var(--serif);font-size:2.4rem;font-weight:300;line-height:1;color:var(--gold)">${progress}%</strong>
          </div>
          ${_renderProgressTrack(progress, "Progression globale du projet")}
        </div>
        ${!_hasProjectContent(project) ? `
          <div class="tm-journalier-empty">
            <strong>Vue vide</strong>
            <p>Créez un projet, ajoutez une première tâche ou posez une deadline pour commencer le suivi.</p>
          </div>
        ` : ""}
        ${_renderKpis(state, project)}
        ${_renderProjectForm(state, project)}
      </section>
    `;
  };

  const _renderProjectCards = state => `
    <div class="tm-journalier-projects">
      ${JOURNALIER_PROJECT_TYPES.map(type => {
        const project = state.projects[type.id] || {};
        const progress = _projectProgress(project);
        const count = (project.tasks || []).length + (project.deadlines || []).length + (project.deadline ? 1 : 0);
        const active = type.id === state.activeProjectType;
        return `
          <button type="button"
                  class="tm-journalier-project-card ${active ? "is-active" : ""}"
                  data-journalier-project="${_esc(type.id)}"
                  style="--project-color:${_esc(type.color)}">
            <span class="tm-journalier-chip" style="border-color:${_esc(type.color)}55;color:${_esc(type.color)}">${_esc(type.tag)}</span>
            <strong>${_esc(project.title || "Aucun projet créé")}</strong>
            <span class="tm-journalier-muted">${_esc(type.label)} · ${count} élément${count > 1 ? "s" : ""}</span>
            ${_renderProgressTrack(progress, "Progression " + type.label)}
          </button>
        `;
      }).join("")}
    </div>
  `;

  const _calendarItemsByDate = (project, type) => {
    const map = {};
    _journalierDeadlines(project, type).forEach(item => {
      const key = _deadlineKey(item.deadline);
      if (!key) return;
      map[key] = map[key] || [];
      map[key].push(item);
    });
    return map;
  };

  const _renderCalendarItem = item => `
    <span class="tm-journalier-cal-item" title="${_esc(item.label)}">${_esc(item.label)}</span>
  `;

  let _calState = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    view: "month"
  };

  const _renderCalendarCells = (project, type) => {
    const { year, month, view } = _calState;
    const today = new Date();
    const todayKey = _dateToKey(today);
    const itemsByDate = _calendarItemsByDate(project, type);

    const makeCell = date => {
      const key = _dateToKey(date);
      const dayItems = itemsByDate[key] || [];
      const isToday = key === todayKey;
      return `
        <button type="button"
                class="tm-journalier-day ${isToday ? "is-today" : ""} ${dayItems.length ? "has-items" : ""}"
                data-journalier-date="${key}"
                aria-label="${_esc(`Planifier au ${_formatDate(key)}`)}">
          <span>${date.getDate()}</span>
          ${dayItems.slice(0, 2).map(_renderCalendarItem).join("")}
          ${dayItems.length > 2 ? `<small>+${dayItems.length - 2}</small>` : ""}
        </button>
      `;
    };

    if (view === "week") {
      const base = new Date(year, month, Math.min(today.getDate(), new Date(year, month + 1, 0).getDate()));
      const day = base.getDay() || 7;
      base.setDate(base.getDate() - day + 1);
      const cells = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(base);
        date.setDate(base.getDate() + i);
        return makeCell(date);
      });
      return cells.join("");
    }

    const first = new Date(year, month, 1);
    const total = new Date(year, month + 1, 0).getDate();
    let offset = first.getDay() - 1;
    if (offset < 0) offset = 6;
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(`<div class="tm-journalier-day is-muted" aria-hidden="true"></div>`);
    for (let d = 1; d <= total; d++) cells.push(makeCell(new Date(year, month, d)));
    return cells.join("");
  };

  const _renderCalendar = (state, project) => `
    <section id="journalier-calendar" class="card tm-journalier-panel">
      ${_renderPanelHead("Calendrier", `${_MONTHS_FR[_calState.month]} ${_calState.year}`, `
        <div class="tm-journalier-calendar-mode">
          <button type="button" class="icon-btn" data-journalier-action="prev-month" aria-label="Mois précédent">‹</button>
          <button type="button" class="tm-journalier-tab ${_calState.view === "week" ? "is-active" : ""}"
                  data-journalier-action="calendar-view" data-view="week">Semaine</button>
          <button type="button" class="tm-journalier-tab ${_calState.view === "month" ? "is-active" : ""}"
                  data-journalier-action="calendar-view" data-view="month">Mois</button>
          <button type="button" class="icon-btn" data-journalier-action="next-month" aria-label="Mois suivant">›</button>
        </div>
      `)}
      <div id="journalier-cal-grid" class="tm-journalier-calendar">
        <div class="tm-journalier-calendar-grid" aria-label="Calendrier Journalier">
          ${["L","M","M","J","V","S","D"].map(n => `<div class="tm-journalier-day-head">${n}</div>`).join("")}
          ${_renderCalendarCells(project, state.activeProjectType)}
        </div>
        <p class="tm-journalier-muted" style="margin:0">Glissez une tâche depuis la checklist vers un jour pour lui affecter une date limite.</p>
      </div>
    </section>
  `;

  const _renderTaskList = project => {
    const tasks = project.tasks || [];
    if (!tasks.length) {
      return `
        <div class="tm-journalier-empty">
          <strong>Aucune tâche</strong>
          <p>Ajoutez une tâche pour construire la checklist et alimenter automatiquement le calendrier.</p>
        </div>
      `;
    }

    return tasks.map(item => {
      const progress = _taskProgress(item);
      const subtasks = Array.isArray(item.subtasks) ? item.subtasks : [];
      return `
        <article class="tm-journalier-task" draggable="true" data-task-drag data-task-id="${_esc(item.id)}">
          <div class="tm-journalier-task-line">
            <input type="checkbox" ${progress >= 100 ? "checked" : ""} data-task-toggle="${_esc(item.id)}"
                   aria-label="Basculer la tâche ${_esc(item.label)}" />
            <div>
              <strong style="${progress >= 100 ? "text-decoration:line-through;opacity:.46" : ""}">${_esc(item.label)}</strong>
              ${item.detail ? `<p class="tm-journalier-muted" style="margin:.16rem 0 0">${_esc(item.detail)}</p>` : ""}
              <div style="display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.46rem">
                <span class="tm-journalier-pill">${_esc(_priorityLabel(item.priority))}</span>
                ${item.deadline ? `<span class="tm-journalier-pill">${_esc(_formatDate(item.deadline))}</span>` : ""}
                <span class="tm-journalier-pill">${progress}%</span>
              </div>
            </div>
            <button type="button" class="icon-btn" data-journalier-action="remove-task" data-task-id="${_esc(item.id)}"
                    aria-label="Supprimer cette tâche">×</button>
          </div>
          ${_renderProgressTrack(progress, "Progression de la tâche")}
          ${subtasks.length ? `
            <div class="tm-journalier-subtasks">
              ${subtasks.map(subtask => `
                <span class="${subtask.done ? "is-done" : ""}">${_esc(subtask.label)}</span>
              `).join("")}
            </div>
          ` : ""}
        </article>
      `;
    }).join("");
  };

  const _renderChecklist = project => `
    <section id="journalier-checklist" class="card tm-journalier-panel">
      ${_renderPanelHead("Checklist", "Tâches et sous-tâches")}
      <form id="journalier-add-form" class="tm-journalier-task-form" autocomplete="off">
        <label class="field">
          <span>Tâche</span>
          <input id="journalier-add-input" name="label" type="text" placeholder="Nouvelle tâche" maxlength="120" />
        </label>
        <label class="field">
          <span>Priorité</span>
          <select name="priority">
            <option value="normal">Normal</option>
            <option value="moyenne">Moyenne</option>
            <option value="haute">Haute</option>
            <option value="critique">Critique</option>
          </select>
        </label>
        <label class="field">
          <span>Date limite</span>
          <input id="journalier-add-deadline" name="deadline" type="date" />
        </label>
        <label class="field is-wide">
          <span>Détail</span>
          <input id="journalier-add-detail" name="detail" type="text" placeholder="Détail court, livrable, contrainte..." maxlength="180" />
        </label>
        <label class="field is-wide">
          <span>Sous-tâches</span>
          <input name="subtasks" type="text" placeholder="Séparez les sous-tâches par des virgules" maxlength="240" />
        </label>
        <button type="submit" class="text-btn text-btn--primary" data-journalier-action="add-task">Ajouter la tâche</button>
      </form>
      <div id="journalier-todo-list" class="tm-journalier-list">${_renderTaskList(project)}</div>
    </section>
  `;

  const _renderDeadlines = (state, project) => {
    const deadlines = _journalierDeadlines(project, state.activeProjectType);
    return `
      <section id="journalier-deadlines" class="card tm-journalier-panel">
        ${_renderPanelHead("Deadlines", "Échéances critiques")}
        <form id="journalier-deadline-form" class="tm-journalier-deadline-form" autocomplete="off">
          <label class="field">
            <span>Libellé</span>
            <input id="journalier-deadline-label" name="label" type="text" placeholder="Nouvelle deadline" maxlength="90" />
          </label>
          <label class="field">
            <span>Date</span>
            <input id="journalier-deadline-date" name="deadline" type="date" />
          </label>
          <label class="field is-wide">
            <span>Note</span>
            <input name="note" type="text" placeholder="Jalon, rendu, jury, validation..." maxlength="160" />
          </label>
          <button type="submit" class="text-btn text-btn--primary" data-journalier-action="add-deadline">Ajouter</button>
        </form>
        <div id="journalier-phases" class="tm-journalier-deadline-list">
          ${deadlines.length ? deadlines.map(item => {
            const cd = _countdown(item.deadline);
            const status = _phaseStatus(item.deadline);
            return `
              <article class="tm-journalier-deadline">
                <div style="display:flex;justify-content:space-between;gap:.7rem;align-items:start">
                  <div>
                    <span class="tm-journalier-chip">${_esc(item.code || "DL")}</span>
                    <strong style="display:block;margin-top:.4rem;color:var(--ink)">${_esc(item.label)}</strong>
                    <p class="tm-journalier-muted" style="margin:.2rem 0 0">${_esc(_formatDate(item.deadline))} · ${_esc(cd.text)}</p>
                    ${item.note ? `<p class="tm-journalier-muted" style="margin:.2rem 0 0">${_esc(item.note)}</p>` : ""}
                  </div>
                  <div style="display:flex;gap:.35rem;align-items:center;flex-wrap:wrap;justify-content:flex-end">
                    <span class="tm-journalier-pill">${_esc(status)}</span>
                    <span class="tm-journalier-pill">${_esc(_priorityLabel(item.priority))}</span>
                    ${item.source === "deadline" ? `
                      <button type="button" class="icon-btn" data-journalier-action="remove-deadline" data-deadline-id="${_esc(item.id)}"
                              aria-label="Supprimer cette deadline">×</button>
                    ` : ""}
                  </div>
                </div>
              </article>
            `;
          }).join("") : `
            <div class="tm-journalier-empty">
              <strong>Aucune deadline</strong>
              <p>Les échéances ajoutées ici apparaissent dans le calendrier.</p>
            </div>
          `}
        </div>
      </section>
    `;
  };

  const _renderAnalytics = (state, project) => {
    const progress = _projectProgress(project);
    const completion = _completionRate(project);
    const deadlines = _journalierDeadlines(project, state.activeProjectType);
    const next = deadlines[0];
    const taskCount = (project.tasks || []).length;
    const doneCount = (project.tasks || []).filter(task => _taskProgress(task) >= 100).length;

    return `
      <section id="journalier-analytics" class="card tm-journalier-panel">
        ${_renderPanelHead("Avancement", "Statistiques simples")}
        <div class="tm-journalier-kpis">
          <div class="tm-journalier-kpi"><strong>${progress}%</strong><span>Projet actif</span></div>
          <div class="tm-journalier-kpi"><strong>${completion}%</strong><span>Tâches terminées</span></div>
          <div class="tm-journalier-kpi"><strong>${doneCount}/${taskCount}</strong><span>Checklist</span></div>
          <div class="tm-journalier-kpi"><strong>${next ? _esc(_formatDate(next.deadline)).slice(0, 6) : "0"}</strong><span>Prochaine échéance</span></div>
        </div>
        ${JOURNALIER_PROJECT_TYPES.map(type => {
          const item = state.projects[type.id];
          const pct = _projectProgress(item);
          return `
            <div>
              <div style="display:flex;justify-content:space-between;gap:.8rem;margin-bottom:.35rem">
                <span class="tm-journalier-muted">${_esc(type.label)}</span>
                <span class="tm-journalier-muted">${pct}%</span>
              </div>
              ${_renderProgressTrack(pct, "Progression " + type.label)}
            </div>
          `;
        }).join("")}
      </section>
    `;
  };

  /* ── Rendu : Barre de progression ──────────────────────────────── */
  function _refreshProgress() {
    const el = document.getElementById("journalier-progress");
    if (!el) return;
    const project = _journalierProject();
    const pct = _projectProgress(project);
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:1rem;margin-bottom:.55rem">
        <span class="tm-journalier-muted">Progression consolidée</span>
        <strong style="font-family:var(--serif);font-size:2.4rem;font-weight:300;line-height:1;color:var(--gold)">${pct}%</strong>
      </div>
      ${_renderProgressTrack(pct, "Progression globale du projet")}
    `;
  }

  /* ── Rendu : Todo List ──────────────────────────────────────────── */
  function _refreshTodo() {
    const el = document.getElementById("journalier-todo-list");
    if (!el) return;
    el.innerHTML = _renderTaskList(_journalierProject());
  }

  /* ── Rendu : Phase strip ────────────────────────────────────────── */
  function _refreshPhases() {
    const el = document.getElementById("journalier-phases");
    if (!el) return;
    const state = _journalierState();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = _renderDeadlines(state, state.projects[state.activeProjectType] || {});
    el.innerHTML = wrapper.querySelector("#journalier-phases")?.innerHTML || "";
  }

  /* ── Rendu : Calendrier ─────────────────────────────────────────── */
  function _refreshCalendar() {
    const el = document.getElementById("journalier-cal-grid");
    if (!el) return;
    const state = _journalierState();
    const project = state.projects[state.activeProjectType] || {};
    const wrapper = document.createElement("div");
    wrapper.innerHTML = _renderCalendar(state, project);
    el.innerHTML = wrapper.querySelector("#journalier-cal-grid")?.innerHTML || "";
  }

  const _collectSubtasks = value =>
    String(value || "")
      .split(",")
      .map(label => ({ label: label.trim(), done: false }))
      .filter(item => item.label);

  function _bindJournalier(root) {
    if (!root || root.dataset.journalierBound === "1") return;
    root.dataset.journalierBound = "1";

    root.addEventListener("submit", e => {
      const form = e.target.closest("form");
      if (!form || !root.contains(form)) return;
      e.preventDefault();
      const data = new FormData(form);

      if (form.id === "journalier-project-form") {
        const type = data.get("type") || "cours";
        TEOMARCHI_APP.journalier.setActiveProjectType(type);
        TEOMARCHI_APP.journalier.updateProject({
          title: data.get("title") || "",
          deadline: data.get("deadline") || "",
          notes: data.get("notes") || "",
          status: data.get("status") || "a-definir",
          priority: data.get("priority") || "normal"
        });
        initJournalier();
        return;
      }

      if (form.id === "journalier-add-form") {
        const id = TEOMARCHI_APP.journalier.addTask({
          label: data.get("label") || "",
          detail: data.get("detail") || "",
          deadline: data.get("deadline") || "",
          priority: data.get("priority") || "normal",
          subtasks: _collectSubtasks(data.get("subtasks"))
        });
        if (id) initJournalier();
        return;
      }

      if (form.id === "journalier-deadline-form") {
        const id = TEOMARCHI_APP.journalier.addDeadline({
          label: data.get("label") || "",
          deadline: data.get("deadline") || "",
          note: data.get("note") || "",
          priority: data.get("priority") || "normal"
        });
        if (id) initJournalier();
      }
    });

    root.addEventListener("change", e => {
      const target = e.target;
      const projectType = target?.closest?.("#journalier-project-type");
      if (projectType) {
        TEOMARCHI_APP.journalier.setActiveProjectType(projectType.value);
        initJournalier();
        return;
      }

      const checkbox = target?.closest?.("[data-task-toggle]");
      if (checkbox) {
        TEOMARCHI_APP.journalier.toggleTask(checkbox.dataset.taskToggle);
        initJournalier();
      }
    });

    root.addEventListener("click", e => {
      const projectBtn = e.target.closest("[data-journalier-project]");
      if (projectBtn && root.contains(projectBtn)) {
        TEOMARCHI_APP.journalier.setActiveProjectType(projectBtn.dataset.journalierProject);
        initJournalier();
        return;
      }

      const btn = e.target.closest("[data-journalier-action]");
      if (!btn || !root.contains(btn)) return;
      const action = btn.dataset.journalierAction;

      if (action === "jump") {
        const target = document.getElementById(btn.dataset.target || "");
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
        root.querySelectorAll('[data-journalier-action="jump"]').forEach(item => item.classList.toggle("is-active", item === btn));
        return;
      }

      if (action === "remove-task") {
        TEOMARCHI_APP.journalier.removeTask(btn.dataset.taskId);
        initJournalier();
        return;
      }

      if (action === "remove-deadline") {
        TEOMARCHI_APP.journalier.removeDeadline(btn.dataset.deadlineId);
        initJournalier();
        return;
      }

      if (action === "prev-month") {
        if (--_calState.month < 0) { _calState.month = 11; _calState.year--; }
        initJournalier();
        return;
      }

      if (action === "next-month") {
        if (++_calState.month > 11) { _calState.month = 0; _calState.year++; }
        initJournalier();
        return;
      }

      if (action === "calendar-view") {
        _calState.view = btn.dataset.view === "week" ? "week" : "month";
        initJournalier();
      }
    });

    root.addEventListener("dragstart", e => {
      const card = e.target.closest("[data-task-drag]");
      if (!card || !e.dataTransfer) return;
      e.dataTransfer.setData("text/plain", card.dataset.taskId || "");
      e.dataTransfer.effectAllowed = "move";
    });

    root.addEventListener("dragover", e => {
      const day = e.target.closest("[data-journalier-date]");
      if (!day) return;
      e.preventDefault();
      day.classList.add("is-drop");
    });

    root.addEventListener("dragleave", e => {
      e.target.closest("[data-journalier-date]")?.classList.remove("is-drop");
    });

    root.addEventListener("drop", e => {
      const day = e.target.closest("[data-journalier-date]");
      if (!day || !e.dataTransfer) return;
      e.preventDefault();
      day.classList.remove("is-drop");
      const taskId = e.dataTransfer.getData("text/plain");
      if (taskId && TEOMARCHI_APP.journalier.updateTaskDeadline(taskId, day.dataset.journalierDate)) {
        initJournalier();
      }
    });
  }

  /* ── initJournalier : Injection principale dans #journalier-layout ─ */
  function initJournalier() {
    const root = document.getElementById("journalier-layout");
    if (!root) return;

    const state = _journalierState();
    const project = state.projects[state.activeProjectType] || { ...JOURNALIER_EMPTY_PROJECT };

    root.innerHTML = `
      <div class="tm-journalier" aria-label="Centre de gestion Journalier">
        <nav class="tm-journalier-nav" aria-label="Navigation Journalier">
          ${[
            ["journalier-dashboard", "Dashboard"],
            ["journalier-calendar", "Calendrier"],
            ["journalier-deadlines", "Deadlines"],
            ["journalier-checklist", "Checklist"],
            ["journalier-analytics", "Avancement"],
            ["journalier-projects", "Catégories"]
          ].map((item, index) => `
            <button type="button" class="tm-journalier-tab ${index === 0 ? "is-active" : ""}"
                    data-journalier-action="jump" data-target="${item[0]}">${item[1]}</button>
          `).join("")}
        </nav>

        ${_renderDashboard(state, project)}

        <div class="tm-journalier-grid">
          <div class="tm-journalier-stack">
            ${_renderCalendar(state, project)}
            ${_renderChecklist(project)}
          </div>
          <aside class="tm-journalier-stack">
            <section id="journalier-projects" class="card tm-journalier-panel">
              ${_renderPanelHead("Catégories projets", "Personnel, cours, travail")}
              ${_renderProjectCards(state)}
            </section>
            ${_renderDeadlines(state, project)}
            ${_renderAnalytics(state, project)}
          </aside>
        </div>
      </div>
    `;

    _bindJournalier(root);
  }

  /* ── Hook : init/refresh quand #module-journalier devient actif ── */
  (function hookJournalier() {
    const mod = document.getElementById("module-journalier");
    if (!mod) return;

    new MutationObserver(() => {
      if (mod.classList.contains("is-active")) initJournalier();
    }).observe(mod, { attributes: true, attributeFilter: ["class"] });

    if (mod.classList.contains("is-active")) initJournalier();
  })();

/* ── CSS cartes grille (injecté une fois) ───────────────────── */
  (function injectGridCSS() {
    if (document.getElementById("tm-grid-css")) return;
    const s = document.createElement("style");
    s.id = "tm-grid-css";
    s.textContent = `
      .tm-card {
        display: grid;
        grid-template-rows: 190px 1fr;
        border: 0.5px solid rgba(201,169,110,.24);
        border-radius: 16px;
        background: #0C0C0A;
        overflow: hidden;
        transition: border-color .22s ease, box-shadow .22s ease, transform .22s ease;
      }
      .tm-card:hover {
        border-color: rgba(201,169,110,.68);
        box-shadow: 0 16px 52px rgba(0,0,0,.66), 0 0 0 0.5px rgba(201,169,110,.20);
        transform: translateY(-2px);
      }
      .tm-card__img {
        position: relative;
        overflow: hidden;
      }
      .tm-card__img::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(12,12,10,.94) 0%, transparent 58%);
      }
      .tm-card__img svg { width:100%; height:100%; display:block; }
      .tm-card__body {
        display: grid;
        gap: .5rem;
        padding: 1rem 1.1rem 1.2rem;
      }
      .tm-card__tag {
        display: inline-flex;
        align-items: center;
        width: max-content;
        padding: .14rem .50rem;
        border: 0.5px solid rgba(201,169,110,.40);
        border-radius: 999px;
        background: rgba(201,169,110,.07);
        color: #C9A96E;
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: .60rem;
        font-weight: 400;
        letter-spacing: .11em;
        text-transform: uppercase;
      }
      .tm-card__title {
        font-family: "Cormorant Garamond", Georgia, serif;
        font-size: 1.48rem;
        font-weight: 400;
        line-height: 1.08;
        color: #F5F5F1;
        margin: 0;
      }
      .tm-card__sub {
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: .79rem;
        font-weight: 300;
        line-height: 1.55;
        color: #7A7670;
        margin: 0;
      }
    `;
    document.head.appendChild(s);
  })();

  /* ── DATA_PANTHEON — cartographie doctrine / matière / système ─ */
  const DATA_PANTHEON = [
    { id: "vitruve", nom: "Vitruve", epoque: "Antiquité / fondations", pays: "Rome", doctrine: "Firmitas, utilitas, venustas", systemeFavori: "Maçonnerie et ordres", matiereDominante: "Pierre", oeuvreRepere: "De architectura", apportTechnique: "Codifie proportions, matériaux et rôle du chantier.", leconProjet: "Relier usage, construction et représentation dès l'esquisse.", tags: ["traité", "proportion"] },
    { id: "brunelleschi", nom: "Filippo Brunelleschi", epoque: "Renaissance", pays: "Italie", doctrine: "Géométrie constructive", systemeFavori: "Coupole double coque", matiereDominante: "Brique", oeuvreRepere: "Dôme de Florence", apportTechnique: "Maîtrise de la poussée sans cintre complet.", leconProjet: "La méthode de chantier peut devenir l'idée architecturale.", tags: ["coupole", "chantier"] },
    { id: "palladio", nom: "Andrea Palladio", epoque: "Renaissance", pays: "Italie", doctrine: "Proportion typologique", systemeFavori: "Mur porteur ordonnancé", matiereDominante: "Pierre", oeuvreRepere: "Villa Rotonda", apportTechnique: "Transfère les ordres antiques vers le logement.", leconProjet: "Un plan clair stabilise programme, façade et structure.", tags: ["villa", "proportion"] },
    { id: "viollet", nom: "Viollet-le-Duc", epoque: "XIXe siècle", pays: "France", doctrine: "Rationalisme structurel", systemeFavori: "Ossature exprimée", matiereDominante: "Pierre / métal", oeuvreRepere: "Dictionnaire raisonné", apportTechnique: "Lit le gothique comme système de forces.", leconProjet: "Exprimer la logique porteuse plutôt que masquer l'effort.", tags: ["gothique", "rationalisme"] },
    { id: "gaudi", nom: "Antoni Gaudí", epoque: "XIXe siècle", pays: "Espagne", doctrine: "Forme funiculaire", systemeFavori: "Arcs caténaires", matiereDominante: "Pierre / céramique", oeuvreRepere: "Sagrada Família", apportTechnique: "Maquettes pendulaires pour optimiser les poussées.", leconProjet: "Tester la forme par le comportement physique.", tags: ["catenaires", "maquette"] },
    { id: "wright", nom: "Frank Lloyd Wright", epoque: "Modernisme", pays: "États-Unis", doctrine: "Architecture organique", systemeFavori: "Porte-à-faux et plan ouvert", matiereDominante: "Bois / béton", oeuvreRepere: "Fallingwater", apportTechnique: "Fusion site, structure et mobilier intégré.", leconProjet: "Le détail doit prolonger le paysage et l'usage.", tags: ["organique", "site"] },
    { id: "le-corbusier", nom: "Le Corbusier", epoque: "Modernisme", pays: "France / Suisse", doctrine: "Machine à habiter", systemeFavori: "Poteau-dalle", matiereDominante: "Béton", oeuvreRepere: "Villa Savoye", apportTechnique: "Plan libre, pilotis, façade libre.", leconProjet: "Séparer structure et cloison pour libérer le programme.", tags: ["plan libre", "béton"] },
    { id: "mies", nom: "Mies van der Rohe", epoque: "Modernisme", pays: "Allemagne / États-Unis", doctrine: "Less is more", systemeFavori: "Ossature acier", matiereDominante: "Acier / verre", oeuvreRepere: "Farnsworth House", apportTechnique: "Précision du joint et universalité du plateau.", leconProjet: "Un détail mal résolu détruit une architecture minimale.", tags: ["acier", "verre"] },
    { id: "aalto", nom: "Alvar Aalto", epoque: "Modernisme", pays: "Finlande", doctrine: "Humanisme climatique", systemeFavori: "Bois lamellé et brique", matiereDominante: "Bois", oeuvreRepere: "Bibliothèque de Viipuri", apportTechnique: "Acoustique, lumière et ergonomie intégrées.", leconProjet: "La technique doit rester sensible au corps.", tags: ["bois", "lumière"] },
    { id: "kahn", nom: "Louis Kahn", epoque: "Brutalisme", pays: "États-Unis", doctrine: "Servant / servi", systemeFavori: "Maçonnerie monumentale", matiereDominante: "Béton / brique", oeuvreRepere: "Salk Institute", apportTechnique: "Hiérarchise structure, gaines et espaces nobles.", leconProjet: "Dessiner les services comme une architecture.", tags: ["béton", "services"] },
    { id: "lina-bo-bardi", nom: "Lina Bo Bardi", epoque: "Brutalisme", pays: "Brésil", doctrine: "Culture populaire et structure", systemeFavori: "Béton suspendu", matiereDominante: "Béton", oeuvreRepere: "MASP", apportTechnique: "Grande portée urbaine libérant le sol public.", leconProjet: "La structure peut produire de l'espace civique.", tags: ["portée", "public"] },
    { id: "niemeyer", nom: "Oscar Niemeyer", epoque: "Modernisme", pays: "Brésil", doctrine: "Plasticité du béton", systemeFavori: "Coque et pilotis", matiereDominante: "Béton", oeuvreRepere: "Brasília", apportTechnique: "Courbe libre rendue possible par le béton armé.", leconProjet: "La forme plastique doit rester lisible en coupe.", tags: ["courbe", "pilotis"] },
    { id: "ando", nom: "Tadao Ando", epoque: "Contemporain", pays: "Japon", doctrine: "Silence, béton, lumière", systemeFavori: "Voile béton", matiereDominante: "Béton", oeuvreRepere: "Église de la Lumière", apportTechnique: "Parement, coffrage et lumière comme précision.", leconProjet: "La pauvreté matérielle exige une exécution parfaite.", tags: ["béton", "lumière"] },
    { id: "piano", nom: "Renzo Piano", epoque: "High-tech", pays: "Italie", doctrine: "Légèreté constructive", systemeFavori: "Structure apparente", matiereDominante: "Acier / verre", oeuvreRepere: "Centre Pompidou", apportTechnique: "Externalise réseaux et structure pour libérer les plateaux.", leconProjet: "Rendre lisible ce qui porte, ventile et distribue.", tags: ["high-tech", "acier"] },
    { id: "rogers", nom: "Richard Rogers", epoque: "High-tech", pays: "Royaume-Uni", doctrine: "Bâtiment comme infrastructure", systemeFavori: "Méga-structure", matiereDominante: "Acier", oeuvreRepere: "Lloyd's Building", apportTechnique: "Services techniques remplaçables en façade.", leconProjet: "Prévoir maintenance et évolutivité dès le parti.", tags: ["services", "réversibilité"] },
    { id: "foster", nom: "Norman Foster", epoque: "High-tech", pays: "Royaume-Uni", doctrine: "Performance intégrée", systemeFavori: "Diagrid / enveloppe", matiereDominante: "Acier / verre", oeuvreRepere: "30 St Mary Axe", apportTechnique: "Structure et climat fusionnés en enveloppe.", leconProjet: "La géométrie peut réduire matière, vent et énergie.", tags: ["diagrid", "climat"] },
    { id: "hadid", nom: "Zaha Hadid", epoque: "Déconstructivisme", pays: "Irak / Royaume-Uni", doctrine: "Champ fluide", systemeFavori: "Coques et trames continues", matiereDominante: "Béton / acier", oeuvreRepere: "Heydar Aliyev Center", apportTechnique: "Continuité topologique entre sol, mur et toiture.", leconProjet: "La complexité formelle exige une stratégie de fabrication.", tags: ["paramétrique", "coque"] },
    { id: "koolhaas", nom: "Rem Koolhaas", epoque: "Déconstructivisme", pays: "Pays-Bas", doctrine: "Programme instable", systemeFavori: "Méga-plan et section", matiereDominante: "Béton / acier", oeuvreRepere: "Casa da Música", apportTechnique: "Organisation par collisions programmatiques.", leconProjet: "Tester le bâtiment en coupe autant qu'en plan.", tags: ["programme", "section"] },
    { id: "lacaton-vassal", nom: "Lacaton & Vassal", epoque: "Contemporain bas-carbone", pays: "France", doctrine: "Ne jamais démolir", systemeFavori: "Extension légère", matiereDominante: "Acier / polycarbonate", oeuvreRepere: "Transformation Grand Parc", apportTechnique: "Ajout bioclimatique et économie de matière.", leconProjet: "Le meilleur carbone est souvent celui qu'on ne dépense pas.", tags: ["réhabilitation", "bas-carbone"] },
    { id: "kuma", nom: "Kengo Kuma", epoque: "Contemporain bas-carbone", pays: "Japon", doctrine: "Dissolution matérielle", systemeFavori: "Trames bois répétées", matiereDominante: "Bois", oeuvreRepere: "Asakusa Culture Center", apportTechnique: "Assemblage, texture et faible masse visuelle.", leconProjet: "La répétition légère peut fabriquer une présence forte.", tags: ["bois", "trame"] },
    { id: "kere", nom: "Francis Kéré", epoque: "Contemporain bas-carbone", pays: "Burkina Faso / Allemagne", doctrine: "Climat social", systemeFavori: "Ventilation passive", matiereDominante: "Terre / métal", oeuvreRepere: "École de Gando", apportTechnique: "Double toiture ventilée et matériaux locaux.", leconProjet: "La performance vient souvent de la coupe climatique.", tags: ["terre", "ventilation"] },
    { id: "grafton", nom: "Yvonne Farrell / Shelley McNamara", epoque: "Contemporain", pays: "Irlande", doctrine: "Section civique", systemeFavori: "Masse percée", matiereDominante: "Béton / pierre", oeuvreRepere: "UTEC Lima", apportTechnique: "Épaisseur structurelle adaptée au climat.", leconProjet: "Une coupe poreuse peut faire ville et climat.", tags: ["section", "inertie"] }
  ];

  /* ── DATA_ATLAS — géographie des systèmes constructifs ─────── */
  const DATA_ATLAS = [
    { id: "sahara-terre", titre: "Architecture vernaculaire saharienne", pays: "Algérie / Mali", ville: "Mzab, Djenné", periode: "Vernaculaire", climat: "Aride chaud", systemeConstructif: "Murs porteurs en terre crue", matiere: "Terre", portee: "Faible à moyenne", inertie: "Très forte", technique: "Masse, patios, ruelles étroites, protection solaire.", lecon: "Utiliser inertie et ombre avant la climatisation active.", tags: ["patio", "terre", "inertie"] },
    { id: "japon-bois", titre: "Japon traditionnel", pays: "Japon", ville: "Kyoto / Nara", periode: "Préindustriel", climat: "Tempéré humide", systemeConstructif: "Poteaux-poutres assemblés à sec", matiere: "Bois", portee: "Modérée", inertie: "Faible", technique: "Trame, débords de toiture, panneaux mobiles.", lecon: "Concevoir une structure réparable, démontable et adaptable.", tags: ["bois", "assemblage", "trame"] },
    { id: "rome-beton", titre: "Rome antique", pays: "Italie", ville: "Rome", periode: "Antiquité", climat: "Méditerranéen", systemeConstructif: "Voûtes, arcs et béton romain", matiere: "Béton / pierre", portee: "Grande", inertie: "Forte", technique: "Opus caementicium, arcs de décharge, coupoles.", lecon: "Le franchissement transforme l'espace public et les flux.", tags: ["voûte", "arc", "béton"] },
    { id: "gothique-france", titre: "Gothique français", pays: "France", ville: "Chartres / Amiens", periode: "Moyen Âge", climat: "Tempéré", systemeConstructif: "Nervures, arcs-boutants, mur évidé", matiere: "Pierre", portee: "Grande hauteur", inertie: "Forte", technique: "Concentration des charges et transfert des poussées.", lecon: "Dessiner les efforts permet d'ouvrir l'enveloppe.", tags: ["poussée", "pierre", "lumière"] },
    { id: "mediterranee-pierre", titre: "Méditerranée vernaculaire", pays: "Grèce / Maroc / Espagne", ville: "Cyclades, médinas", periode: "Vernaculaire", climat: "Chaud sec", systemeConstructif: "Mur épais et patio", matiere: "Pierre / chaux", portee: "Faible", inertie: "Très forte", technique: "Blanchiment, ombrage, ventilation traversante.", lecon: "La compacité et l'épaisseur pilotent le confort d'été.", tags: ["ombre", "patio", "pierre"] },
    { id: "alpes-mixte", titre: "Architecture alpine", pays: "Suisse / France / Autriche", ville: "Alpes", periode: "Vernaculaire", climat: "Froid neigeux", systemeConstructif: "Soubassement pierre, superstructure bois", matiere: "Bois / pierre", portee: "Modérée", inertie: "Mixte", technique: "Toitures pentues, stockage thermique, protection neige.", lecon: "Adapter la coupe au sol, à la pente et aux charges climatiques.", tags: ["neige", "pente", "bois"] },
    { id: "scandinavie-massif", titre: "Scandinavie bois massif", pays: "Norvège / Suède / Finlande", ville: "Régions nordiques", periode: "Préindustriel à contemporain", climat: "Froid humide", systemeConstructif: "Empilement bois / CLT contemporain", matiere: "Bois", portee: "Modérée à grande", inertie: "Moyenne", technique: "Enveloppe épaisse, préfabrication, continuité isolante.", lecon: "La performance vient de la simplicité de l'enveloppe.", tags: ["bois", "froid", "préfabrication"] },
    { id: "bresil-modernisme", titre: "Modernisme brésilien", pays: "Brésil", ville: "Rio / Brasília", periode: "Modernisme", climat: "Tropical", systemeConstructif: "Pilotis, brise-soleil, béton plastique", matiere: "Béton", portee: "Moyenne à grande", inertie: "Forte", technique: "Sol libre, ombre profonde, ventilation naturelle.", lecon: "Un modernisme efficace commence par le climat.", tags: ["béton", "pilotis", "brise-soleil"] },
    { id: "high-tech-europe", titre: "High-tech européen", pays: "France / Royaume-Uni", ville: "Paris / Londres", periode: "XXe siècle", climat: "Tempéré", systemeConstructif: "Exosquelette acier et services apparents", matiere: "Acier / verre", portee: "Grande", inertie: "Faible", technique: "Plateaux libres, maintenance visible, préfabrication sèche.", lecon: "Rendre le bâtiment modifiable prolonge sa durée utile.", tags: ["acier", "verre", "réversibilité"] },
    { id: "bambou-tropical", titre: "Structures tropicales en bambou", pays: "Indonésie / Colombie", ville: "Bali / Andes", periode: "Contemporain", climat: "Tropical humide", systemeConstructif: "Treillis et arcs en fibres végétales", matiere: "Bambou", portee: "Moyenne", inertie: "Faible", technique: "Courbure, ligatures, ventilation permanente.", lecon: "Un matériau léger demande une stratégie d'assemblage claire.", tags: ["bambou", "biosourcé", "ventilation"] },
    { id: "clt-bas-carbone", titre: "Bas-carbone contemporain", pays: "Europe", ville: "Vienne / Paris / Oslo", periode: "Contemporain", climat: "Tempéré", systemeConstructif: "CLT, poteau-poutre bois, noyaux hybrides", matiere: "Bois", portee: "Moyenne", inertie: "Moyenne", technique: "Préfabrication, réversibilité, assemblages secs.", lecon: "Réduire carbone et chantier exige une trame répétable.", tags: ["CLT", "bas-carbone", "sec"] },
    { id: "terre-contemporaine", titre: "Terre contemporaine stabilisée", pays: "Suisse / France / Afrique", ville: "Lyon, Zurich, Gando", periode: "Contemporain", climat: "Variable", systemeConstructif: "BTC, pisé, murs épais", matiere: "Terre", portee: "Faible", inertie: "Très forte", technique: "Préfabrication de blocs, protection à l'eau, chaînages.", lecon: "Le bas-carbone impose de redessiner détails et protections.", tags: ["terre", "inertie", "eau"] }
  ];

  /* ── Placeholder SVG architectural (léger, générique) ───────── */
  const _svgSketch = (seed = 0) => {
    /* Deux variantes selon parité de seed : élévation ou plan */
    const v = seed % 2;
    return v === 0
      ? `<svg viewBox="0 0 480 190" aria-hidden="true" style="opacity:.16">
           <path d="M40 190H440M80 190V70H220V190M280 190V30H420V190"
                 fill="none" stroke="#C9A96E" stroke-width="1"/>
           <path d="M100 125H200M300 80H400M100 155H200M300 120H400"
                 stroke="#C9A96E" stroke-width="6" stroke-linecap="round" opacity=".45"/>
           <circle cx="150" cy="70"  r="3.5" fill="#C9A96E" opacity=".6"/>
           <circle cx="350" cy="30"  r="3.5" fill="#C9A96E" opacity=".6"/>
         </svg>`
      : `<svg viewBox="0 0 480 190" aria-hidden="true" style="opacity:.16">
           <rect x="60"  y="40"  width="360" height="120" fill="none" stroke="#C9A96E" stroke-width="1"/>
           <path d="M60 100H420M240 40V160" stroke="#C9A96E" stroke-width="1"/>
           <rect x="100" y="60"  width="100" height="70" fill="rgba(201,169,110,.08)" stroke="#C9A96E" stroke-width=".8"/>
           <rect x="280" y="60"  width="100" height="70" fill="rgba(201,169,110,.08)" stroke="#C9A96E" stroke-width=".8"/>
           <circle cx="240" cy="100" r="28" fill="none" stroke="#C9A96E" stroke-width=".8" opacity=".6"/>
         </svg>`;
  };

  /* ── renderGrid : injection universelle ─────────────────────── */
  function renderGrid(containerId, data) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(258px,1fr));gap:1rem";

    el.innerHTML = data.map((item, i) => `
      <article class="tm-card">
        <div class="tm-card__img" style="background:${item._bg || "#0C0C0A"}">
          ${item.image_url
            ? `<img src="${item.image_url}" alt="${item.titre}" loading="lazy"
                    style="width:100%;height:100%;object-fit:cover;display:block">`
            : _svgSketch(i)
          }
        </div>
        <div class="tm-card__body">
          <span class="tm-card__tag">${item.tag}</span>
          <h3 class="tm-card__title">${item.titre}</h3>
          <p class="tm-card__sub">${item.sous_titre}</p>
        </div>
      </article>
    `).join("");
  }

  (function injectTechnicalCSS() {
    if (document.getElementById("tm-tech-css")) return;
    const s = document.createElement("style");
    s.id = "tm-tech-css";
    s.textContent = `
      .tm-tech { display:grid; gap:1rem; min-width:0; }
      .tm-tech-controls {
        display:grid;
        grid-template-columns:minmax(220px,1.2fr) repeat(4,minmax(150px,.7fr));
        gap:.72rem;
        align-items:stretch;
      }
      .tm-tech .field {
        min-height:0;
        align-items:stretch;
        flex-direction:column;
        gap:.28rem;
        padding:.62rem .72rem;
        background:color-mix(in srgb,var(--surface-2) 62%,transparent);
      }
      .tm-tech .field span {
        color:var(--muted);
        font-size:.56rem;
        letter-spacing:.12em;
        line-height:1;
        text-transform:uppercase;
      }
      .tm-tech .field input,
      .tm-tech .field select { width:100%; }
      .tm-tech-layout {
        display:grid;
        grid-template-columns:minmax(0,1fr) minmax(280px,.38fr);
        gap:1rem;
        align-items:start;
      }
      .tm-tech-grid {
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(232px,1fr));
        gap:1rem;
      }
      .tm-tech-card {
        display:grid;
        grid-template-rows:112px 1fr;
        border:var(--border);
        border-radius:var(--r-lg);
        background:var(--surface);
        overflow:hidden;
        cursor:pointer;
        transition:border-color .18s ease, transform .18s ease, background .18s ease;
      }
      .tm-tech-card:hover,
      .tm-tech-card.is-active {
        border-color:rgba(201,169,110,.42);
        background:rgba(201,169,110,.045);
        transform:translateY(-1px);
      }
      .tm-tech-sketch {
        display:grid;
        place-items:center;
        background:linear-gradient(140deg,#080807 0%,#11110e 58%,#1b1710 100%);
        border-bottom:var(--border);
      }
      .tm-tech-sketch svg { width:100%; height:100%; }
      .tm-tech-card-body { display:grid; gap:.5rem; padding:1rem; }
      .tm-tech-card h3,
      .tm-tech-detail h3 {
        margin:0;
        font-family:var(--serif);
        font-weight:300;
        line-height:1.04;
        color:var(--ink);
      }
      .tm-tech-card h3 { font-size:1.38rem; }
      .tm-tech-detail h3 { font-size:2rem; }
      .tm-tech-card p,
      .tm-tech-muted {
        margin:0;
        color:var(--muted);
        font-size:.72rem;
        line-height:1.55;
      }
      .tm-tech-tag,
      .tm-tech-badges span {
        display:inline-flex;
        width:max-content;
        border:var(--border-gold);
        border-radius:var(--r-pill);
        color:var(--gold);
        background:var(--gold-glow);
        text-transform:uppercase;
      }
      .tm-tech-tag {
        padding:.14rem .5rem;
        font-size:.56rem;
        letter-spacing:.11em;
      }
      .tm-tech-badges { display:flex; flex-wrap:wrap; gap:.28rem; }
      .tm-tech-badges span {
        padding:.1rem .38rem;
        border-color:rgba(201,169,110,.18);
        color:#9A8D72;
        font-size:.52rem;
        letter-spacing:.07em;
      }
      .tm-tech-detail,
      .tm-tech-compare {
        position:sticky;
        top:88px;
        display:grid;
        gap:.85rem;
        border:var(--border);
        border-radius:var(--r-lg);
        background:var(--surface);
        padding:1.1rem;
      }
      .tm-tech-compare { position:static; }
      .tm-tech-kicker {
        margin:0;
        color:var(--gold);
        font-size:.58rem;
        letter-spacing:.17em;
        text-transform:uppercase;
      }
      .tm-tech-rows { display:grid; gap:.46rem; }
      .tm-tech-row {
        display:grid;
        gap:.16rem;
        padding-bottom:.46rem;
        border-bottom:var(--border);
      }
      .tm-tech-row span {
        color:var(--muted);
        font-size:.56rem;
        letter-spacing:.12em;
        text-transform:uppercase;
      }
      .tm-tech-row strong {
        color:var(--ink-2);
        font-size:.78rem;
        font-weight:400;
        line-height:1.45;
      }
      .tm-tech-lesson {
        margin:0;
        padding:.85rem;
        border:var(--border-gold);
        border-radius:var(--r-md);
        background:var(--gold-glow);
        color:var(--ink);
        font-size:.82rem;
        line-height:1.55;
      }
      .tm-tech-compare-grid {
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:.5rem;
      }
      .tm-tech-compare-grid div {
        border:var(--border);
        border-radius:var(--r-md);
        padding:.68rem;
      }
      .tm-tech-compare-grid span {
        display:block;
        margin-bottom:.32rem;
        color:var(--gold);
        font-size:.55rem;
        letter-spacing:.12em;
        text-transform:uppercase;
      }
      .tm-tech-compare-grid p {
        margin:.18rem 0;
        color:var(--muted);
        font-size:.68rem;
        line-height:1.35;
      }
      .tm-tech-empty {
        border:1px dashed rgba(201,169,110,.24);
        border-radius:var(--r-lg);
        padding:1.2rem;
        background:rgba(201,169,110,.035);
      }
      .tm-tech-empty p { color:var(--muted); margin:.25rem 0 0; }
      @media (max-width: 1100px) {
        .tm-tech-controls,
        .tm-tech-layout,
        .tm-tech-compare-grid { grid-template-columns:1fr; }
        .tm-tech-detail { position:static; }
      }
    `;
    document.head.appendChild(s);
  })();

  /* ── Renderer générique léger pour modules techniques ───────── */
  const _techState = {};

  const _techNorm = value =>
    String(value ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const _uniqueValues = (data, key) =>
    [...new Set(data.map(item => item[key]).filter(Boolean))]
      .sort((a, b) => String(a).localeCompare(String(b), "fr"));

  const _techItemText = item =>
    _techNorm(Object.values(item).flat().join(" "));

  const _techDetailRows = (item, fields) => fields.map(field => `
    <div class="tm-tech-row">
      <span>${_esc(field.label)}</span>
      <strong>${_esc(item[field.key] || "—")}</strong>
    </div>
  `).join("");

  function renderTechnicalCards(container, data, options) {
    if (!container) return;

    const id = options.id;
    const state = _techState[id] ||= { query: "", filters: {}, selectedId: data[0]?.id || null, compare: [] };
    const filters = options.filters || [];
    const fields = options.fields || [];
    const titleKey = options.titleKey || "titre";
    const subtitleKeys = options.subtitleKeys || [];

    const filtered = data.filter(item => {
      const filterMatch = filters.every(filter => {
        const selected = state.filters[filter.key] || "";
        return !selected || item[filter.key] === selected;
      });
      const searchMatch = !state.query || _techItemText(item).includes(_techNorm(state.query));
      return filterMatch && searchMatch;
    });

    if (!filtered.some(item => item.id === state.selectedId)) {
      state.selectedId = filtered[0]?.id || data[0]?.id || null;
    }
    const selected = data.find(item => item.id === state.selectedId) || filtered[0] || data[0];

    const compareItems = (state.compare || [])
      .map(itemId => data.find(item => item.id === itemId))
      .filter(Boolean);

    container.dataset.techModule = id;
    container.innerHTML = `
      <div class="tm-tech" data-tech-shell="${_esc(id)}">
        <div class="tm-tech-controls">
          <label class="field tm-tech-search">
            <input type="search" data-tech-search placeholder="${_esc(options.searchPlaceholder || "Rechercher...")}"
                   value="${_esc(state.query)}" autocomplete="off" />
          </label>
          ${filters.map(filter => `
            <label class="field tm-tech-filter">
              <span>${_esc(filter.label)}</span>
              <select data-tech-filter="${_esc(filter.key)}">
                <option value="">Tous</option>
                ${_uniqueValues(data, filter.key).map(value => `
                  <option value="${_esc(value)}" ${state.filters[filter.key] === value ? "selected" : ""}>
                    ${_esc(value)}
                  </option>
                `).join("")}
              </select>
            </label>
          `).join("")}
        </div>

        ${options.compare ? `
          <div class="tm-tech-compare">
            <div>
              <p class="tm-tech-kicker">Comparaison</p>
              <strong>${compareItems.length ? compareItems.map(item => _esc(item[titleKey])).join(" / ") : "Sélectionnez deux périodes"}</strong>
            </div>
            ${compareItems.length === 2 ? `
              <div class="tm-tech-compare-grid">
                ${["materiau", "portee", "outil", "systeme"].map(key => `
                  <div>
                    <span>${_esc(key)}</span>
                    <p>${_esc(compareItems[0][key] || "—")}</p>
                    <p>${_esc(compareItems[1][key] || "—")}</p>
                  </div>
                `).join("")}
              </div>
            ` : `<p class="tm-tech-muted">Utilisez “Comparer” sur deux cartes pour lire les écarts matière, portée, outils et structure.</p>`}
          </div>
        ` : ""}

        <div class="tm-tech-layout">
          <div class="tm-tech-grid">
            ${filtered.length ? filtered.map((item, i) => {
              const active = item.id === selected?.id;
              const compared = state.compare?.includes(item.id);
              return `
                <article class="tm-tech-card ${active ? "is-active" : ""}" data-tech-card="${_esc(item.id)}" tabindex="0">
                  <div class="tm-tech-sketch">${_svgSketch(i)}</div>
                  <div class="tm-tech-card-body">
                    <span class="tm-tech-tag">${_esc(options.tag(item))}</span>
                    <h3>${_esc(item[titleKey])}</h3>
                    <p>${_esc(subtitleKeys.map(key => item[key]).filter(Boolean).join(" · "))}</p>
                    <div class="tm-tech-badges">
                      ${(item.tags || []).slice(0, 4).map(tag => `<span>${_esc(tag)}</span>`).join("")}
                    </div>
                    ${options.compare ? `
                      <button type="button" class="text-btn ${compared ? "text-btn--primary" : ""}"
                              data-chronos-compare="${_esc(item.id)}">${compared ? "Comparé" : "Comparer"}</button>
                    ` : ""}
                  </div>
                </article>
              `;
            }).join("") : `
              <div class="tm-tech-empty">
                <strong>Aucun résultat</strong>
                <p>Modifiez la recherche ou les filtres.</p>
              </div>
            `}
          </div>

          <aside class="tm-tech-detail" data-tech-detail>
            ${selected ? `
              <p class="tm-tech-kicker">${_esc(options.detailKicker(selected))}</p>
              <h3>${_esc(selected[titleKey])}</h3>
              <div class="tm-tech-rows">${_techDetailRows(selected, fields)}</div>
              <p class="tm-tech-lesson">${_esc(options.lesson(selected))}</p>
            ` : `
              <div class="tm-tech-empty">
                <strong>${_esc(options.emptyTitle || "Aucune donnée")}</strong>
                <p>${_esc(options.emptyText || "Ce module ne contient pas encore d'entrée.")}</p>
              </div>
            `}
          </aside>
        </div>
      </div>
    `;
  }

  function _bindTechnicalModule(root, data, options) {
    if (!root || root.dataset.techBound === options.id) return;
    root.dataset.techBound = options.id;

    root.addEventListener("input", e => {
      const input = e.target.closest("[data-tech-search]");
      if (!input) return;
      const state = _techState[options.id] ||= { filters: {}, compare: [] };
      state.query = input.value || "";
      renderTechnicalCards(root, data, options);
    });

    root.addEventListener("change", e => {
      const select = e.target.closest("[data-tech-filter]");
      if (!select) return;
      const state = _techState[options.id] ||= { filters: {}, compare: [] };
      state.filters[select.dataset.techFilter] = select.value;
      renderTechnicalCards(root, data, options);
    });

    root.addEventListener("click", e => {
      const compareBtn = e.target.closest("[data-chronos-compare]");
      if (compareBtn) {
        e.stopPropagation();
        const state = _techState[options.id] ||= { filters: {}, compare: [] };
        const targetId = compareBtn.dataset.chronosCompare;
        state.compare = state.compare || [];
        state.compare = state.compare.includes(targetId)
          ? state.compare.filter(id => id !== targetId)
          : [...state.compare.slice(-1), targetId];
        renderTechnicalCards(root, data, options);
        return;
      }

      const card = e.target.closest("[data-tech-card]");
      if (!card) return;
      const state = _techState[options.id] ||= { filters: {}, compare: [] };
      state.selectedId = card.dataset.techCard;
      renderTechnicalCards(root, data, options);
    });

    root.addEventListener("keydown", e => {
      const card = e.target.closest("[data-tech-card]");
      if (!card || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      card.click();
    });
  }

  /* ── DATA_FEED — démo désactivée par défaut ────────────────── */
  const DATA_FEED = ENABLE_DEMO_DATA ? [
    {
      titre:      "Rendu concours Bordeaux",
      sous_titre: "Livraison du projet d'équipement culturel soumis au concours ANRU de Bordeaux Métropole. Façade bois-béton, toiture végétalisée et programme de 3 200 m².",
      tag:        "CONCOURS",
      image_url:  "",
      _bg:        "linear-gradient(140deg,#0e0b08 0%,#241a0e 55%,#3a2814 100%)",
      auteur:     "Sarah Mbeki",
      initiales:  "SM",
      role:       "M2 · ENSA Paris-Belleville",
      slug:       "sarah-mbeki"
    },
    {
      titre:      "Analyse — Unité d'Habitation",
      sous_titre: "Étude de la trame structurelle de l'UH de Marseille. Coupe habitée au 1/50, relevé des épaisseurs et performances thermiques RE2020.",
      tag:        "ANALYSE",
      image_url:  "",
      _bg:        "linear-gradient(140deg,#080c0a 0%,#10201a 55%,#183028 100%)",
      auteur:     "Théo Vanderberg",
      initiales:  "TV",
      role:       "Architecte · Bruxelles",
      slug:       "theo-vanderberg"
    },
    {
      titre:      "Coupe habitée — Studio M2",
      sous_titre: "Coupe transversale d'un logement collectif en bois massif CLT. Lecture simultanée structure, isolation, seuils et menuiseries. Produit en quatre heures.",
      tag:        "PUBLICATION",
      image_url:  "",
      _bg:        "linear-gradient(140deg,#0c0a0e 0%,#1a1428 55%,#28203e 100%)",
      auteur:     "Inès Kourouma",
      initiales:  "IK",
      role:       "M1 · La Cambre — Horta",
      slug:       "ines-kourouma"
    },
    {
      titre:      "Retour chantier — Paille & Terre",
      sous_titre: "Visite de la Résidence Cannelle à Nanterre. Observation des détails de soubassement, ossature bois et enduit argile projeté.",
      tag:        "CHANTIER",
      image_url:  "",
      _bg:        "linear-gradient(140deg,#080e0c 0%,#121e18 55%,#1e3024 100%)",
      auteur:     "Nassim Ferrahi",
      initiales:  "NF",
      role:       "Chef de projet · Atelier 17",
      slug:       "nassim-ferrahi"
    },
    {
      titre:      "Workshop Pavillon bois — Nantes",
      sous_titre: "72h de conception et assemblage à sec. Portée de 6 m sans assemblage métallique, testé charge à rupture à l'ENSA Nantes.",
      tag:        "WORKSHOP",
      image_url:  "",
      _bg:        "linear-gradient(140deg,#0e0d08 0%,#22200a 55%,#363214 100%)",
      auteur:     "Chiara Lombardi",
      initiales:  "CL",
      role:       "Enseignante-chercheuse · ENSA Nantes",
      slug:       "chiara-lombardi"
    },
    {
      titre:      "Recherche ACV — Béton bas-carbone",
      sous_titre: "Comparaison du cycle de vie béton ordinaire vs GGBS. Résultats : réduction de 34 % des émissions CO₂ à résistance mécanique équivalente.",
      tag:        "RECHERCHE",
      image_url:  "",
      _bg:        "linear-gradient(140deg,#080a0e 0%,#10141e 55%,#18202e 100%)",
      auteur:     "Jonathan YAV",
      initiales:  "JY",
      role:       "Fondateur · TEOMARCHI",
      slug:       "jonathan-yav"
    }
  ] : [];

  /* ── DATA_FICHES — 6 fiches encyclopédie constructive ──────── */
  const DATA_FICHES = [
    {
      titre:      "Assemblages bois CLT",
      sous_titre: "Catalogue des assemblages structurels pour panneaux CLT : tenon-mortaise, crantage, platines acier et vis inclinées. Tolérances de mise en œuvre, charges admissibles et détails de nœuds courants en phase APD.",
      tag:        "TECHNIQUE",
      image_url:  "",
      _bg:        "linear-gradient(140deg,#08090e 0%,#0e1220 55%,#161e36 100%)"
    },
    {
      titre:      "Béton banché",
      sous_titre: "Coulage en banches métalliques ou bois : dosage, vibration, cure et décoffrage. Traitements de parement : grenaillage, sablage, brossage. Précautions anti-bullage et reprises de bétonnage DTU 21.",
      tag:        "BÉTON",
      image_url:  "",
      _bg:        "linear-gradient(140deg,#0c0c0a 0%,#1a1a14 55%,#2a2a1e 100%)"
    },
    {
      titre:      "Étanchéité toiture-terrasse",
      sous_titre: "Systèmes bicouche SBS et monocouche TPO/EPDM pour toitures inaccessibles et jardins. Points singuliers : relevés, acrotères et émergences. DTU 43.1, règles professionnelles CSNE et essais de ponçage.",
      tag:        "ÉTANCHÉITÉ",
      image_url:  "",
      _bg:        "linear-gradient(140deg,#090e0c 0%,#121e18 55%,#1a2c22 100%)"
    },
    {
      titre:      "Mur rideau aluminium",
      sous_titre: "Façade légère en profilés aluminium : montants, traverses, pare-vapeur et traitement des joints. Calcul des flèches admissibles sous vent et gestion des ponts thermiques par rupteur de façade NF EN 13830.",
      tag:        "FAÇADE",
      image_url:  "",
      _bg:        "linear-gradient(140deg,#0e0e0c 0%,#201e16 55%,#302e20 100%)"
    },
    {
      titre:      "Fondations sur pieux",
      sous_titre: "Pieux forés, battus et vissés : sélection selon la nature du sol et les charges. Dimensionnement par la méthode pressiométrique. Interface pieu-dalle, armatures de liaison au chevêtre et contrôle COFRAC.",
      tag:        "FONDATION",
      image_url:  "",
      _bg:        "linear-gradient(140deg,#0c0a08 0%,#1e1810 55%,#302618 100%)"
    },
    {
      titre:      "ITE — Isolation par l'extérieur",
      sous_titre: "Systèmes ETICS sous enduit et bardage ventilé : fixation mécanique vs collée, jonctions menuiseries et soubassements. Gains en déphasage thermique et compatibilité RE2020 avec vérification pont thermique Th-BCE.",
      tag:        "THERMIQUE",
      image_url:  "",
      _bg:        "linear-gradient(140deg,#080c10 0%,#10182a 55%,#182440 100%)"
    }
  ];

  /* ── DATA_CHRONOS — frise matière-époque technique ─────────── */
  const DATA_CHRONOS = [
    { id: "megalithique", periode: "Mégalithique", dates: "-4500 / -2000", materiau: "Pierre", systeme: "Empilement massif", portee: "Très faible", inertie: "Très forte", outil: "Levier, traîneau, main-d'œuvre", rupture: "Mise en place de masses monumentales.", consequenceSpatiale: "Espace défini par poids, seuil et alignement.", exemples: "Stonehenge, Carnac", tags: ["masse", "seuil"] },
    { id: "grec", periode: "Antiquité grecque", dates: "-700 / -146", materiau: "Pierre", systeme: "Trilithe et ordres", portee: "Faible", inertie: "Forte", outil: "Taille de pierre, levage", rupture: "Codification proportionnelle du portique.", consequenceSpatiale: "Péristyle, frontalité, rythme porteur.", exemples: "Parthénon, Paestum", tags: ["ordre", "trilithe"] },
    { id: "rome", periode: "Rome antique", dates: "-146 / 476", materiau: "Béton", systeme: "Arc, voûte, coupole", portee: "Grande", inertie: "Forte", outil: "Cintres, coffrages, pouzzolane", rupture: "Béton romain et franchissements continus.", consequenceSpatiale: "Thermes, basiliques, espaces couverts monumentaux.", exemples: "Panthéon, thermes de Caracalla", tags: ["voûte", "béton"] },
    { id: "roman", periode: "Roman", dates: "950 / 1150", materiau: "Pierre", systeme: "Mur épais et voûte en berceau", portee: "Moyenne", inertie: "Très forte", outil: "Taille, cintre bois", rupture: "Stabilisation du couvrement maçonné.", consequenceSpatiale: "Nefs sombres, murs porteurs, contreforts.", exemples: "Sainte-Foy de Conques", tags: ["mur", "voûte"] },
    { id: "gothique", periode: "Gothique", dates: "1140 / 1500", materiau: "Pierre", systeme: "Ogive et arc-boutant", portee: "Grande hauteur", inertie: "Forte", outil: "Gabarits, échafaudages", rupture: "Dissociation mur / structure porteuse.", consequenceSpatiale: "Verrières, verticalité, lumière structurelle.", exemples: "Amiens, Chartres", tags: ["poussée", "lumière"] },
    { id: "renaissance", periode: "Renaissance", dates: "1400 / 1650", materiau: "Pierre", systeme: "Coupole, ordre, mur porteur", portee: "Moyenne à grande", inertie: "Forte", outil: "Géométrie, dessin perspectif", rupture: "Chantier gouverné par représentation et calcul géométrique.", consequenceSpatiale: "Centralité, façade proportionnée, dôme urbain.", exemples: "Florence, Villa Rotonda", tags: ["géométrie", "coupole"] },
    { id: "industriel", periode: "Révolution industrielle", dates: "1750 / 1900", materiau: "Acier", systeme: "Fonte, fer, charpente métallique", portee: "Très grande", inertie: "Faible", outil: "Usine, rivetage, préfabrication", rupture: "Production standardisée des pièces.", consequenceSpatiale: "Halles, gares, serres, grands plateaux.", exemples: "Crystal Palace, Galerie des Machines", tags: ["acier", "préfabrication"] },
    { id: "art-nouveau", periode: "Art nouveau", dates: "1890 / 1914", materiau: "Acier", systeme: "Métal ornemental et maçonnerie", portee: "Moyenne", inertie: "Mixte", outil: "Fonte moulée, artisanat industriel", rupture: "Structure et ornement se rapprochent.", consequenceSpatiale: "Lignes continues, façades habitées, verrières.", exemples: "Horta, Guimard, Gaudí", tags: ["ornement", "métal"] },
    { id: "moderne", periode: "Mouvement moderne", dates: "1920 / 1960", materiau: "Béton", systeme: "Poteau-poutre, plan libre", portee: "Moyenne", inertie: "Forte", outil: "Béton armé, standardisation", rupture: "Structure indépendante de la façade.", consequenceSpatiale: "Plateau libre, fenêtre en longueur, toit-terrasse.", exemples: "Villa Savoye, Bauhaus", tags: ["plan libre", "béton"] },
    { id: "brutalisme", periode: "Brutalisme", dates: "1950 / 1980", materiau: "Béton", systeme: "Voile, mégastructure", portee: "Grande", inertie: "Très forte", outil: "Banche, préfabrication lourde", rupture: "Expression directe du coffrage et des services.", consequenceSpatiale: "Masse habitée, rues intérieures, monumentalité.", exemples: "Salk Institute, Barbican", tags: ["banche", "masse"] },
    { id: "high-tech", periode: "High-tech", dates: "1970 / 2000", materiau: "Acier", systeme: "Exosquelette et façade légère", portee: "Très grande", inertie: "Faible", outil: "Dessin industriel, composants", rupture: "Services et structure deviennent visibles.", consequenceSpatiale: "Plateaux libres, maintenance et flexibilité.", exemples: "Pompidou, Lloyd's", tags: ["services", "acier"] },
    { id: "parametrique", periode: "Paramétrique", dates: "1995 / 2020", materiau: "Verre", systeme: "Coques, gridshells, trames numériques", portee: "Variable", inertie: "Faible à moyenne", outil: "BIM, CNC, scripts", rupture: "Géométrie calculée et fabrication numérique.", consequenceSpatiale: "Continuités sol-mur-toiture, enveloppes complexes.", exemples: "Heydar Aliyev Center, Metropol Parasol", tags: ["numérique", "coque"] },
    { id: "bas-carbone", periode: "Bas-carbone contemporain", dates: "2010 / aujourd'hui", materiau: "Biosourcé", systeme: "CLT, terre, réemploi, assemblage sec", portee: "Moyenne", inertie: "Variable", outil: "ACV, préfabrication, démontabilité", rupture: "Le carbone devient contrainte de conception.", consequenceSpatiale: "Trames répétables, réversibilité, hybridation matière.", exemples: "Grand Parc, Gando, immeubles CLT", tags: ["biosourcé", "réemploi"] }
  ];

  const _atlasOptions = {
    id: "atlas",
    titleKey: "titre",
    subtitleKeys: ["pays", "ville", "periode"],
    searchPlaceholder: "Rechercher lieu, matière, climat...",
    filters: [
      { key: "matiere", label: "Matière" },
      { key: "climat", label: "Climat" },
      { key: "periode", label: "Période" },
      { key: "systemeConstructif", label: "Système" }
    ],
    fields: [
      { key: "pays", label: "Pays" },
      { key: "ville", label: "Ville / région" },
      { key: "climat", label: "Climat" },
      { key: "systemeConstructif", label: "Système constructif" },
      { key: "matiere", label: "Matière dominante" },
      { key: "portee", label: "Portée" },
      { key: "inertie", label: "Inertie" },
      { key: "technique", label: "Contrainte technique" }
    ],
    tag: item => item.matiere,
    detailKicker: item => item.climat,
    lesson: item => item.lecon,
    emptyTitle: "Aucun système",
    emptyText: "Aucun système constructif ne correspond aux filtres."
  };

  const _chronosOptions = {
    id: "chronos",
    titleKey: "periode",
    subtitleKeys: ["dates", "materiau", "systeme"],
    searchPlaceholder: "Rechercher période, matériau, rupture...",
    compare: true,
    filters: [{ key: "materiau", label: "Matériau" }],
    fields: [
      { key: "dates", label: "Dates" },
      { key: "materiau", label: "Matériau dominant" },
      { key: "systeme", label: "Système structurel" },
      { key: "portee", label: "Portée possible" },
      { key: "inertie", label: "Inertie" },
      { key: "outil", label: "Outil de chantier" },
      { key: "rupture", label: "Rupture technique" },
      { key: "consequenceSpatiale", label: "Conséquence spatiale" },
      { key: "exemples", label: "Exemples" }
    ],
    tag: item => item.materiau,
    detailKicker: item => item.dates,
    lesson: item => item.consequenceSpatiale,
    emptyTitle: "Aucune période",
    emptyText: "Aucune période ne correspond aux filtres."
  };

  const _pantheonOptions = {
    id: "pantheon",
    titleKey: "nom",
    subtitleKeys: ["epoque", "pays", "doctrine"],
    searchPlaceholder: "Rechercher architecte, pays, doctrine...",
    filters: [
      { key: "epoque", label: "Époque" },
      { key: "matiereDominante", label: "Matière" },
      { key: "doctrine", label: "Doctrine" }
    ],
    fields: [
      { key: "epoque", label: "Époque" },
      { key: "pays", label: "Pays" },
      { key: "doctrine", label: "Doctrine" },
      { key: "systemeFavori", label: "Système favori" },
      { key: "matiereDominante", label: "Matière dominante" },
      { key: "oeuvreRepere", label: "Œuvre repère" },
      { key: "apportTechnique", label: "Apport technique" }
    ],
    tag: item => item.matiereDominante,
    detailKicker: item => item.epoque,
    lesson: item => item.leconProjet,
    emptyTitle: "Aucun architecte",
    emptyText: "Aucun architecte ne correspond aux filtres."
  };

  function initAtlas() {
    const root = document.getElementById("atlas-grid");
    if (!root) return;
    renderTechnicalCards(root, DATA_ATLAS, _atlasOptions);
    _bindTechnicalModule(root, DATA_ATLAS, _atlasOptions);
  }

  function initChronos() {
    const root = document.getElementById("chronos-layout");
    if (!root) return;
    renderTechnicalCards(root, DATA_CHRONOS, _chronosOptions);
    _bindTechnicalModule(root, DATA_CHRONOS, _chronosOptions);
  }

  function initPantheon() {
    const root = document.getElementById("pantheon-grid");
    if (!root) return;
    renderTechnicalCards(root, DATA_PANTHEON, _pantheonOptions);
    _bindTechnicalModule(root, DATA_PANTHEON, _pantheonOptions);
  }

  /* ── Hooks MutationObserver — modules data-driven ──────────── */
  (function hookGridModules() {
    [
      { mod: "module-pantheon", render: initPantheon },
      { mod: "module-atlas",    render: initAtlas },
      { mod: "module-fiches",   render: () => renderGrid("fiches-grid", DATA_FICHES) },
      { mod: "module-chronos",  render: initChronos }
    ].forEach(({ mod, render }) => {
      const el = document.getElementById(mod);
      if (!el) return;
      const run = () => { if (el.classList.contains("is-active")) render(); };
      new MutationObserver(run).observe(el, { attributes: true, attributeFilter: ["class"] });
      run();
    });
  })();

/* ── CSS Normothèque (injecté une fois) ─────────────────────── */
  (function injectNormesCSS() {
    if (document.getElementById("tm-normes-css")) return;
    const s = document.createElement("style");
    s.id = "tm-normes-css";
    s.textContent = `
      .tm-normes-split {
        display: grid;
        grid-template-columns: 228px 1fr;
        gap: 1rem;
        min-height: 500px;
      }
      .tm-normes-cats {
        display: flex;
        flex-direction: column;
        gap: .32rem;
        padding: .85rem;
        border: 0.5px solid rgba(245,245,241,.09);
        border-radius: 16px;
        background: #0C0C0A;
        align-content: start;
      }
      .tm-normes-cats-title {
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: .56rem;
        font-weight: 500;
        letter-spacing: .17em;
        text-transform: uppercase;
        color: #7A7670;
        padding: .3rem .5rem .5rem;
      }
      .tm-normes-cat-btn {
        display: grid;
        grid-template-columns: 8px 1fr;
        align-items: center;
        gap: .72rem;
        padding: .72rem .85rem;
        border: 0.5px solid transparent;
        border-radius: 10px;
        background: transparent;
        text-align: left;
        cursor: pointer;
        transition: background .18s ease, border-color .18s ease, color .18s ease;
      }
      .tm-normes-cat-btn:hover {
        background: rgba(201,169,110,.06);
        border-color: rgba(201,169,110,.14);
      }
      .tm-normes-cat-btn.is-active {
        background: rgba(201,169,110,.13);
        border-color: rgba(201,169,110,.38);
      }
      .tm-normes-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(201,169,110,.28);
        flex-shrink: 0;
        transition: background .18s ease, box-shadow .18s ease;
      }
      .tm-normes-cat-btn.is-active .tm-normes-dot {
        background: #C9A96E;
        box-shadow: 0 0 6px rgba(201,169,110,.5);
      }
      .tm-normes-cat-text { display: grid; gap: 2px; }
      .tm-normes-cat-label {
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: .80rem;
        font-weight: 400;
        color: #C8C4BA;
        line-height: 1;
      }
      .tm-normes-cat-btn.is-active .tm-normes-cat-label { color: #F5F5F1; }
      .tm-normes-cat-count {
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: .58rem;
        color: #7A7670;
        line-height: 1;
      }
      .tm-normes-panel { display: grid; gap: .85rem; align-content: start; }
      .tm-normes-header {
        padding-bottom: .72rem;
        border-bottom: 0.5px solid rgba(245,245,241,.09);
      }
      .tm-normes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(192px, 1fr));
        gap: .72rem;
      }
      .tm-normes-item {
        display: grid;
        gap: .5rem;
        padding: 1rem 1.1rem;
        border: 0.5px solid rgba(245,245,241,.09);
        border-radius: 14px;
        background: #0C0C0A;
        transition: border-color .18s ease;
      }
      .tm-normes-item:hover { border-color: rgba(201,169,110,.28); }
      .tm-normes-dim {
        font-family: "Cormorant Garamond", Georgia, serif;
        font-size: 1.75rem;
        font-weight: 300;
        color: #C9A96E;
        line-height: 1;
        margin: 0;
      }
      .tm-normes-nom {
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: .80rem;
        font-weight: 400;
        color: #F5F5F1;
        margin: 0;
      }
      .tm-normes-note {
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: .70rem;
        font-weight: 300;
        color: #7A7670;
        line-height: 1.55;
        margin: 0;
      }
      .tm-normes-tags { display:flex; flex-wrap:wrap; gap:.26rem; margin-top:.1rem; }
      .tm-normes-tag {
        padding:.12rem .38rem;
        border:0.5px solid rgba(201,169,110,.18);
        border-radius:999px;
        color:#9A8D72;
        font-size:.54rem;
        letter-spacing:.07em;
        text-transform:uppercase;
      }
      .tm-outils-stack { display:grid; gap:1.2rem; }
      .tm-tools-scale-grid { display:grid; grid-template-columns:1fr 1fr auto; gap:.72rem; align-items:end; }
      @media (max-width: 800px) {
        .tm-tools-scale-grid { grid-template-columns:1fr; }
      }
      @media (max-width: 800px) {
        .tm-normes-split { grid-template-columns: 1fr; }
        .tm-normes-cats  { flex-direction: row; flex-wrap: wrap; align-content: start; }
      }
    `;
    document.head.appendChild(s);
  })();

  /* ── DATA_NORMES — dimensions par pièce ─────────────────────── */
  const DATA_NORMES = [
    {
      id: "salon",
      label: "Salon",
      kicker: "Mobilier et recul de confort",
      items: [
        { nom: "Canapé 2 places", valeur: "160-180 x 90 cm", dir: "h", note: "Assise compacte pour petit séjour.", tags: ["assise", "mobilier"] },
        { nom: "Canapé 3 places", valeur: "210-240 x 95 cm", dir: "h", note: "Prévoir un passage libre en périphérie.", tags: ["assise", "mobilier"] },
        { nom: "Table basse", valeur: "90-120 x 50-70 cm", dir: "h", note: "Laisser 35 à 45 cm entre canapé et table.", tags: ["table"] },
        { nom: "Meuble TV", valeur: "P 35-45 cm", dir: "h", note: "Hauteur basse recommandée : 40 à 55 cm.", tags: ["tv", "rangement"] },
        { nom: "Distance canapé / TV", valeur: "2,0-3,5 m", dir: "h", note: "À ajuster selon diagonale de l'écran.", tags: ["recul", "tv"] },
        { nom: "Passage autour du mobilier", valeur: "70-90 cm", dir: "h", note: "90 cm si circulation principale.", tags: ["circulation"] }
      ]
    },
    {
      id: "chambre",
      label: "Chambre",
      kicker: "Couchage et rangement",
      items: [
        { nom: "Lit simple 90 x 190", valeur: "90 x 190 cm", dir: "h", note: "Dégagement latéral conseillé : 60 cm.", tags: ["lit"] },
        { nom: "Lit double 140 x 190", valeur: "140 x 190 cm", dir: "h", note: "Solution standard compacte.", tags: ["lit"] },
        { nom: "Lit queen 160 x 200", valeur: "160 x 200 cm", dir: "h", note: "Confort avec 70 cm libres de chaque côté.", tags: ["lit"] },
        { nom: "Table de nuit", valeur: "40-50 x 35-45 cm", dir: "h", note: "Aligner avec hauteur du matelas.", tags: ["mobilier"] },
        { nom: "Armoire profondeur 60 cm", valeur: "P 60 cm", dir: "h", note: "Profondeur utile pour cintres.", tags: ["rangement"] },
        { nom: "Circulation autour du lit", valeur: "60-75 cm", dir: "h", note: "75 cm pour confort quotidien.", tags: ["circulation"] }
      ]
    },
    {
      id: "cuisine",
      label: "Cuisine",
      kicker: "Plans, dégagements et triangle",
      items: [
        { nom: "Plan de travail hauteur 90 cm", valeur: "H 90 cm", dir: "v", note: "Hauteur courante pour préparation debout.", tags: ["plan"] },
        { nom: "Profondeur plan 60 cm", valeur: "P 60 cm", dir: "h", note: "Base standard électroménager et meuble bas.", tags: ["plan"] },
        { nom: "Îlot central", valeur: "90 x 180 cm min.", dir: "h", note: "Ajouter 90 cm de circulation autour.", tags: ["ilot"] },
        { nom: "Dégagement devant meuble", valeur: "90-120 cm", dir: "h", note: "120 cm si deux personnes travaillent.", tags: ["circulation"] },
        { nom: "Hauteur meuble haut", valeur: "H 140-150 cm bas", dir: "v", note: "Sous meuble haut à adapter à l'utilisateur.", tags: ["rangement"] },
        { nom: "Triangle d'activité", valeur: "4-7 m cumulés", dir: "h", note: "Évier, cuisson, froid : éviter les parcours excessifs.", tags: ["ergonomie"] }
      ]
    },
    {
      id: "salle-bain",
      label: "Salle de bain",
      kicker: "Eau, recul et équipements",
      items: [
        { nom: "Douche standard", valeur: "80 x 120 cm", dir: "h", note: "80 x 80 cm reste minimal.", tags: ["douche"] },
        { nom: "Douche confortable", valeur: "90 x 140 cm", dir: "h", note: "Confort de mouvement et entretien.", tags: ["douche"] },
        { nom: "Baignoire", valeur: "70 x 170 cm", dir: "h", note: "Prévoir accès robinetterie et tablier.", tags: ["bain"] },
        { nom: "Lavabo", valeur: "L 60 cm", dir: "h", note: "Pose courante à 85-90 cm de haut.", tags: ["vasque"] },
        { nom: "Meuble vasque", valeur: "P 45-55 cm", dir: "h", note: "Largeur confortable : 80 à 120 cm.", tags: ["rangement"] },
        { nom: "Dégagement devant lavabo", valeur: "70-90 cm", dir: "h", note: "90 cm recommandé devant meuble tiroir.", tags: ["circulation"] }
      ]
    },
    {
      id: "wc",
      label: "WC",
      kicker: "Cabinet et dégagements",
      items: [
        { nom: "WC standard", valeur: "80 x 120 cm", dir: "h", note: "Minimum courant hors contraintes PMR.", tags: ["sanitaire"] },
        { nom: "WC PMR", valeur: "150 x 150 cm", dir: "h", note: "Aire de rotation libre et transfert latéral.", tags: ["pmr"] },
        { nom: "Dégagement latéral", valeur: "80 cm", dir: "h", note: "Utile pour transfert PMR.", tags: ["pmr"] },
        { nom: "Lave-main", valeur: "P 22-30 cm", dir: "h", note: "Solution compacte en angle ou murale.", tags: ["eau"] },
        { nom: "Porte ouvrant extérieur recommandée", valeur: "L 83-90 cm", dir: "h", note: "Réduit les conflits d'usage en pièce étroite.", tags: ["porte"] }
      ]
    },
    {
      id: "bureau",
      label: "Bureau",
      kicker: "Poste de travail",
      items: [
        { nom: "Bureau 120 x 60", valeur: "120 x 60 cm", dir: "h", note: "Format minimal efficace pour laptop + carnet.", tags: ["travail"] },
        { nom: "Chaise", valeur: "45 x 45 cm", dir: "h", note: "Assise standard, dossier variable.", tags: ["assise"] },
        { nom: "Recul chaise", valeur: "80-100 cm", dir: "h", note: "Prévoir le mouvement de sortie.", tags: ["circulation"] },
        { nom: "Hauteur écran", valeur: "Axe yeux", dir: "v", note: "Sommet écran proche du niveau des yeux.", tags: ["ergonomie"] },
        { nom: "Rangement", valeur: "P 35-45 cm", dir: "h", note: "Bibliothèque ou caisson de bureau.", tags: ["rangement"] }
      ]
    },
    {
      id: "garage",
      label: "Garage",
      kicker: "Stationnement et stockage",
      items: [
        { nom: "Place voiture standard", valeur: "2,50 x 5,00 m", dir: "h", note: "Minimum courant pour stationnement.", tags: ["voiture"] },
        { nom: "Place voiture confortable", valeur: "3,00 x 5,50 m", dir: "h", note: "Ouverture de portières plus simple.", tags: ["voiture"] },
        { nom: "Largeur porte garage", valeur: "2,40-3,00 m", dir: "h", note: "3 m recommandé pour usage confortable.", tags: ["porte"] },
        { nom: "Rangement vélo", valeur: "60 x 180 cm", dir: "h", note: "Ajouter zone de manœuvre.", tags: ["vélo"] },
        { nom: "Circulation latérale", valeur: "70-90 cm", dir: "h", note: "Nécessaire entre véhicule et mur.", tags: ["circulation"] }
      ]
    },
    {
      id: "jardin-terrasse",
      label: "Jardin / Terrasse",
      kicker: "Mobilier extérieur",
      items: [
        { nom: "Table extérieure", valeur: "160 x 90 cm", dir: "h", note: "6 places compactes.", tags: ["table"] },
        { nom: "Chaise extérieure", valeur: "55 x 60 cm", dir: "h", note: "Prévoir recul arrière.", tags: ["assise"] },
        { nom: "Passage terrasse", valeur: "90-120 cm", dir: "h", note: "120 cm si accès principal.", tags: ["circulation"] },
        { nom: "Jardinière", valeur: "P 40-60 cm", dir: "h", note: "Prévoir drainage et entretien.", tags: ["végétal"] },
        { nom: "Barbecue / zone technique", valeur: "120 x 80 cm", dir: "h", note: "Éloigner des ouvrants et matériaux sensibles.", tags: ["technique"] }
      ]
    },
    {
      id: "circulations",
      label: "Circulations",
      kicker: "Passages et franchissements",
      items: [
        { nom: "Couloir standard", valeur: "90 cm", dir: "h", note: "Minimum pratique logement.", tags: ["passage"] },
        { nom: "Passage confortable", valeur: "120 cm", dir: "h", note: "Permet croisement et portage.", tags: ["passage"] },
        { nom: "Porte standard", valeur: "83 cm", dir: "h", note: "Passage utile environ 73 cm.", tags: ["porte"] },
        { nom: "Escalier Blondel", valeur: "G + 2H = 63", dir: "v", note: "Giron 28-32 cm, hauteur 17-18 cm.", tags: ["escalier"] },
        { nom: "Aire de retournement", valeur: "Ø 150 cm", dir: "h", note: "Référence PMR pour rotation complète.", tags: ["pmr"] }
      ]
    },
    {
      id: "pmr",
      label: "Accessibilité PMR",
      kicker: "Gabarits accessibles",
      items: [
        { nom: "Rotation fauteuil Ø150 cm", valeur: "Ø 150 cm", dir: "h", note: "Aire libre de tout obstacle.", tags: ["fauteuil"] },
        { nom: "Porte 90 cm", valeur: "L 90 cm", dir: "h", note: "Passage utile compatible accessibilité.", tags: ["porte"] },
        { nom: "Douche accessible", valeur: "120 x 90 cm min.", dir: "h", note: "Receveur sans ressaut recommandé.", tags: ["douche"] },
        { nom: "WC accessible", valeur: "150 x 150 cm", dir: "h", note: "Rotation + transfert latéral.", tags: ["wc"] },
        { nom: "Pente rampe", valeur: "5 % courant", dir: "v", note: "Pentes plus fortes seulement sur faibles longueurs.", tags: ["rampe"] },
        { nom: "Hauteur interrupteurs", valeur: "90-130 cm", dir: "v", note: "Zone d'atteinte confortable.", tags: ["électricité"] }
      ]
    }
  ];

  /* ── Schéma SVG de cote architecturale ──────────────────────── */
  const _svgCote = dir => dir === "v"
    ? /* cote verticale */
      `<svg viewBox="0 0 44 56" width="36" height="46" aria-hidden="true">
         <line x1="22" y1="5"  x2="22" y2="51" stroke="#C9A96E" stroke-width="0.8"/>
         <line x1="11" y1="5"  x2="33" y2="5"  stroke="#C9A96E" stroke-width="0.8"/>
         <line x1="11" y1="51" x2="33" y2="51" stroke="#C9A96E" stroke-width="0.8"/>
         <polygon points="22,8  19,17 25,17" fill="#C9A96E"/>
         <polygon points="22,48 19,39 25,39" fill="#C9A96E"/>
       </svg>`
    : /* cote horizontale */
      `<svg viewBox="0 0 96 28" width="80" height="23" aria-hidden="true">
         <line x1="5"  y1="14" x2="91" y2="14" stroke="#C9A96E" stroke-width="0.8"/>
         <line x1="5"  y1="5"  x2="5"  y2="23" stroke="#C9A96E" stroke-width="0.8"/>
         <line x1="91" y1="5"  x2="91" y2="23" stroke="#C9A96E" stroke-width="0.8"/>
         <polygon points="8,14  17,11 17,17" fill="#C9A96E"/>
         <polygon points="88,14 79,11 79,17" fill="#C9A96E"/>
       </svg>`;

  const _filterNormes = (cat, query = "") => {
    const needle = String(query || "").trim().toLowerCase();
    if (!needle) return cat.items;
    return cat.items.filter(item =>
      [item.nom, item.valeur, item.note, ...(item.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  };

  /* ── Rendu panneau droit ─────────────────────────────────────── */
  const _renderNormesPanel = (cat, query = "") => {
    const items = _filterNormes(cat, query);
    return `
    <div class="tm-normes-header">
      <p style="margin:0 0 .22rem;text-transform:uppercase;letter-spacing:.17em;font-size:.58rem;font-weight:500;color:var(--gold)">${cat.kicker}</p>
      <h3 style="font-family:var(--serif);font-size:2rem;font-weight:300;line-height:1;color:var(--ink);margin:0">${cat.label}</h3>
      ${query ? `<p style="margin:.42rem 0 0;color:var(--muted);font-size:.72rem">${items.length} résultat${items.length > 1 ? "s" : ""} pour "${_esc(query)}"</p>` : ""}
    </div>
    <div class="tm-normes-grid">
      ${items.length ? items.map(item => `
        <article class="tm-normes-item">
          ${_svgCote(item.dir)}
          <p class="tm-normes-dim">${_esc(item.valeur)}</p>
          <p class="tm-normes-nom">${_esc(item.nom)}</p>
          <p class="tm-normes-note">${_esc(item.note)}</p>
          ${item.tags?.length
            ? `<div class="tm-normes-tags">${item.tags.map(tag => `<span class="tm-normes-tag">${_esc(tag)}</span>`).join("")}</div>`
            : ""}
        </article>
      `).join("") : `<article class="tm-normes-item"><p class="tm-normes-note">Aucune dimension ne correspond à cette recherche dans cette catégorie.</p></article>`}
    </div>
  `;
  };

  const _renderScaleCalculator = () => `
    <article class="card" id="tools-scale-card">
      <p style="margin:0 0 .18rem;text-transform:uppercase;letter-spacing:.17em;font-size:.58rem;font-weight:500;color:var(--gold)">Convention d'échelle</p>
      <h3 style="font-family:var(--serif);font-size:1.7rem;font-weight:300;line-height:1;color:var(--ink);margin:0 0 1rem">Échelle exacte</h3>
      <div class="tm-tools-scale-grid">
        <label class="field">
          <span style="font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:.28rem">Mesure réelle</span>
          <div style="display:grid;grid-template-columns:1fr auto;gap:.5rem">
            <input id="tools-scale-real" type="number" min="0.001" step="any" placeholder="ex : 5" style="width:100%" />
            <select id="tools-scale-unit" style="background:var(--surface-2);border:var(--border);color:var(--ink);border-radius:var(--r-sm);padding:.4rem .6rem;font-size:.82rem;cursor:pointer">
              <option value="1000">m</option>
              <option value="10">cm</option>
              <option value="1" selected>mm</option>
            </select>
          </div>
        </label>
        <label class="field">
          <span style="font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:.28rem">Mesure sur plan en mm</span>
          <input id="tools-scale-plan" type="number" min="0.001" step="any" placeholder="ex : 50" style="width:100%" />
        </label>
        <button type="button" id="tools-scale-btn" class="text-btn text-btn--primary" style="white-space:nowrap">Calculer l'échelle</button>
      </div>
      <div id="tools-scale-result" style="display:none;margin-top:.85rem;padding:.85rem;background:rgba(201,169,110,.07);border:0.5px solid rgba(201,169,110,.32);border-radius:var(--r-sm);text-align:center">
        <p id="tools-scale-main" style="font-family:var(--serif);font-size:2rem;font-weight:300;color:var(--gold);margin:0 0 .2rem"></p>
        <p id="tools-scale-nearest" style="font-size:.68rem;color:var(--muted);margin:0;letter-spacing:.08em"></p>
      </div>
      <p id="tools-scale-error" style="display:none;font-size:.72rem;color:#e07070;text-align:center;margin:.72rem 0 0"></p>
    </article>
  `;

  function _calculateScale(root) {
    const realEl = root.querySelector("#tools-scale-real");
    const unitEl = root.querySelector("#tools-scale-unit");
    const planEl = root.querySelector("#tools-scale-plan");
    const errEl = root.querySelector("#tools-scale-error");
    const resEl = root.querySelector("#tools-scale-result");
    const mainEl = root.querySelector("#tools-scale-main");
    const nearestEl = root.querySelector("#tools-scale-nearest");

    if (!realEl || !unitEl || !planEl || !errEl || !resEl || !mainEl || !nearestEl) return;

    const realRaw = parseFloat(realEl.value);
    const planRaw = parseFloat(planEl.value);
    const unitMult = parseFloat(unitEl.value);

    errEl.style.display = "none";
    resEl.style.display = "none";

    if (!realRaw || !planRaw || realRaw <= 0 || planRaw <= 0) {
      errEl.textContent = "Entre deux valeurs positives.";
      errEl.style.display = "block";
      return;
    }

    const realMm = realRaw * unitMult;
    const denom = Math.round(realMm / planRaw);

    if (denom < 1) {
      errEl.textContent = "La mesure sur plan est plus grande que la mesure réelle.";
      errEl.style.display = "block";
      return;
    }

    const standards = [1, 2, 5, 10, 20, 25, 33, 50, 75, 100, 125, 200, 250, 500, 1000, 2000, 5000];
    const nearest = standards.reduce((a, b) =>
      Math.abs(b - denom) < Math.abs(a - denom) ? b : a
    );

    mainEl.textContent = `1 : ${denom.toLocaleString("fr-FR")}`;
    nearestEl.textContent =
      nearest === denom
        ? "Échelle standard exacte"
        : `Échelle standard la plus proche : 1 : ${nearest.toLocaleString("fr-FR")}`;

    resEl.style.display = "block";
  }

  /* ── initOutils : injection dans #outils-layout ─────────────── */
  let _normesActiveId = null; /* préservé entre les visites */

  function initOutils() {
    const root = document.getElementById("outils-layout");
    if (!root) return;

    if (!_normesActiveId) _normesActiveId = DATA_NORMES[0].id;
    const active = DATA_NORMES.find(c => c.id === _normesActiveId) || DATA_NORMES[0];

    root.innerHTML = `
      <div class="tm-outils-stack">
        <article class="card">
          <div style="display:flex;justify-content:space-between;gap:1rem;align-items:end;flex-wrap:wrap;margin-bottom:1rem">
            <div>
              <p style="margin:0 0 .18rem;text-transform:uppercase;letter-spacing:.17em;font-size:.58rem;font-weight:500;color:var(--gold)">Normes par pièce</p>
              <h3 style="font-family:var(--serif);font-size:2rem;font-weight:300;line-height:1;color:var(--ink);margin:0">Dimensions de mobilier</h3>
            </div>
            <label class="field" style="min-width:min(100%,260px)">
              <input id="tools-normes-search" type="search" placeholder="Rechercher une dimension..." autocomplete="off" />
            </label>
          </div>
          <div class="tm-normes-split">
            <nav class="tm-normes-cats" aria-label="Catégories de normes">
              <span class="tm-normes-cats-title">Pièces</span>
              ${DATA_NORMES.map(cat => `
                <button type="button"
                        class="tm-normes-cat-btn ${cat.id === active.id ? "is-active" : ""}"
                        data-normes-cat="${cat.id}"
                        aria-pressed="${cat.id === active.id}">
                  <span class="tm-normes-dot" aria-hidden="true"></span>
                  <span class="tm-normes-cat-text">
                    <span class="tm-normes-cat-label">${cat.label}</span>
                    <span class="tm-normes-cat-count">${cat.items.length} dimensions</span>
                  </span>
                </button>
              `).join("")}
            </nav>

            <div class="tm-normes-panel" id="tm-normes-panel">
              ${_renderNormesPanel(active)}
            </div>
          </div>
        </article>
        ${_renderScaleCalculator()}
      </div>
    `;

    const renderActivePanel = () => {
      const cat = DATA_NORMES.find(c => c.id === _normesActiveId) || DATA_NORMES[0];
      const query = root.querySelector("#tools-normes-search")?.value || "";
      const panel = root.querySelector("#tm-normes-panel");
      if (panel) panel.innerHTML = _renderNormesPanel(cat, query);
    };

    root.querySelectorAll("[data-normes-cat]").forEach(btn =>
      btn.addEventListener("click", () => {
        const cat = DATA_NORMES.find(c => c.id === btn.dataset.normesCat);
        if (!cat || cat.id === _normesActiveId) return;
        _normesActiveId = cat.id;

        root.querySelectorAll("[data-normes-cat]").forEach(b => {
          const on = b.dataset.normesCat === _normesActiveId;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", on);
        });

        renderActivePanel();
      })
    );

    root.querySelector("#tools-normes-search")?.addEventListener("input", renderActivePanel);
    root.querySelector("#tools-scale-btn")?.addEventListener("click", () => _calculateScale(root));
    ["tools-scale-real", "tools-scale-plan"].forEach(id =>
      root.querySelector("#" + id)?.addEventListener("keydown", e => {
        if (e.key === "Enter") _calculateScale(root);
      })
    );
  }

  /* ── Hook MutationObserver — module-outils ───────────────────── */
  (function hookOutils() {
    const mod = document.getElementById("module-outils");
    if (!mod) return;
    new MutationObserver(() => {
      if (mod.classList.contains("is-active")) initOutils();
    }).observe(mod, { attributes: true, attributeFilter: ["class"] });
    if (mod.classList.contains("is-active")) initOutils();
  })();

/* ── CSS Profil + Premium (injecté une fois) ─────────────────── */
  (function injectProfilCSS() {
    if (document.getElementById("tm-profil-css")) return;
    const s = document.createElement("style");
    s.id = "tm-profil-css";
    s.textContent = `
      .tm-profil-hero {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1.618rem;
        align-items: center;
        padding: 2rem;
        border: var(--border-gold);
        border-radius: var(--r-xl);
        background: radial-gradient(ellipse at 20% 50%, rgba(201,169,110,.07) 0%, transparent 60%),
                    var(--surface);
      }
      .tm-profil-avatar {
        width: 72px; height: 72px;
        display: grid; place-items: center;
        border: 0.5px solid rgba(201,169,110,.50);
        border-radius: 50%;
        background: rgba(201,169,110,.09);
        color: var(--gold);
        font-family: var(--serif);
        font-size: 1.9rem; font-weight: 300;
        flex-shrink: 0;
      }
      .tm-profil-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
      }
      @media (max-width: 860px) { .tm-profil-stats { grid-template-columns: repeat(2,1fr); } }
      @media (max-width: 560px) {
        .tm-profil-hero  { grid-template-columns: 1fr; text-align: center; }
        .tm-profil-stats { grid-template-columns: repeat(2,1fr); }
      }
      .tm-profil-stat {
        padding: 1rem 1.1rem;
        border: var(--border);
        border-radius: var(--r-md);
        background: color-mix(in srgb, var(--surface-2) 60%, transparent);
        display: grid; gap: .22rem;
        transition: border-color .18s ease;
      }
      .tm-profil-stat:hover { border-color: rgba(201,169,110,.28); }
      .tm-profil-stat__val {
        font-family: var(--serif);
        font-size: 2.2rem; font-weight: 300; line-height: 1;
        color: var(--gold);
      }
      .tm-profil-stat__lbl {
        font-size: .60rem; font-weight: 400;
        letter-spacing: .14em; text-transform: uppercase;
        color: var(--muted);
      }
      .tm-profil-actions { display: flex; gap: .78rem; flex-wrap: wrap; align-items: center; }
      .tm-role-wrap { position: relative; display: inline-flex; align-items: center; }
      .tm-role-wrap::after {
        content: ""; position: absolute; right: .6rem; top: 50%; transform: translateY(-50%);
        width: 0; height: 0;
        border-left: 4px solid transparent; border-right: 4px solid transparent;
        border-top: 5px solid var(--muted); pointer-events: none;
      }
      .tm-role-select {
        height: 32px; padding: 0 1.8rem 0 .75rem;
        border: var(--border); border-radius: var(--r-pill);
        background: color-mix(in srgb, var(--surface) 70%, transparent);
        color: var(--ink-2); font-size: .62rem; font-weight: 400;
        letter-spacing: .12em; text-transform: uppercase;
        cursor: pointer; appearance: none; -webkit-appearance: none;
        transition: border-color .18s ease;
      }
      .tm-role-select:focus { outline: none; border-color: rgba(201,169,110,.38); }

      /* ── Pricing ── */
      .tm-pricing-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0,1fr));
        gap: 1.618rem; align-items: start;
      }
      @media (max-width: 820px) {
        .tm-pricing-grid { grid-template-columns: 1fr; max-width: 420px; margin-inline: auto; }
      }
      .tm-plan {
        display: grid; gap: 1.2rem;
        padding: 1.8rem 1.6rem 2rem;
        border: var(--border); border-radius: var(--r-xl);
        background: var(--surface);
        transition: box-shadow .22s ease, transform .22s ease;
      }
      .tm-plan:hover { transform: translateY(-2px); }
      .tm-plan--studio {
        border: 0.5px solid rgba(201,169,110,.58);
        background:
          radial-gradient(ellipse at 50% 0%, rgba(201,169,110,.09) 0%, transparent 65%),
          var(--surface);
        box-shadow: 0 0 0 0.5px rgba(201,169,110,.14), 0 24px 60px rgba(0,0,0,.60);
      }
      .tm-plan--studio:hover {
        box-shadow: 0 0 0 0.5px rgba(201,169,110,.30), 0 32px 80px rgba(0,0,0,.70);
      }
      .tm-plan__badge {
        display: inline-flex; align-self: start;
        padding: .14rem .55rem;
        border: 0.5px solid rgba(201,169,110,.42); border-radius: 999px;
        background: rgba(201,169,110,.09); color: var(--gold);
        font-family: var(--mono); font-size: .58rem;
        letter-spacing: .12em; text-transform: uppercase;
      }
      .tm-plan__name {
        font-family: var(--serif); font-size: 2rem; font-weight: 300;
        line-height: 1; color: var(--ink); margin: 0;
      }
      .tm-plan__price { display: flex; align-items: baseline; gap: .22rem; }
      .tm-plan__currency { font-size: 1.4rem; color: var(--gold); align-self: flex-start; margin-top: .3rem; }
      .tm-plan__amount  { font-family: var(--serif); font-size: 3.4rem; font-weight: 300; line-height: 1; color: var(--gold); }
      .tm-plan__period  { font-size: .72rem; color: var(--muted); }
      .tm-plan__divider { height: 0.5px; background: rgba(245,245,241,.08); }
      .tm-plan__features { display: grid; gap: .62rem; }
      .tm-plan__feature {
        display: flex; align-items: flex-start; gap: .55rem;
        font-size: .83rem; color: var(--ink-2); line-height: 1.45;
      }
      .tm-plan__feature-icon { flex-shrink: 0; width: 16px; height: 16px; margin-top: .10rem; color: var(--ok); }
      .tm-plan__feature--off { color: var(--muted); }
      .tm-plan__feature--off .tm-plan__feature-icon { color: var(--muted); opacity: .38; }
      .tm-plan__cta {
        display: block; width: 100%; padding: .72rem 1rem;
        text-align: center; border-radius: var(--r-pill);
        border: var(--border); background: transparent; color: var(--ink-2);
        font-family: var(--sans); font-size: .66rem; font-weight: 400;
        letter-spacing: .14em; text-transform: uppercase; cursor: pointer;
        transition: border-color .18s ease, color .18s ease, background .18s ease, transform .18s ease;
      }
      .tm-plan__cta:hover { border-color: var(--gold); color: var(--ink); transform: translateY(-1px); }
      .tm-plan__cta--checkout {
        background: var(--gold); border-color: var(--gold); color: #050505; font-weight: 500;
      }
      .tm-plan__cta--checkout:hover {
        background: color-mix(in srgb, var(--gold) 84%, #fff);
        border-color: color-mix(in srgb, var(--gold) 84%, #fff); color: #050505;
      }
      .tm-plan__cta.is-loading,
      .tm-plan__cta:disabled {
        opacity: .58; cursor: progress; transform: none;
      }
      .tm-plan__cta--gold {
        background: var(--gold); border-color: var(--gold); color: #050505; font-weight: 500;
      }
      .tm-plan__cta--gold:hover {
        background: color-mix(in srgb, var(--gold) 84%, #fff);
        border-color: color-mix(in srgb, var(--gold) 84%, #fff); color: #050505;
      }
      /* ── Stripe Checkout — conteneur TEOMARCHI ── */
      .tm-stripe-wrap {
        width: 100%;
        margin-top: .62rem;
        display: grid;
        gap: .55rem;
      }
      .tm-stripe-secure {
        display: flex; align-items: center; justify-content: center; gap: .38rem;
        font-size: .57rem; font-weight: 400; letter-spacing: .10em;
        text-transform: uppercase; color: var(--muted);
      }
      .tm-stripe-secure svg { opacity: .5; flex-shrink: 0; }
    `;
    document.head.appendChild(s);
  })();

  /* ── Profil : stats calculées, jamais de faux projets ───────── */
  const _profileStats = () => {
    const journalier = (typeof TEOMARCHI_APP !== "undefined")
      ? TEOMARCHI_APP.journalier.get()
      : null;
    const projects = Object.values(journalier?.projects || {});
    const activeProjects = projects.filter(project =>
      project.title || project.deadline || project.tasks?.length || project.deadlines?.length
    ).length;
    const tasks = projects.flatMap(project => project.tasks || []);
    const done = tasks.filter(task => task.done || task.progress >= 100).length;
    return [
      { val: String(activeProjects), lbl: "Projets actifs" },
      { val: String(tasks.length),   lbl: "Tâches créées" },
      { val: String(done),           lbl: "Tâches terminées" },
      { val: "0",                    lbl: "Rendus publiés" }
    ];
  };

  const _PROFIL_ROLES = [
    { val: "L1",  lbl: "Licence 1"                 },
    { val: "L2",  lbl: "Licence 2"                 },
    { val: "L3",  lbl: "Licence 3"                 },
    { val: "M1",  lbl: "Master 1"                  },
    { val: "M2",  lbl: "Master 2"                  },
    { val: "ARC", lbl: "Architecte DPLG"           },
    { val: "ENS", lbl: "Enseignant"                },
    { val: "AMO", lbl: "AMO / Maîtrise d'ouvrage"  }
  ];

  /* ── initProfil : injection dans #profil-social ──────────────── */
  function initProfil() {
    const root = document.getElementById("profil-social");
    if (!root) return;

    function _render() {
      const sess     = (typeof TEOMARCHI_APP !== "undefined") ? TEOMARCHI_APP.session.get() : null;
      const name     = sess ? _esc(sess.name)  : "Utilisateur invité";
      const roleText = sess ? _esc(sess.email || sess.role)  : "Non connecté";
      const grade    = sess ? _esc(sess.grade) : "—";
      const initials = sess
        ? sess.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
        : "T";
      const avatar = sess?.photoURL
        ? `<img src="${_esc(sess.photoURL)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
        : initials;
      const stats = _profileStats();

      root.innerHTML = `
        <div style="display:grid;gap:1.618rem">

          <div class="tm-profil-hero">
            <div class="tm-profil-avatar" aria-hidden="true">${avatar}</div>
            <div>
              <p style="margin:0 0 .22rem;text-transform:uppercase;letter-spacing:.17em;
                        font-size:.58rem;font-weight:500;color:var(--gold)">Profil utilisateur</p>
              <h3 style="font-family:var(--serif);font-size:2.2rem;font-weight:300;
                         line-height:1.04;color:var(--ink);margin:0 0 .38rem">${name}</h3>
              <div style="display:flex;flex-wrap:wrap;gap:.5rem;align-items:center">
                <span class="badge">${grade}</span>
                <span style="font-size:.78rem;color:var(--muted)">${roleText}</span>
              </div>
            </div>
          </div>

          <div class="tm-profil-stats">
            ${stats.map(s => `
              <div class="tm-profil-stat">
                <span class="tm-profil-stat__val">${s.val}</span>
                <span class="tm-profil-stat__lbl">${s.lbl}</span>
              </div>
            `).join("")}
          </div>

          <article class="card" style="display:grid;gap:1rem">
            <div>
              <p style="margin:0 0 .18rem;text-transform:uppercase;letter-spacing:.17em;
                        font-size:.58rem;font-weight:500;color:var(--gold)">Paramètres</p>
              <h3 style="font-family:var(--serif);font-size:1.7rem;font-weight:300;
                         line-height:1;color:var(--ink);margin:0">Compte &amp; affichage</h3>
            </div>
            <div style="height:.5px;background:rgba(245,245,241,.08)"></div>

            <div style="display:flex;justify-content:space-between;align-items:center;
                        gap:1rem;flex-wrap:wrap">
              <div>
                <p style="margin:0 0 .10rem;font-size:.78rem;color:var(--ink-2)">Niveau d'études / Profession</p>
                <p style="margin:0;font-size:.68rem;color:var(--muted)">Adapte les contenus et les normes affichées</p>
              </div>
              <div class="tm-role-wrap">
                <select class="tm-role-select" id="profil-role-select" aria-label="Sélecteur de rôle">
                  ${_PROFIL_ROLES.map(r =>
                    `<option value="${r.val}" ${grade === r.val ? "selected" : ""}>${_esc(r.lbl)}</option>`
                  ).join("")}
                </select>
              </div>
            </div>

            <div style="height:.5px;background:rgba(245,245,241,.08)"></div>
            <div class="tm-profil-actions">
              <button class="text-btn" id="profil-theme-btn" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                     style="width:13px;height:13px;flex-shrink:0" aria-hidden="true">
                  <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.8 6.8 0 0 0 9.8 9.8Z"/>
                </svg>
                <span>Basculer le thème</span>
              </button>
              <button class="text-btn ${sess ? "" : "text-btn--primary"}"
                      id="profil-session-btn" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
                     style="width:12px;height:12px;flex-shrink:0" aria-hidden="true">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                <span>${sess ? "Déconnexion" : "Connexion"}</span>
              </button>
            </div>
          </article>

        </div>
      `;

      root.querySelector("#profil-theme-btn")?.addEventListener("click", () => {
        const cur  = document.documentElement.getAttribute("data-theme");
        const next = cur === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        if (typeof TEOMARCHI_APP !== "undefined") TEOMARCHI_APP.theme.set(next);
      });

      root.querySelector("#profil-session-btn")?.addEventListener("click", () => {
        if (typeof TEOMARCHI_APP !== "undefined") {
          if (TEOMARCHI_APP.session.get()) {
            TEOMARCHI_APP.session.clear();
          } else {
            window.TEOMARCHI_OPEN_LOGIN?.();
          }
        }
        const sess2 = (typeof TEOMARCHI_APP !== "undefined") ? TEOMARCHI_APP.session.get() : null;
        const lbl   = document.getElementById("session-label");
        if (lbl) lbl.textContent = sess2 ? sess2.grade + " connecté" : "Session";
        _render();
      });

      root.querySelector("#profil-role-select")?.addEventListener("change", e => {
        if (typeof TEOMARCHI_APP === "undefined") return;
        const s2 = TEOMARCHI_APP.session.get();
        if (!s2) return;
        s2.grade = e.target.value;
        s2.role  = _PROFIL_ROLES.find(r => r.val === e.target.value)?.lbl || s2.role;
        TEOMARCHI_APP.session.set(s2);
        _render();
      });
    }

    _render();
  }

  /* ── Données : plans tarifaires ──────────────────────────────── */
  const DATA_PRICING = [
    {
      id: "gratuit", nom: "Gratuit", prix: "0", periode: "", featured: false,
      desc: "L'essentiel pour démarrer un projet et explorer la plateforme.",
      cta: "Commencer",
      features: [
        { ok: true,  text: "Atlas mondial (lecture seule)"   },
        { ok: true,  text: "Panthéon — 5 architectes"        },
        { ok: true,  text: "Fiches matières de base"         },
        { ok: true,  text: "Chronos — frise lecture"         },
        { ok: false, text: "Journal de bord illimité"        },
        { ok: false, text: "Modules Outils &amp; Normes"     },
        { ok: false, text: "Showroom partenaires"            },
        { ok: false, text: "Export PDF des livrables"        }
      ]
    },
    {
      id: "studio", nom: "Studio", prix: "29", periode: "/ mois", featured: true,
      desc: "La suite complète pour l'étudiant en atelier ou l'architecte solo.",
      cta: "Choisir Studio",
      features: [
        { ok: true, text: "Tout le plan Gratuit"                },
        { ok: true, text: "Journal de bord illimité + logs"     },
        { ok: true, text: "Outils — normothèque complète"       },
        { ok: true, text: "Showroom partenaires prescriptibles" },
        { ok: true, text: "Calendrier des phases ESQ → PRO"     },
        { ok: true, text: "Export PDF des livrables"            },
        { ok: true, text: "Profil public portfolio"             },
        { ok: false, text: "Multi-projets simultanés (Agence)"  }
      ]
    },
    {
      id: "agence", nom: "Agence", prix: "89", periode: "/ mois", featured: false,
      desc: "Pour les ateliers collectifs, équipes et structures pédagogiques.",
      cta: "Contacter l'équipe",
      features: [
        { ok: true, text: "Tout le plan Studio"              },
        { ok: true, text: "Multi-projets simultanés"         },
        { ok: true, text: "Messagerie collaborative intégrée"},
        { ok: true, text: "Gestion d'équipe &amp; droits"    },
        { ok: true, text: "Tableau de bord agence"           },
        { ok: true, text: "Archivage sécurisé 5 ans"         },
        { ok: true, text: "Support prioritaire dédié"        },
        { ok: true, text: "Formations &amp; ateliers on-site"}
      ]
    }
  ];

  const _svgOk = `<svg class="tm-plan__feature-icon" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

  const _svgNo = `<svg class="tm-plan__feature-icon" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
    aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  /* ── initPremium : injection dans #showroom-grid ─────────────── */
  function initPremium() {
    const root = document.getElementById("showroom-grid");
    if (!root) return;
    if (root.dataset.loaded === "premium") return;
    root.dataset.loaded = "premium";

    root.className     = "";
    root.style.cssText = "display:grid;gap:1.618rem";

    root.innerHTML = `
      <div style="text-align:center;padding-bottom:1rem">
        <p style="margin:0 0 .22rem;text-transform:uppercase;letter-spacing:.17em;
                  font-size:.58rem;font-weight:500;color:var(--gold)">Offres Haute Couture</p>
        <h3 style="font-family:var(--serif);font-size:clamp(2rem,5vw,3.8rem);font-weight:300;
                   line-height:.96;color:var(--ink);margin:0 0 .6rem">Choisissez votre atelier</h3>
        <p style="color:var(--muted);font-size:.85rem;max-width:54ch;margin-inline:auto;margin-top:.5rem">
          Accédez à l'intégralité des modules TEOMARCHI selon votre pratique.
        </p>
      </div>

      <div class="tm-pricing-grid">
        ${DATA_PRICING.map(plan => `
          <article class="tm-plan ${plan.featured ? "tm-plan--studio" : ""}">
            ${plan.featured
              ? `<span class="tm-plan__badge">Recommandé</span>`
              : `<div style="height:1.4rem"></div>`}
            <h4 class="tm-plan__name">${_esc(plan.nom)}</h4>
            <div class="tm-plan__price">
              ${plan.prix !== "0" ? `<span class="tm-plan__currency" aria-hidden="true">€</span>` : ""}
              <span class="tm-plan__amount">${plan.prix === "0" ? "Gratuit" : _esc(plan.prix)}</span>
              ${plan.periode ? `<span class="tm-plan__period">${_esc(plan.periode)}</span>` : ""}
            </div>
            <p style="font-size:.80rem;color:var(--muted);line-height:1.55;margin:0">${_esc(plan.desc)}</p>
            <div class="tm-plan__divider"></div>
            <ul class="tm-plan__features" role="list">
              ${plan.features.map(f => `
                <li class="tm-plan__feature ${f.ok ? "" : "tm-plan__feature--off"}">
                  ${f.ok ? _svgOk : _svgNo}
                  <span>${f.text}</span>
                </li>
              `).join("")}
            </ul>
            ${plan.id === "studio" || plan.id === "agence" ? `
              <div class="tm-stripe-wrap">
                <button
                  ${plan.id === "studio" ? 'id="checkout-btn"' : ""}
                  type="button"
                  class="tm-plan__cta tm-plan__cta--checkout"
                  data-checkout-plan="${plan.id}"
                  aria-label="Payer l'offre ${_esc(plan.nom)} avec Stripe">
                  ${_esc(plan.cta)}
                </button>
                <span class="tm-stripe-secure">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                       stroke-linecap="round" stroke-linejoin="round"
                       style="width:11px;height:11px" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Paiement sécurisé · Stripe
                </span>
              </div>` : `
              <button type="button" class="tm-plan__cta" data-plan="${plan.id}">
                ${_esc(plan.cta)}
              </button>`}
          </article>
        `).join("")}
      </div>
    `;

    /* Les clics sur [data-plan] sont gérés par le script Firebase (Script 9)
       via un listener capture-phase — pas de doublon ici. */
  }

  /* ── Hooks MutationObserver ──────────────────────────────────── */
  (function hookProfil() {
    const mod = document.getElementById("module-profil");
    if (!mod) return;
    new MutationObserver(() => {
      if (mod.classList.contains("is-active")) initProfil();
    }).observe(mod, { attributes: true, attributeFilter: ["class"] });
    if (mod.classList.contains("is-active")) initProfil();
  })();

  (function hookPremium() {
    const mod = document.getElementById("module-showroom");
    if (!mod) return;
    new MutationObserver(() => {
      if (mod.classList.contains("is-active")) initPremium();
    }).observe(mod, { attributes: true, attributeFilter: ["class"] });
    if (mod.classList.contains("is-active")) initPremium();
  })();

/* ── CSS Messagerie (injecté une fois) ─────────────────────── */
  (function injectMsgCSS() {
    if (document.getElementById("tm-msg-css")) return;
    const s = document.createElement("style");
    s.id = "tm-msg-css";
    s.textContent = `
      .tm-msg-wrap {
        display: grid;
        grid-template-columns: 272px 1fr;
        height: 680px;
        border: var(--border);
        border-radius: var(--r-xl);
        background: var(--surface);
        overflow: hidden;
      }
      @media (max-width: 860px) {
        .tm-msg-wrap { grid-template-columns: 1fr; grid-template-rows: 180px 1fr; height: 760px; }
        .tm-msg-sidebar { border-right: none !important; border-bottom: var(--border); }
      }

      /* ── Sidebar ── */
      .tm-msg-sidebar {
        border-right: var(--border);
        display: flex; flex-direction: column; overflow: hidden;
      }
      .tm-msg-sidebar-hd {
        padding: 1.2rem 1rem 1rem;
        border-bottom: var(--border);
        flex-shrink: 0;
      }
      .tm-msg-contacts {
        flex: 1; overflow-y: auto; padding: .38rem 0;
        scrollbar-width: thin; scrollbar-color: rgba(201,169,110,.18) transparent;
      }
      .tm-msg-contacts::-webkit-scrollbar { width: 3px; }
      .tm-msg-contacts::-webkit-scrollbar-thumb { background: rgba(201,169,110,.18); border-radius: 2px; }

      .tm-msg-contact {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: .55rem; align-items: center;
        padding: .68rem 1rem;
        cursor: pointer;
        border-left: 2px solid transparent;
        transition: background .14s ease, border-color .14s ease;
      }
      .tm-msg-contact:hover   { background: var(--gold-glow); }
      .tm-msg-contact.is-active {
        background: var(--gold-dim);
        border-left-color: var(--gold);
      }
      .tm-msg-contact-av {
        width: 36px; height: 36px; border-radius: 50%;
        border: var(--border-gold); background: var(--gold-glow);
        display: grid; place-items: center;
        font-family: var(--serif); font-size: .86rem; font-weight: 400;
        color: var(--gold); flex-shrink: 0;
      }
      .tm-msg-contact-info { overflow: hidden; }
      .tm-msg-contact-name {
        font-size: .80rem; font-weight: 400; color: var(--ink);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .tm-msg-contact-preview {
        font-size: .66rem; color: var(--muted);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .tm-msg-dot {
        width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
      }
      .tm-msg-dot--on  { background: var(--ok); box-shadow: 0 0 0 2px rgba(90,154,106,.18); }
      .tm-msg-dot--off { background: var(--muted); opacity: .5; }

      /* ── Chat ── */
      .tm-msg-chat { display: flex; flex-direction: column; overflow: hidden; }
      .tm-msg-chat-hd {
        padding: .9rem 1.2rem;
        border-bottom: var(--border);
        display: flex; align-items: center; gap: .68rem;
        flex-shrink: 0;
      }
      .tm-msg-messages {
        flex: 1; overflow-y: auto;
        padding: 1.1rem 1.2rem;
        display: flex; flex-direction: column; gap: .78rem;
        scrollbar-width: thin; scrollbar-color: rgba(201,169,110,.14) transparent;
      }
      .tm-msg-messages::-webkit-scrollbar { width: 3px; }
      .tm-msg-messages::-webkit-scrollbar-thumb { background: rgba(201,169,110,.14); border-radius: 2px; }

      .tm-msg-row      { display: flex; gap: .46rem; align-items: flex-end; }
      .tm-msg-row--me  { flex-direction: row-reverse; }
      .tm-msg-bav {
        width: 26px; height: 26px; border-radius: 50%;
        border: var(--border); background: var(--surface-2);
        display: grid; place-items: center;
        font-family: var(--serif); font-size: .64rem; color: var(--muted); flex-shrink: 0;
      }
      .tm-msg-bubble {
        max-width: 66%; padding: .62rem .85rem;
        border-radius: 16px; font-size: .81rem; line-height: 1.52;
      }
      .tm-msg-bubble--other {
        background: var(--surface-2); border: var(--border);
        color: var(--ink-2); border-bottom-left-radius: 4px;
      }
      .tm-msg-bubble--me {
        background: rgba(201,169,110,.07);
        border: var(--border-gold); color: var(--ink);
        border-bottom-right-radius: 4px;
      }
      .tm-msg-time {
        font-size: .56rem; color: var(--muted);
        letter-spacing: .06em; margin-top: .14rem;
        font-family: var(--mono);
      }
      .tm-msg-row--me .tm-msg-time { text-align: right; }

      .tm-msg-file {
        display: inline-flex; align-items: center; gap: .45rem;
        padding: .44rem .68rem; margin-top: .32rem;
        border: var(--border-gold); border-radius: 9px;
        background: var(--gold-glow);
        font-size: .68rem; color: var(--gold); cursor: default;
      }

      /* ── Footer ── */
      .tm-msg-footer {
        flex-shrink: 0; border-top: var(--border);
        padding: .78rem 1.1rem; display: grid; gap: .55rem;
      }
      .tm-msg-irow {
        display: grid; grid-template-columns: 1fr auto; gap: .55rem; align-items: center;
      }
      .tm-msg-input {
        min-height: 38px; padding: .48rem .82rem;
        border: var(--border); border-radius: var(--r-pill);
        background: var(--surface-2); font-size: .81rem; color: var(--ink);
        font-family: var(--sans); transition: border-color .18s ease;
      }
      .tm-msg-input:focus  { outline: none; border-color: rgba(201,169,110,.38); }
      .tm-msg-input::placeholder { color: var(--muted); }

      /* ── Dropzone ── */
      .tm-msg-dropzone {
        display: flex; align-items: center; justify-content: center; gap: .65rem;
        padding: .65rem 1rem;
        border: 0.5px dashed rgba(201,169,110,.44);
        border-radius: var(--r-md);
        background: rgba(201,169,110,.025);
        cursor: pointer;
        transition: border-color .18s ease, background .18s ease;
      }
      .tm-msg-dropzone:hover,
      .tm-msg-dropzone.is-over { border-color: var(--gold); background: var(--gold-glow); }
      .tm-msg-dropzone-icon { color: var(--gold); flex-shrink: 0; }
      .tm-msg-dropzone-text { font-size: .69rem; color: var(--muted); line-height: 1.38; }
      .tm-msg-dropzone-text strong {
        display: block; font-weight: 400;
        color: var(--gold); letter-spacing: .04em;
      }
      .tm-msg-dropzone-types { font-size: .59rem; font-family: var(--mono); letter-spacing: .07em; }
    `;
    document.head.appendChild(s);
  })();

  /* ── Données : contacts et messages démo désactivés par défaut ─ */
  const DATA_CONTACTS = ENABLE_DEMO_DATA ? [
    {
      id: "be", initials: "BE", name: "Bureau d'Études", role: "Ingénierie structure",
      online: true, preview: "OK pour la semelle filante.",
      messages: [
        { me: false, text: "Bonjour, j'ai analysé vos plans de fondation. La charge en pied de poteau dépasse les 120 kN.", time: "09:14" },
        { me: true,  text: "Merci. Pouvez-vous confirmer les charges sur la travée centrale et la flèche admissible ?", time: "09:17" },
        { me: false, text: "Confirmé — G = 8 kN/m², Q = 2,5 kN/m². Flèche admissible L/400 selon EN 1990.", time: "09:22" },
        { me: true,  text: "Parfait. Je corrige le plan de coffrage et vous renvoie avant 18h.", time: "09:25" },
        { me: false, text: "OK pour la semelle filante. Voir note de calcul ci-jointe.", time: "10:08",
          file: { name: "note_calcul_structurel_v3.pdf", size: "340 Ko" } }
      ]
    },
    {
      id: "client", initials: "CM", name: "Client Martin", role: "Maître d'ouvrage",
      online: true, preview: "Livraison confirmée pour juillet.",
      messages: [
        { me: false, text: "Bonjour, où en sommes-nous sur le permis de construire ?", time: "08:30" },
        { me: true,  text: "Le dossier PC est déposé depuis le 12 mai. Délai d'instruction : 3 mois réglementaires.", time: "08:35" },
        { me: false, text: "Le budget TCE tient-il toujours à 420 000 € TTC ?", time: "08:40" },
        { me: true,  text: "Oui, sous réserve du rapport géotechnique G2 — attendu semaine 22.", time: "08:44" },
        { me: false, text: "Livraison confirmée pour juillet.", time: "09:01" }
      ]
    },
    {
      id: "tp", initials: "TP", name: "TP Construction", role: "Entreprise gros œuvre",
      online: false, preview: "Planning de phasage envoyé.",
      messages: [
        { me: false, text: "Nous avons reçu le DCE. Questions sur le lot charpente métallique — préchargement des boulons ?", time: "Hier" },
        { me: true,  text: "Je transmets à l'ingénieur charpente. Retour sous 48h.", time: "Hier" },
        { me: false, text: "Planning de phasage envoyé.", time: "Hier",
          file: { name: "phasage_chantier_S22.pdf", size: "210 Ko" } }
      ]
    },
    {
      id: "amo", initials: "DL", name: "Delphine Lévy", role: "AMO / CSPS",
      online: true, preview: "PGC V2 disponible.",
      messages: [
        { me: false, text: "Le PIC a été mis à jour suite à la réunion de chantier #4. Deux points restent ouverts : RGIE et balisage.", time: "11:00" },
        { me: true,  text: "Reçu. Je l'intègre au dossier de synthèse et préviens le responsable de lot.", time: "11:08" },
        { me: false, text: "PGC V2 disponible.", time: "11:20",
          file: { name: "PGC_v2_chantier.pdf", size: "128 Ko" } }
      ]
    },
    {
      id: "studio-principal", initials: "AP", name: "Atelier Principal", role: "Direction de projet",
      online: false, preview: "Réunion de synthèse vendredi 14h.",
      messages: [
        { me: false, text: "Les plans APS sont validés avec réserves sur la hauteur sous plafond R+2 (H libre < 2,50 m).", time: "Lundi" },
        { me: true,  text: "Bien reçu. Je prends en compte les réserves pour l'APD — nouvelle coupe habitable en cours.", time: "Lundi" },
        { me: false, text: "Réunion de synthèse vendredi 14h.", time: "Lundi" }
      ]
    }
  ] : [];

  /* ── État inter-visites ─────────────────────────────────────── */
  let _msgActiveId = DATA_CONTACTS[0]?.id || null;

  /* ── initMessagerie : injection dans #messaging-layout ─────── */
  function initMessagerie() {
    const root = document.getElementById("messaging-layout");
    if (!root) return;

    /* Sur re-visite : juste scroll bas */
    if (root.dataset.loaded === "msg") {
      root.querySelector(".tm-msg-messages")?.scrollTo({ top: 999999 });
      return;
    }
    root.dataset.loaded = "msg";

    if (!DATA_CONTACTS.length) {
      root.innerHTML = `
        <div class="card" style="display:grid;place-items:center;min-height:360px;text-align:center;padding:2.6rem 1rem">
          <div>
            <svg style="width:54px;height:54px;stroke:rgba(201,169,110,.42);margin:0 auto 1.2rem;display:block"
                 viewBox="0 0 24 24" fill="none" stroke-width="1.1"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 4h16v12H7l-3 3V4z"/>
              <path d="M8 9h8M8 12h5"/>
            </svg>
            <p style="font-family:var(--serif);font-size:2rem;font-weight:300;color:var(--ink);margin:0 0 .45rem">
              Aucune conversation
            </p>
            <p style="font-size:.78rem;color:var(--muted);max-width:380px;line-height:1.6;margin:0 auto">
              Les échanges apparaîtront ici quand une vraie messagerie sera connectée au compte.
            </p>
          </div>
        </div>
      `;
      return;
    }

    /* ── Helpers de rendu ── */
    function _contactHTML(c) {
      return `
        <div class="tm-msg-contact ${c.id === _msgActiveId ? "is-active" : ""}"
             data-contact="${c.id}" role="button" tabindex="0"
             aria-label="Ouvrir la conversation avec ${_esc(c.name)}">
          <div class="tm-msg-contact-av">${_esc(c.initials)}</div>
          <div class="tm-msg-contact-info">
            <p class="tm-msg-contact-name">${_esc(c.name)}</p>
            <p class="tm-msg-contact-preview">${_esc(c.preview)}</p>
          </div>
          <div class="tm-msg-dot tm-msg-dot--${c.online ? "on" : "off"}"
               title="${c.online ? "En ligne" : "Hors ligne"}"></div>
        </div>
      `;
    }

    function _fileHTML(f) {
      return `
        <div class="tm-msg-file">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"
               style="width:13px;height:13px;flex-shrink:0" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <path d="M14 2v6h6M9 13h6M9 17h4"/>
          </svg>
          <span>${_esc(f.name)}</span>
          <span style="color:var(--muted);font-size:.58rem">${_esc(f.size)}</span>
        </div>
      `;
    }

    function _msgHTML(msg, contactInitials) {
      const avLabel = msg.me ? "Moi" : contactInitials;
      return `
        <div class="tm-msg-row ${msg.me ? "tm-msg-row--me" : ""}">
          <div class="tm-msg-bav" aria-hidden="true">${_esc(avLabel)}</div>
          <div>
            <div class="tm-msg-bubble tm-msg-bubble--${msg.me ? "me" : "other"}">
              ${_esc(msg.text)}
              ${msg.file ? _fileHTML(msg.file) : ""}
            </div>
            <p class="tm-msg-time">${_esc(msg.time)}</p>
          </div>
        </div>
      `;
    }

    function _refreshChat() {
      const contact  = DATA_CONTACTS.find(c => c.id === _msgActiveId);
      if (!contact) return;

      /* En-tête */
      const hd = root.querySelector(".tm-msg-chat-hd");
      if (hd) hd.innerHTML = `
        <div class="tm-msg-contact-av" style="width:34px;height:34px;font-size:.78rem">
          ${_esc(contact.initials)}
        </div>
        <div>
          <p style="margin:0;font-size:.85rem;font-weight:400;color:var(--ink)">${_esc(contact.name)}</p>
          <p style="margin:0;font-size:.62rem;color:${contact.online ? "var(--ok)" : "var(--muted)"}">
            ${contact.online ? "● En ligne" : "○ Hors ligne"}
            <span style="color:var(--muted)"> · ${_esc(contact.role)}</span>
          </p>
        </div>
      `;

      /* Messages */
      const msgs = root.querySelector(".tm-msg-messages");
      if (msgs) {
        msgs.innerHTML = contact.messages.map(m => _msgHTML(m, contact.initials)).join("");
        msgs.scrollTop = msgs.scrollHeight;
      }
    }

    /* ── Structure HTML complète ── */
    const onlineCount = DATA_CONTACTS.filter(c => c.online).length;

    root.innerHTML = `
      <div class="tm-msg-wrap">

        <aside class="tm-msg-sidebar" aria-label="Liste des contacts">
          <div class="tm-msg-sidebar-hd">
            <p style="margin:0 0 .12rem;text-transform:uppercase;letter-spacing:.17em;
                      font-size:.58rem;font-weight:500;color:var(--gold)">Messagerie</p>
            <h3 style="font-family:var(--serif);font-size:1.48rem;font-weight:300;
                       line-height:1;color:var(--ink);margin:0">Atelier silencieux</h3>
            <p style="margin:.32rem 0 0;font-size:.62rem;color:var(--muted)">
              ${onlineCount} interlocuteur${onlineCount > 1 ? "s" : ""} en ligne
            </p>
          </div>
          <nav class="tm-msg-contacts" role="list">
            ${DATA_CONTACTS.map(_contactHTML).join("")}
          </nav>
        </aside>

        <div class="tm-msg-chat">
          <div class="tm-msg-chat-hd"></div>

          <div class="tm-msg-messages" aria-live="polite" aria-label="Messages"></div>

          <div class="tm-msg-footer">
            <div class="tm-msg-irow">
              <input class="tm-msg-input" id="tm-msg-input" type="text"
                     placeholder="Rédigez un message technique…"
                     autocomplete="off" aria-label="Zone de message" />
              <button type="button" class="text-btn text-btn--primary" id="tm-msg-send">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                     style="width:13px;height:13px" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <span>Envoyer</span>
              </button>
            </div>

            <div class="tm-msg-dropzone" id="tm-msg-dropzone" role="region"
                 aria-label="Zone de partage de plans et documents">
              <svg class="tm-msg-dropzone-icon" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="1.4" stroke-linecap="round"
                   stroke-linejoin="round" style="width:22px;height:22px" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <div class="tm-msg-dropzone-text">
                <strong>Glissez vos plans ici</strong>
                <span class="tm-msg-dropzone-types">DWG · PDF · IFC · DXF — max 50 Mo</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    _refreshChat();

    /* ── Événements : sélection contact ── */
    root.querySelectorAll("[data-contact]").forEach(el => {
      const activate = () => {
        _msgActiveId = el.dataset.contact;
        root.querySelectorAll("[data-contact]").forEach(b =>
          b.classList.toggle("is-active", b.dataset.contact === _msgActiveId)
        );
        _refreshChat();
        root.querySelector("#tm-msg-input")?.focus();
      };
      el.addEventListener("click", activate);
      el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") activate(); });
    });

    /* ── Événements : envoi message ── */
    function _send() {
      const inp  = root.querySelector("#tm-msg-input");
      const text = inp?.value.trim();
      if (!text) return;
      const contact = DATA_CONTACTS.find(c => c.id === _msgActiveId);
      if (!contact) return;
      const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      contact.messages.push({ me: true, text, time: now });
      contact.preview = text.length > 38 ? text.slice(0, 38) + "…" : text;
      inp.value = "";
      _refreshChat();
    }

    root.querySelector("#tm-msg-send")?.addEventListener("click", _send);
    root.querySelector("#tm-msg-input")?.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); _send(); }
    });

    /* ── Événements : dropzone ── */
    const dz = root.querySelector("#tm-msg-dropzone");
    if (dz) {
      ["dragenter", "dragover"].forEach(ev =>
        dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add("is-over"); })
      );
      ["dragleave", "drop"].forEach(ev =>
        dz.addEventListener(ev, e => {
          e.preventDefault();
          dz.classList.remove("is-over");
          if (ev !== "drop") return;
          const files   = Array.from(e.dataTransfer?.files || []);
          const contact = DATA_CONTACTS.find(c => c.id === _msgActiveId);
          if (!contact || !files.length) return;
          const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
          files.forEach(f => {
            const kb = Math.round(f.size / 1024);
            const sz = kb < 1024 ? kb + " Ko" : (kb / 1024).toFixed(1) + " Mo";
            contact.messages.push({
              me: true, text: "Document partagé", time: now,
              file: { name: f.name, size: sz }
            });
            contact.preview = f.name;
          });
          _refreshChat();
        })
      );
    }
  }

  /* ── Hook MutationObserver — module-messagerie ──────────────── */
  (function hookMessagerie() {
    const mod = document.getElementById("module-messagerie");
    if (!mod) return;
    new MutationObserver(() => {
      if (mod.classList.contains("is-active")) initMessagerie();
    }).observe(mod, { attributes: true, attributeFilter: ["class"] });
    if (mod.classList.contains("is-active")) initMessagerie();
  })();

/* ── CSS galerie + lightbox + sponsor (injecté une fois) ─────── */
  (function injectFinalCSS() {
    if (document.getElementById("tm-final-css")) return;
    const s = document.createElement("style");
    s.id = "tm-final-css";
    s.textContent = `
      /* ── Galerie renders ── */
      .tm-gallery-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
      }
      @media (max-width: 860px) { .tm-gallery-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 540px) { .tm-gallery-grid { grid-template-columns: 1fr; } }

      .tm-gallery-card {
        position: relative;
        border-radius: var(--r-lg);
        overflow: hidden;
        cursor: pointer;
        border: var(--border);
        aspect-ratio: 5 / 4;
        transition: border-color .22s ease, transform .22s ease, box-shadow .22s ease;
      }
      .tm-gallery-card:hover {
        border-color: rgba(201,169,110,.55);
        transform: translateY(-2px);
        box-shadow: 0 18px 56px rgba(0,0,0,.70);
      }
      .tm-gallery-card svg { width: 100%; height: 100%; display: block; }

      .tm-gallery-overlay {
        position: absolute; inset: 0;
        background: linear-gradient(to top, rgba(5,5,5,.92) 0%, transparent 52%);
        display: flex; flex-direction: column; justify-content: flex-end;
        padding: 1rem;
        opacity: 0; transition: opacity .22s ease;
      }
      .tm-gallery-card:hover .tm-gallery-overlay { opacity: 1; }
      .tm-gallery-overlay-title {
        font-family: var(--serif); font-size: 1.14rem; font-weight: 300;
        color: var(--ink); margin: 0 0 .22rem; line-height: 1.1;
      }
      .tm-gallery-overlay-meta { font-size: .64rem; color: var(--muted); margin: 0 0 .38rem; }
      .tm-gallery-overlay-tag {
        display: inline-flex; align-items: center; padding: .12rem .45rem;
        border: var(--border-gold); border-radius: 999px;
        background: var(--gold-glow); color: var(--gold);
        font-family: var(--mono); font-size: .56rem; letter-spacing: .09em; text-transform: uppercase;
      }

      /* ── Lightbox ── */
      .tm-lb-overlay {
        position: fixed; inset: 0; z-index: 19000;
        background: rgba(3,3,3,.96);
        backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
        display: grid; place-items: center;
        opacity: 0; pointer-events: none;
        transition: opacity .26s ease;
      }
      .tm-lb-overlay.is-open { opacity: 1; pointer-events: all; }
      .tm-lb-inner {
        position: relative;
        width: min(760px, 92vw);
        display: grid; gap: 1.1rem;
      }
      .tm-lb-img {
        border: var(--border-gold); border-radius: var(--r-xl);
        overflow: hidden; aspect-ratio: 5/4;
        box-shadow: 0 32px 80px rgba(0,0,0,.80);
      }
      .tm-lb-img svg { width: 100%; height: 100%; display: block; }
      .tm-lb-meta {
        display: flex; justify-content: space-between; align-items: flex-end;
        gap: 1rem; flex-wrap: wrap;
      }
      .tm-lb-title {
        font-family: var(--serif); font-size: clamp(1.6rem, 4vw, 2.8rem);
        font-weight: 300; line-height: 1; color: var(--ink); margin: 0;
      }
      .tm-lb-sub { font-size: .78rem; color: var(--muted); margin: .28rem 0 0; }
      .tm-lb-close {
        position: absolute; top: -14px; right: -14px;
        width: 36px; height: 36px;
        display: grid; place-items: center;
        border: var(--border-gold); border-radius: 50%;
        background: rgba(5,5,5,.90);
        color: var(--gold); font-size: 1.2rem; cursor: pointer;
        transition: background .16s ease, transform .16s ease;
      }
      .tm-lb-close:hover { background: var(--gold-glow); transform: rotate(90deg); }
      .tm-lb-nav {
        position: absolute; top: 50%; transform: translateY(-50%);
        width: 38px; height: 38px;
        display: grid; place-items: center;
        border: var(--border); border-radius: 50%;
        background: rgba(5,5,5,.72); color: var(--ink-2); cursor: pointer;
        transition: border-color .16s ease, color .16s ease;
      }
      .tm-lb-nav:hover { border-color: var(--gold); color: var(--gold); }
      .tm-lb-prev { left: -50px; }
      .tm-lb-next { right: -50px; }
      @media (max-width: 900px) {
        .tm-lb-prev { left: 6px; top: auto; bottom: -52px; transform: none; }
        .tm-lb-next { right: 6px; top: auto; bottom: -52px; transform: none; }
      }
      .tm-lb-counter {
        font-family: var(--mono); font-size: .62rem; letter-spacing: .12em;
        color: var(--muted); text-align: center; margin-top: .2rem;
      }

    `;
    document.head.appendChild(s);
  })();

  /* ── Données : rendus 3D fictifs ────────────────────────────── */
  const DATA_RENDERS = [
    { id: 1, titre: "Résidence Bas-Carbone",  lieu: "Lyon · Logement collectif",    tag: "R+4 · Bois CLT"        },
    { id: 2, titre: "Centre Civique",          lieu: "Bordeaux · Équipement public", tag: "R+2 · Béton brut"       },
    { id: 3, titre: "Tour de Logements",       lieu: "Paris · Densification",        tag: "R+18 · Structure mixte" },
    { id: 4, titre: "Maison Passive",          lieu: "Grenoble · Individuel",        tag: "BBC · Ossature bois"    },
    { id: 5, titre: "Médiathèque Lumière",     lieu: "Nantes · Culturel",            tag: "R+3 · Acier verre"      },
    { id: 6, titre: "Hôtel de Ville",          lieu: "Strasbourg · Réhabilitation",  tag: "Patrimoine · Pierre"    }
  ];

  /* ── SVG architectural render génératif ──────────────────────── */
  function _svgRender(seed) {
    const palettes = [
      { b1:"#190d03", b2:"#38200a", ac:"#C9A96E" },
      { b1:"#030810", b2:"#081524", ac:"#90b8d8" },
      { b1:"#060d04", b2:"#0f1c08", ac:"#88b48c" },
      { b1:"#0c0c0c", b2:"#181818", ac:"#ded8c8" },
      { b1:"#08040e", b2:"#140726", ac:"#b090cc" },
      { b1:"#0e0404", b2:"#1c0808", ac:"#c87070" }
    ];
    const p    = palettes[(seed - 1) % 6];
    const ac   = p.ac;
    const w    = 300;
    const h    = 240;

    const drawings = [
      /* 1 — résidence R+4 avec trame de fenêtres */
      `<rect x="70" y="100" width="160" height="110" fill="none" stroke="${ac}" stroke-width=".7"/>
       <line x1="70" y1="122" x2="230" y2="122" stroke="${ac}" stroke-width=".35" opacity=".6"/>
       <line x1="70" y1="144" x2="230" y2="144" stroke="${ac}" stroke-width=".35" opacity=".6"/>
       <line x1="70" y1="166" x2="230" y2="166" stroke="${ac}" stroke-width=".35" opacity=".6"/>
       <line x1="70" y1="188" x2="230" y2="188" stroke="${ac}" stroke-width=".35" opacity=".6"/>
       ${[0,1,2,3].map(i => `<rect x="${82+i*36}" y="${108}" width="16" height="10" fill="${ac}" opacity=".22"/>`).join("")}
       ${[0,1,2,3].map(i => `<rect x="${82+i*36}" y="${130}" width="16" height="10" fill="${ac}" opacity=".22"/>`).join("")}
       ${[0,1,2,3].map(i => `<rect x="${82+i*36}" y="${152}" width="16" height="10" fill="${ac}" opacity=".22"/>`).join("")}
       <rect x="128" y="188" width="44" height="22" fill="${ac}" opacity=".12"/>
       <line x1="${w/2}" y1="88" x2="${w/2}" y2="100" stroke="${ac}" stroke-width=".5" stroke-dasharray="3,3" opacity=".4"/>`,

      /* 2 — centre civique horizontal colonnade */
      `<rect x="34" y="138" width="232" height="62" fill="none" stroke="${ac}" stroke-width=".7"/>
       <rect x="34" y="122" width="232" height="16" fill="${ac}" opacity=".08"/>
       ${[0,1,2,3,4,5].map(i => `<line x1="${50+i*37}" y1="122" x2="${50+i*37}" y2="200" stroke="${ac}" stroke-width=".45" opacity=".55"/>`).join("")}
       <line x1="34" y1="122" x2="34" y2="200" stroke="${ac}" stroke-width=".7"/>
       <line x1="266" y1="122" x2="266" y2="200" stroke="${ac}" stroke-width=".7"/>
       <rect x="110" y="158" width="80" height="42" fill="${ac}" opacity=".10"/>
       <line x1="34" y1="200" x2="266" y2="200" stroke="${ac}" stroke-width=".7"/>`,

      /* 3 — tour verticale */
      `<rect x="112" y="48" width="76" height="180" fill="none" stroke="${ac}" stroke-width=".7"/>
       ${[0,1,2,3,4,5,6,7].map(i => `<line x1="112" y1="${68+i*20}" x2="188" y2="${68+i*20}" stroke="${ac}" stroke-width=".3" opacity=".5"/>`).join("")}
       <line x1="150" y1="228" x2="150" y2="240" stroke="${ac}" stroke-width=".5" opacity=".3"/>
       <rect x="122" y="192" width="10" height="10" fill="${ac}" opacity=".35"/>
       <rect x="155" y="192" width="10" height="10" fill="${ac}" opacity=".35"/>
       <rect x="122" y="172" width="10" height="10" fill="${ac}" opacity=".20"/>
       <rect x="155" y="172" width="10" height="10" fill="${ac}" opacity=".20"/>
       <rect x="122" y="152" width="10" height="10" fill="${ac}" opacity=".15"/>
       <rect x="155" y="152" width="10" height="10" fill="${ac}" opacity=".15"/>
       <rect x="126" y="228" width="48" height="12" fill="${ac}" opacity=".15"/>`,

      /* 4 — maison passive toit 2 pentes + grande baie */
      `<polygon points="150,72 72,138 228,138" fill="none" stroke="${ac}" stroke-width=".7"/>
       <rect x="72" y="138" width="156" height="72" fill="none" stroke="${ac}" stroke-width=".7"/>
       <rect x="84" y="152" width="62" height="58" fill="${ac}" opacity=".12"/>
       <rect x="154" y="152" width="62" height="48" fill="${ac}" opacity=".08"/>
       <line x1="154" y1="152" x2="154" y2="210" stroke="${ac}" stroke-width=".4" opacity=".4"/>
       <rect x="116" y="190" width="28" height="20" fill="${ac}" opacity=".18"/>
       <line x1="150" y1="72" x2="150" y2="55" stroke="${ac}" stroke-width=".5" stroke-dasharray="3,3" opacity=".35"/>`,

      /* 5 — médiathèque voûte parabolique */
      `<path d="M 44 188 Q 150 88 256 188" fill="none" stroke="${ac}" stroke-width=".8"/>
       <path d="M 44 188 Q 150 100 256 188" fill="${ac}" fill-opacity=".04"/>
       <rect x="44" y="188" width="212" height="22" fill="none" stroke="${ac}" stroke-width=".7"/>
       <line x1="150" y1="188" x2="150" y2="88" stroke="${ac}" stroke-width=".4" stroke-dasharray="4,3" opacity=".35"/>
       ${[0,1,2,3,4].map(i => `<line x1="${66+i*44}" y1="188" x2="${66+i*44}" y2="210" stroke="${ac}" stroke-width=".4" opacity=".5"/>`).join("")}
       <rect x="110" y="188" width="80" height="22" fill="${ac}" opacity=".12"/>`,

      /* 6 — hôtel de ville symétrie classique */
      `<rect x="60" y="122" width="180" height="88" fill="none" stroke="${ac}" stroke-width=".7"/>
       <rect x="100" y="104" width="100" height="18" fill="none" stroke="${ac}" stroke-width=".6"/>
       <rect x="128" y="90" width="44" height="14" fill="none" stroke="${ac}" stroke-width=".5"/>
       ${[0,1,2,3].map(i => `<line x1="${76+i*44}" y1="122" x2="${76+i*44}" y2="210" stroke="${ac}" stroke-width=".45" opacity=".55"/>`).join("")}
       <rect x="116" y="165" width="68" height="45" fill="${ac}" opacity=".10"/>
       <rect x="130" y="175" width="40" height="35" fill="${ac}" opacity=".12"/>
       <circle cx="150" cy="84" r="5" fill="none" stroke="${ac}" stroke-width=".6" opacity=".7"/>`
    ];

    const draw = drawings[(seed - 1) % 6];
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rg${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p.b1}"/>
          <stop offset="100%" stop-color="${p.b2}"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#rg${seed})"/>
      <line x1="0" y1="${h-12}" x2="${w}" y2="${h-12}" stroke="${ac}" stroke-width=".3" opacity=".22"/>
      ${draw}
    </svg>`;
  }

  /* ── Lightbox global (créé une seule fois) ───────────────────── */
  let _lbRenders = DATA_RENDERS;
  let _lbIndex   = 0;

  function _buildLightbox() {
    if (document.getElementById("tm-lb")) return;
    const el = document.createElement("div");
    el.id        = "tm-lb";
    el.className = "tm-lb-overlay";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Rendu en plein écran");
    el.innerHTML = `
      <div class="tm-lb-inner">
        <button class="tm-lb-close" id="tm-lb-close" aria-label="Fermer">×</button>
        <button class="tm-lb-nav tm-lb-prev" id="tm-lb-prev" aria-label="Précédent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
               stroke-linecap="round" style="width:16px;height:16px"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button class="tm-lb-nav tm-lb-next" id="tm-lb-next" aria-label="Suivant">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
               stroke-linecap="round" style="width:16px;height:16px"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <div class="tm-lb-img" id="tm-lb-img"></div>
        <div class="tm-lb-meta">
          <div>
            <h3 class="tm-lb-title" id="tm-lb-title"></h3>
            <p class="tm-lb-sub" id="tm-lb-sub"></p>
          </div>
          <span class="card__tag" id="tm-lb-tag"></span>
        </div>
        <p class="tm-lb-counter" id="tm-lb-counter"></p>
      </div>
    `;
    document.body.appendChild(el);

    const _update = () => {
      const r = _lbRenders[_lbIndex];
      const img = document.getElementById("tm-lb-img");
      const title = document.getElementById("tm-lb-title");
      const sub = document.getElementById("tm-lb-sub");
      const tag = document.getElementById("tm-lb-tag");
      const counter = document.getElementById("tm-lb-counter");
      if (img) img.innerHTML = _svgRender(r.id);
      if (title) title.textContent = r.titre;
      if (sub) sub.textContent = r.lieu;
      if (tag) tag.textContent = r.tag;
      if (counter) counter.textContent = (_lbIndex + 1) + " / " + _lbRenders.length;
    };

    document.getElementById("tm-lb-close")?.addEventListener("click", _closeLightbox);
    el.addEventListener("click", e => { if (e.target === el) _closeLightbox(); });

    document.getElementById("tm-lb-prev")?.addEventListener("click", e => {
      e.stopPropagation();
      _lbIndex = (_lbIndex - 1 + _lbRenders.length) % _lbRenders.length;
      _update();
    });
    document.getElementById("tm-lb-next")?.addEventListener("click", e => {
      e.stopPropagation();
      _lbIndex = (_lbIndex + 1) % _lbRenders.length;
      _update();
    });

    document.addEventListener("keydown", e => {
      const lb = document.getElementById("tm-lb");
      if (!lb?.classList.contains("is-open")) return;
      if (e.key === "Escape")     _closeLightbox();
      if (e.key === "ArrowLeft")  { _lbIndex = (_lbIndex - 1 + _lbRenders.length) % _lbRenders.length; _update(); }
      if (e.key === "ArrowRight") { _lbIndex = (_lbIndex + 1) % _lbRenders.length; _update(); }
    });

    /* Stocke _update sur l'élément pour accès depuis _openLightbox */
    el._update = _update;
  }

  function _openLightbox(index) {
    _buildLightbox();
    _lbIndex = index;
    const lb = document.getElementById("tm-lb");
    lb._update();
    lb.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function _closeLightbox() {
    document.getElementById("tm-lb")?.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  /* ── initShowroomGallery : galerie injectée AVANT #showroom-grid ─ */
  function initShowroomGallery() {
    if (document.getElementById("tm-gallery-wrap")) return;
    const section = document.getElementById("module-showroom");
    const grid    = document.getElementById("showroom-grid");
    if (!section || !grid) return;

    const wrap = document.createElement("div");
    wrap.id = "tm-gallery-wrap";
    section.insertBefore(wrap, grid);

    wrap.innerHTML = `
      <div style="margin-bottom:.72rem">
        <p style="margin:0 0 .16rem;text-transform:uppercase;letter-spacing:.17em;
                  font-size:.58rem;font-weight:500;color:var(--gold)">Galerie de rendus</p>
        <h3 style="font-family:var(--serif);font-size:clamp(1.8rem,4vw,3.2rem);font-weight:300;
                   line-height:1;color:var(--ink);margin:0">Projets prescriptibles</h3>
      </div>
      <div class="tm-gallery-grid" id="tm-gallery-grid">
        ${DATA_RENDERS.map((r, i) => `
          <div class="tm-gallery-card" data-lb="${i}" tabindex="0"
               role="button" aria-label="Ouvrir le rendu : ${_esc(r.titre)}">
            ${_svgRender(r.id)}
            <div class="tm-gallery-overlay">
              <p class="tm-gallery-overlay-title">${_esc(r.titre)}</p>
              <p class="tm-gallery-overlay-meta">${_esc(r.lieu)}</p>
              <span class="tm-gallery-overlay-tag">${_esc(r.tag)}</span>
            </div>
          </div>
        `).join("")}
      </div>
      <div style="height:.5px;background:rgba(245,245,241,.08);margin:2rem 0 1.4rem"></div>
    `;

    wrap.querySelectorAll("[data-lb]").forEach(card => {
      const open = () => _openLightbox(+card.dataset.lb);
      card.addEventListener("click", open);
      card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") open(); });
    });
  }

  /* ── Hook galerie — module-showroom ─────────────────────────── */
  (function hookGallery() {
    const mod = document.getElementById("module-showroom");
    if (!mod) return;
    new MutationObserver(() => {
      if (mod.classList.contains("is-active")) initShowroomGallery();
    }).observe(mod, { attributes: true, attributeFilter: ["class"] });
    if (mod.classList.contains("is-active")) initShowroomGallery();
  })();

  /* ── Vérification et consolidation de la persistance ─────────── */
  function _verifyPersistence() {
    /* Journalier : s'assure qu'un état initial robuste existe */
    if (typeof TEOMARCHI_APP !== "undefined") {
      const jp = TEOMARCHI_APP.journalier.get();
      TEOMARCHI_APP.journalier.set(jp);

      /* Ancienne persistance conservée pour les modules qui lisent encore journal. */
      const j = TEOMARCHI_APP.journal.get();
      if (!j.updatedAt) {
        TEOMARCHI_APP.journal.set(j);
      }
    }

    /* beforeunload : flush final pour les navigateurs aggressifs */
    window.addEventListener("beforeunload", () => {
      if (typeof TEOMARCHI_APP === "undefined") return;
      const j = TEOMARCHI_APP.journal.get();
      const jp = TEOMARCHI_APP.journalier.get();
      try {
        localStorage.setItem("teomarchi.journal", JSON.stringify(j));
        localStorage.setItem("teomarchi.journalier", JSON.stringify(jp));
        const sess = TEOMARCHI_APP.session.get();
        if (sess) localStorage.setItem("teomarchi.session", JSON.stringify(sess));
        const theme = document.documentElement.getAttribute("data-theme") || "dark";
        localStorage.setItem("teomarchi.theme", JSON.stringify(theme));
      } catch {}
    });

    /* Storage event : sync entre onglets */
    window.addEventListener("storage", e => {
      if (!e.key?.startsWith("teomarchi.")) return;
      if (e.key === "teomarchi.theme" && e.newValue) {
        try {
          const t = JSON.parse(e.newValue);
          document.documentElement.setAttribute("data-theme", t);
        } catch {}
      }
    });
  }

  /* ── Appels immédiats au chargement ──────────────────────────── */
  _verifyPersistence();

/* ── CSS Toast + Export + Feed interactions (injecté une fois) ── */
  (function injectInterCSS() {
    if (document.getElementById("tm-inter-css")) return;
    const s = document.createElement("style");
    s.id = "tm-inter-css";
    s.textContent = `
      /* ── Toast ── */
      #tm-toast-wrap {
        position: fixed; top: 80px; right: 20px; z-index: 20000;
        display: flex; flex-direction: column; gap: .52rem;
        pointer-events: none; width: max-content;
        max-width: min(340px, calc(100vw - 40px));
      }
      .tm-toast {
        display: flex; align-items: center; gap: .58rem;
        padding: .62rem 1rem;
        border: var(--border-gold); border-radius: var(--r-pill);
        background: color-mix(in srgb, var(--surface) 94%, transparent);
        backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
        box-shadow: 0 8px 32px rgba(0,0,0,.55), 0 0 0 0.5px rgba(201,169,110,.16);
        font-size: .74rem; color: var(--ink);
        pointer-events: auto; cursor: pointer;
        transform: translateX(calc(100% + 28px)); opacity: 0;
        transition: transform .30s cubic-bezier(.34,1.48,.64,1), opacity .26s ease;
      }
      .tm-toast.is-in  { transform: translateX(0); opacity: 1; }
      .tm-toast.is-out { transform: translateX(calc(100% + 28px)); opacity: 0; }
      .tm-toast__dot   { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }

      /* ── Export panel ── */
      .tm-export-panel {
        display: grid; gap: 1rem;
        padding: 1.618rem;
        border: var(--border-gold); border-radius: var(--r-xl);
        background:
          radial-gradient(ellipse at 0% 100%, rgba(201,169,110,.06) 0%, transparent 58%),
          var(--surface);
      }
      .tm-export-track {
        height: 2px; border-radius: 999px;
        background: rgba(245,245,241,.08); overflow: hidden;
      }
      .tm-export-bar {
        height: 100%; width: 0%; border-radius: 999px;
        background: linear-gradient(to right, var(--gold), color-mix(in srgb, var(--gold) 72%, #fff));
        transition: width .12s ease;
      }
      .tm-export-btns { display: flex; gap: .72rem; flex-wrap: wrap; }

      /* ── Feed interactions ── */
      .tm-feed-actions {
        display: flex; gap: .48rem; flex-wrap: wrap;
        margin-top: .58rem; padding-top: .58rem;
        border-top: var(--border);
      }
      .tm-feed-btn {
        display: inline-flex; align-items: center; gap: .32rem;
        padding: .22rem .58rem;
        border: var(--border); border-radius: var(--r-pill);
        background: transparent; color: var(--muted);
        font-family: var(--sans); font-size: .60rem; font-weight: 400;
        letter-spacing: .10em; text-transform: uppercase; cursor: pointer;
        transition: color .16s ease, border-color .16s ease, background .16s ease;
      }
      .tm-feed-btn svg { width: 11px; height: 11px; flex-shrink: 0; transition: fill .16s ease; }
      .tm-feed-btn:hover { border-color: rgba(201,169,110,.28); color: var(--ink-2); }
      .tm-feed-btn.is-on {
        border-color: var(--gold); color: var(--gold); background: var(--gold-glow);
      }
      .tm-feed-btn.is-on svg { fill: currentColor; }
    `;
    document.head.appendChild(s);
  })();

  /* ── pushNotification : toast doré global ───────────────────── */
  window.pushNotification = function(message) {
    const _e = s => String(s ?? "").replace(/[&<>"']/g, c =>
      ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])
    );
    let wrap = document.getElementById("tm-toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "tm-toast-wrap";
      document.body.appendChild(wrap);
    }
    const toast = document.createElement("div");
    toast.className = "tm-toast";
    toast.innerHTML = `<span class="tm-toast__dot"></span><span>${_e(message)}</span>`;
    wrap.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("is-in")));
    const dismiss = () => {
      toast.classList.replace("is-in", "is-out");
      toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    };
    const t = setTimeout(dismiss, 3400);
    toast.addEventListener("click", () => { clearTimeout(t); dismiss(); });
  };

  /* ── Feed Like + Save ────────────────────────────────────────── */
  const _feedState = (() => {
    try { return JSON.parse(localStorage.getItem("teomarchi.feed")) || {}; } catch { return {}; }
  })();

  function _saveFeedState() {
    try { localStorage.setItem("teomarchi.feed", JSON.stringify(_feedState)); } catch {}
  }

  function initFeedInteractions() {
    const wall = document.getElementById("feed-wall");
    if (!wall) return;
    wall.querySelectorAll(".tm-card").forEach((card, i) => {
      if (card.querySelector(".tm-feed-actions")) return;
      const st = _feedState[i] || { liked: false, saved: false };

      const bar = document.createElement("div");
      bar.className = "tm-feed-actions";
      bar.innerHTML = `
        <button class="tm-feed-btn ${st.liked ? "is-on" : ""}"
                data-ff="like" data-fi="${i}"
                aria-label="${st.liked ? "Retirer le like" : "Aimer"}"
                aria-pressed="${st.liked}">
          <svg viewBox="0 0 24 24" fill="${st.liked ? "currentColor" : "none"}" stroke="currentColor"
               stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>${st.liked ? "Aimé" : "Aimer"}</span>
        </button>
        <button class="tm-feed-btn ${st.saved ? "is-on" : ""}"
                data-ff="save" data-fi="${i}"
                aria-label="${st.saved ? "Retiré" : "Sauvegarder"}"
                aria-pressed="${st.saved}">
          <svg viewBox="0 0 24 24" fill="${st.saved ? "currentColor" : "none"}" stroke="currentColor"
               stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span>${st.saved ? "Sauvegardé" : "Sauvegarder"}</span>
        </button>
      `;
      card.querySelector(".tm-card__body")?.appendChild(bar);

      bar.querySelectorAll("[data-ff]").forEach(btn => {
        btn.addEventListener("click", e => {
          e.stopPropagation();
          const isLike = btn.dataset.ff === "like";
          const idx    = +btn.dataset.fi;
          if (!_feedState[idx]) _feedState[idx] = { liked: false, saved: false };
          const key    = isLike ? "liked" : "saved";
          const newVal = !_feedState[idx][key];
          _feedState[idx][key] = newVal;

          btn.classList.toggle("is-on", newVal);
          btn.setAttribute("aria-pressed", newVal);
          btn.querySelector("svg").setAttribute("fill", newVal ? "currentColor" : "none");
          btn.querySelector("span").textContent = isLike
            ? (newVal ? "Aimé" : "Aimer")
            : (newVal ? "Sauvegardé" : "Sauvegarder");

          pushNotification(isLike
            ? (newVal ? "Rendu ajouté à vos coups de cœur" : "Like retiré")
            : (newVal ? "Rendu sauvegardé dans votre collection" : "Sauvegarde retirée"));
          _saveFeedState();
        });
      });
    });
  }

  /* ── Feed — En cours de construction ────────────────────────── */
  (function initFeedWall() {
    function renderFeedWall() {
      const wall = document.getElementById("feed-wall");
      if (!wall || wall.dataset.loaded) return;
      wall.dataset.loaded = "1";
      wall.innerHTML = `
        <div style="display:grid;place-items:center;min-height:340px;text-align:center;padding:3rem 1rem">
          <div>
            <svg style="width:52px;height:52px;stroke:rgba(201,169,110,.4);margin:0 auto 1.4rem;display:block"
                 viewBox="0 0 24 24" fill="none" stroke-width="1"
                 stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
            <p style="font-family:var(--serif);font-size:2rem;font-weight:300;color:var(--ink);margin:0 0 .5rem">
              Feed en cours de construction
            </p>
            <p style="font-size:.78rem;color:var(--muted);max-width:360px;line-height:1.6;margin:0 auto 1.4rem">
              Le réseau social des architectes arrive bientôt.<br>
              Partage de rendus, coupes habitées, retours chantier.
            </p>
            <span style="display:inline-block;padding:.35rem 1rem;border-radius:99px;
                         background:rgba(201,169,110,.08);border:0.5px solid rgba(201,169,110,.32);
                         font-size:.65rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gold)">
              Bientôt disponible
            </span>
          </div>
        </div>
      `;
    }

    const mod = document.getElementById("module-feed");
    if (!mod) return;
    new MutationObserver(() => {
      if (mod.classList.contains("is-active")) renderFeedWall();
    }).observe(mod, { attributes: true, attributeFilter: ["class"] });
    if (mod.classList.contains("is-active")) renderFeedWall();
  })();

  /* ── Feed Pinterest — CSS + renderer (activé quand le Feed est prêt) ── */
  (function _feedPinterestReserve() {
    /* CSS injecté une fois */
    if (!document.getElementById("tm-feed-css")) {
      const s = document.createElement("style");
      s.id = "tm-feed-css";
      s.textContent = `
        #feed-wall { columns: 3 260px; column-gap: 1rem; }
        .tm-post {
          break-inside: avoid; margin-bottom: 1rem;
          border: 0.5px solid rgba(201,169,110,.22);
          border-radius: 16px; overflow: hidden;
          background: #0C0C0A;
          transition: border-color .22s, box-shadow .22s, transform .22s;
          cursor: pointer;
        }
        .tm-post:hover {
          border-color: rgba(201,169,110,.62);
          box-shadow: 0 16px 48px rgba(0,0,0,.6);
          transform: translateY(-2px);
        }
        .tm-post__img {
          width: 100%; aspect-ratio: 4/3; position: relative; overflow: hidden;
        }
        .tm-post__img--tall  { aspect-ratio: 3/4; }
        .tm-post__img--wide  { aspect-ratio: 16/7; }
        .tm-post__tag {
          position: absolute; top: .65rem; left: .65rem;
          font-size: .52rem; font-weight: 600; letter-spacing: .14em;
          text-transform: uppercase; padding: .22rem .55rem;
          background: rgba(5,5,5,.78); color: var(--gold);
          border: 0.5px solid rgba(201,169,110,.38); border-radius: 99px;
        }
        .tm-post__body { padding: .9rem; display: grid; gap: .5rem; }
        .tm-post__title {
          font-family: var(--serif); font-size: 1.18rem; font-weight: 300;
          color: var(--ink); line-height: 1.25; margin: 0;
        }
        .tm-post__desc {
          font-size: .7rem; color: var(--muted); line-height: 1.55;
          margin: 0; display: -webkit-box; -webkit-line-clamp: 3;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .tm-post__author {
          display: flex; align-items: center; gap: .55rem;
          padding-top: .6rem; border-top: 0.5px solid rgba(245,245,241,.07);
          margin-top: .1rem;
        }
        .tm-post__avatar {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: rgba(201,169,110,.18);
          border: 0.5px solid rgba(201,169,110,.35);
          display: grid; place-items: center;
          font-size: .6rem; font-weight: 600; color: var(--gold);
          letter-spacing: .04em;
        }
        .tm-post__author-info { min-width: 0; }
        .tm-post__author-name {
          font-size: .72rem; font-weight: 500; color: var(--ink);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tm-post__author-role {
          font-size: .62rem; color: var(--muted); white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        @media (max-width: 600px) { #feed-wall { columns: 1; } }
        @media (max-width: 900px) { #feed-wall { columns: 2; } }
      `;
      document.head.appendChild(s);
    }

    /* Renderer */
    const RATIOS = ["", "tm-post__img--tall", "", "tm-post__img--wide", "tm-post__img--tall", ""];

    function renderFeedWall() {
      const wall = document.getElementById("feed-wall");
      if (!wall || wall.querySelector(".tm-post")) return;
      wall.innerHTML = DATA_FEED.map((p, i) => `
        <article class="tm-post" data-slug="${p.slug}" role="button" tabindex="0"
                 aria-label="Voir le post de ${p.auteur}">
          <div class="tm-post__img ${RATIOS[i] || ""}"
               style="background:${p._bg}">
            <span class="tm-post__tag">${p.tag}</span>
          </div>
          <div class="tm-post__body">
            <h3 class="tm-post__title">${p.titre}</h3>
            <p class="tm-post__desc">${p.sous_titre}</p>
            <div class="tm-post__author">
              <div class="tm-post__avatar">${p.initiales}</div>
              <div class="tm-post__author-info">
                <p class="tm-post__author-name">${p.auteur}</p>
                <p class="tm-post__author-role">${p.role}</p>
              </div>
            </div>
          </div>
        </article>
      `).join("");

      /* Clic → profil public */
      wall.querySelectorAll(".tm-post").forEach(card => {
        const go = () => {
          window.open(`profil-public.html?user=${card.dataset.slug}`, "_blank");
        };
        card.addEventListener("click", go);
        card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") go(); });
      });

      /* Injecter actions like/save après rendu */
      setTimeout(initFeedInteractions, 0);
    }
    /* hook désactivé — réactiver quand le feed est prêt */
  })(); /* fin _feedPinterestReserve */

  /* ── Export PDF / DWG Simulator ─────────────────────────────── */
  function initExport() {
    if (document.getElementById("tm-export-wrap")) return;
    const section = document.getElementById("module-showroom");
    if (!section) return;

    const wrap = document.createElement("div");
    wrap.id = "tm-export-wrap";
    section.appendChild(wrap);

    wrap.innerHTML = `
      <div class="tm-export-panel">
        <div>
          <p style="margin:0 0 .16rem;text-transform:uppercase;letter-spacing:.17em;
                    font-size:.58rem;font-weight:500;color:var(--gold)">Export technique</p>
          <h3 style="font-family:var(--serif);font-size:clamp(1.7rem,3.5vw,2.8rem);font-weight:300;
                     line-height:1;color:var(--ink);margin:0">Exporter le dossier TEOMARCHI</h3>
        </div>
        <p style="font-size:.82rem;color:var(--muted);line-height:1.60;max-width:70ch;margin:0">
          Génère un dossier complet incluant les plans de phases, le journal de bord horodaté,
          les fiches matières sélectionnées, les notes ACV et les échéances ESQ → PRO.
        </p>
        <div id="tm-ep" style="display:none;gap:.5rem">
          <div class="tm-export-track">
            <div class="tm-export-bar" id="tm-eb"></div>
          </div>
          <p id="tm-es" style="font-size:.68rem;font-family:var(--mono);color:var(--muted);margin:0">
            Initialisation…
          </p>
        </div>
        <div class="tm-export-btns" id="tm-ect">
          <button type="button" class="text-btn text-btn--primary" id="tm-export-pdf">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                 stroke-linecap="round" stroke-linejoin="round"
                 style="width:13px;height:13px;flex-shrink:0" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Exporter le dossier (PDF)</span>
          </button>
          <button type="button" class="text-btn" id="tm-export-dwg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                 stroke-linecap="round" stroke-linejoin="round"
                 style="width:13px;height:13px;flex-shrink:0" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6M9 13h6M9 17h4"/>
            </svg>
            <span>Plans DWG / IFC</span>
          </button>
        </div>
      </div>
    `;

    const STEPS = [
      { p: 10, msg: "Compilation des phases ESQ → PRO…"    },
      { p: 28, msg: "Intégration des fiches matières…"      },
      { p: 50, msg: "Export du journal de bord horodaté…"   },
      { p: 70, msg: "Rendu des coupes et façades…"           },
      { p: 88, msg: "Assemblage et contrôle qualité…"        },
      { p: 100,msg: "Dossier TEOMARCHI généré avec succès ✓" }
    ];

    function _run(label) {
      const pr  = document.getElementById("tm-ep");
      const bar = document.getElementById("tm-eb");
      const st  = document.getElementById("tm-es");
      const ct  = document.getElementById("tm-ect");
      if (!pr || !bar || !st || !ct) return;

      pr.style.display  = "grid";
      ct.style.display  = "none";
      bar.style.width   = "0%";
      st.style.color    = "var(--muted)";

      let i = 0;
      const tick = setInterval(() => {
        if (i >= STEPS.length) {
          clearInterval(tick);
          pushNotification("Dossier " + label + " prêt — téléchargement simulé");
          setTimeout(() => { pr.style.display = "none"; ct.style.display = ""; }, 4200);
          return;
        }
        const step = STEPS[i++];
        bar.style.width    = step.p + "%";
        st.textContent     = step.msg;
        if (step.p === 100) st.style.color = "var(--ok)";
      }, 480);
    }

    document.getElementById("tm-export-pdf")?.addEventListener("click", () => _run("PDF"));
    document.getElementById("tm-export-dwg")?.addEventListener("click", () => _run("DWG / IFC"));
  }

  (function hookExport() {
    const mod = document.getElementById("module-showroom");
    if (!mod) return;
    new MutationObserver(() => {
      if (mod.classList.contains("is-active")) initExport();
    }).observe(mod, { attributes: true, attributeFilter: ["class"] });
    if (mod.classList.contains("is-active")) initExport();
  })();

  /* ── Persistance des messages Messagerie ─────────────────────── */
  (function setupMsgPersistence() {
    if (typeof DATA_CONTACTS === "undefined") return;
    try {
      const saved = JSON.parse(localStorage.getItem("teomarchi.messages"));
      if (Array.isArray(saved)) {
        saved.forEach(d => {
          const c = DATA_CONTACTS.find(x => x.id === d.id);
          if (c) { c.messages = d.messages; c.preview = d.preview || c.preview; }
        });
      }
    } catch {}
    window.addEventListener("beforeunload", () => {
      try {
        localStorage.setItem("teomarchi.messages", JSON.stringify(
          DATA_CONTACTS.map(c => ({ id: c.id, preview: c.preview, messages: c.messages }))
        ));
      } catch {}
    });
  })();

  /* ── Toast de bienvenue au démarrage ─────────────────────────── */
  setTimeout(() => pushNotification("TEOMARCHI — 10 modules actifs"), 1400);

(function initTeomarchiAuth() {

    const FIREBASE_CONFIG = window.TEOMARCHI_CONFIG.firebase;
    const STRIPE_PUBLIC_KEY = window.TEOMARCHI_CONFIG.stripe.publishableKey;
    const STRIPE_PRICE_IDS = window.TEOMARCHI_CONFIG.stripe.priceIds;
    const STRIPE_PAYMENT_LINK = window.TEOMARCHI_CONFIG.stripe.paymentLinks.studio;
    const STRIPE_AGENCE_LINK  = window.TEOMARCHI_CONFIG.stripe.paymentLinks.agence;

    /* Modules nécessitant une connexion. Outils reste consultable librement. */
    const GATED = new Set([]);

    /* ── État ───────────────────────────────────────────────────── */
    let _auth        = null;
    let _user        = null;
    let _isPremium   = false;
    let _returnMod   = null;
    let _activeTab   = "login";

    const _ready = () =>
      typeof firebase !== "undefined" &&
      FIREBASE_CONFIG.apiKey !== "VOTRE_API_KEY";

    /* ── CSS ────────────────────────────────────────────────────── */
    if (!document.getElementById("tm-auth-css")) {
      const s = document.createElement("style");
      s.id = "tm-auth-css";
      s.textContent = `
        .tm-auth-ov {
          position:fixed;inset:0;z-index:21000;
          background:rgba(3,3,3,.92);
          backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
          display:grid;place-items:center;
          opacity:0;pointer-events:none;
          transition:opacity .28s ease;
        }
        .tm-auth-ov.is-open{opacity:1;pointer-events:all;}
        .tm-auth-box {
          width:min(420px,92vw);
          background:var(--surface);
          border:0.5px solid rgba(201,169,110,.42);
          border-radius:var(--r-xl);
          padding:2.4rem 2rem 2rem;
          display:grid;gap:1.2rem;
          position:relative;
          box-shadow:0 40px 100px rgba(0,0,0,.80);
        }
        .tm-auth-x {
          position:absolute;top:1rem;right:1rem;
          width:28px;height:28px;display:grid;place-items:center;
          border:var(--border);border-radius:50%;
          color:var(--muted);font-size:1.1rem;cursor:pointer;
          transition:color .15s,border-color .15s;
        }
        .tm-auth-x:hover{color:var(--ink);border-color:rgba(201,169,110,.38);}
        .tm-auth-head{text-align:center;}
        .tm-auth-head h2{
          font-family:var(--serif);font-size:2.2rem;font-weight:300;
          color:var(--ink);margin:0 0 .15rem;
        }
        .tm-auth-head p{font-size:.68rem;color:var(--muted);margin:0;}
        .tm-auth-tabs{
          display:grid;grid-template-columns:1fr 1fr;
          border:var(--border);border-radius:var(--r-pill);overflow:hidden;
        }
        .tm-auth-tab{
          padding:.52rem 1rem;text-align:center;
          font-size:.64rem;font-weight:400;letter-spacing:.12em;text-transform:uppercase;
          cursor:pointer;background:transparent;color:var(--muted);
          transition:background .16s,color .16s;
        }
        .tm-auth-tab.is-on{background:rgba(201,169,110,.12);color:var(--ink);}
        .tm-auth-fields{display:grid;gap:.65rem;}
        .tm-auth-lbl{
          display:grid;gap:.22rem;
        }
        .tm-auth-lbl span{
          font-size:.58rem;font-weight:400;letter-spacing:.12em;
          text-transform:uppercase;color:var(--muted);
        }
        .tm-auth-lbl input{
          width:100%;box-sizing:border-box;
          height:42px;padding:0 .9rem;
          border:var(--border);border-radius:var(--r-md);
          background:var(--surface-2);color:var(--ink);font-size:.84rem;
          transition:border-color .18s;
        }
        .tm-auth-lbl input:focus{outline:none;border-color:rgba(201,169,110,.48);}
        .tm-auth-err{
          font-size:.70rem;color:var(--danger);min-height:.9rem;
          text-align:center;margin:0;
        }
        .tm-auth-btn{
          width:100%;height:44px;
          background:var(--gold);border:none;border-radius:var(--r-pill);
          color:#050505;font-family:var(--sans);font-size:.66rem;
          font-weight:500;letter-spacing:.14em;text-transform:uppercase;
          cursor:pointer;transition:background .18s,transform .18s;
        }
        .tm-auth-btn:hover{background:#d4b87a;transform:translateY(-1px);}
        .tm-auth-btn:disabled{opacity:.5;cursor:default;transform:none;}
        .tm-auth-sep{
          display:flex;align-items:center;gap:.72rem;
          font-size:.60rem;color:var(--muted);
        }
        .tm-auth-sep::before,.tm-auth-sep::after{
          content:"";flex:1;height:.5px;background:rgba(245,245,241,.09);
        }
        .tm-auth-google{
          width:100%;height:42px;
          border:var(--border);border-radius:var(--r-pill);
          background:transparent;color:var(--ink-2);
          font-family:var(--sans);font-size:.64rem;font-weight:400;
          letter-spacing:.10em;text-transform:uppercase;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:.6rem;
          transition:border-color .18s,color .18s;
        }
        .tm-auth-google:hover{border-color:rgba(201,169,110,.38);color:var(--ink);}
      `;
      document.head.appendChild(s);
    }

    /* ── Modal ──────────────────────────────────────────────────── */
    function _build() {
      if (document.getElementById("login-modal")) return;
      const el = document.createElement("div");
      el.id = "login-modal";
      el.className = "tm-auth-ov";
      el.setAttribute("role","dialog");
      el.setAttribute("aria-modal","true");
      el.innerHTML = `
        <div class="tm-auth-box">
          <button class="tm-auth-x" id="tm-ax" aria-label="Fermer">×</button>
          <div class="tm-auth-head">
            <h2>TEOMARCHI</h2>
            <p>Plateforme d'intelligence architecturale</p>
          </div>
          <div class="tm-auth-tabs">
            <button class="tm-auth-tab is-on" data-t="login">Connexion</button>
            <button class="tm-auth-tab" data-t="signup">Inscription</button>
          </div>
          <div class="tm-auth-fields">
            <div class="tm-auth-lbl" id="tm-an" style="display:none">
              <span>Nom complet</span>
              <input type="text" id="tm-ai-name" placeholder="Nom complet" autocomplete="name"/>
            </div>
            <div class="tm-auth-lbl">
              <span>E-mail</span>
              <input type="email" id="tm-ai-email" placeholder="vous@teomarchi.com" autocomplete="email"/>
            </div>
            <div class="tm-auth-lbl">
              <span>Mot de passe</span>
              <input type="password" id="tm-ai-pass" placeholder="••••••••" autocomplete="current-password"/>
            </div>
          </div>
          <p class="tm-auth-err" id="tm-ae"></p>
          <button class="tm-auth-btn" id="tm-as">Se connecter</button>
          <div class="tm-auth-sep">ou</div>
          <button class="tm-auth-google" id="tm-ag">
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>
        </div>
      `;
      document.body.appendChild(el);

      /* Tabs */
      el.querySelectorAll("[data-t]").forEach(btn =>
        btn.addEventListener("click", () => {
          _activeTab = btn.dataset.t;
          el.querySelectorAll("[data-t]").forEach(b => b.classList.toggle("is-on", b === btn));
          const nameField = document.getElementById("tm-an");
          const submitBtn = document.getElementById("tm-as");
          const passInput = document.getElementById("tm-ai-pass");
          const error = document.getElementById("tm-ae");
          if (nameField) nameField.style.display = _activeTab === "signup" ? "grid" : "none";
          if (submitBtn) submitBtn.textContent = _activeTab === "login" ? "Se connecter" : "Créer le compte";
          passInput?.setAttribute("autocomplete", _activeTab === "signup" ? "new-password" : "current-password");
          if (error) error.textContent = "";
        })
      );

      /* Close */
      document.getElementById("tm-ax")?.addEventListener("click", _hide);
      el.addEventListener("click", e => { if (e.target === el) _hide(); });
      document.addEventListener("keydown", e => {
        if (e.key === "Escape" && el.classList.contains("is-open")) _hide();
      });

      /* Submit & inputs */
      document.getElementById("tm-as")?.addEventListener("click", _submit);
      el.querySelectorAll("input").forEach(i => i.addEventListener("keydown", e => { if (e.key === "Enter") _submit(); }));
      document.getElementById("tm-ag")?.addEventListener("click", _google);
    }

    function _show(returnMod) {
      if (returnMod) _returnMod = returnMod;
      _build();
      document.querySelector("#login-modal")?.classList.add("is-open");
      document.body.style.overflow = "hidden";
      setTimeout(() => document.getElementById("tm-ai-email")?.focus(), 80);
    }

    document.addEventListener("teomarchi:open-login", () => _show(null));

    function _hide() {
      document.querySelector("#login-modal")?.classList.remove("is-open");
      document.body.style.overflow = "";
      _returnMod = null;
    }

    /* ── Stripe Checkout ───────────────────────────────────────── */
    let isCheckoutPending = false;

    function _checkoutAuth() {
      return window.auth || _auth || (typeof firebase !== "undefined" ? firebase.auth?.() : null);
    }

    function _resolveCheckoutUser(auth) {
      if (!auth) return Promise.resolve(null);

      return new Promise(resolve => {
        let settled = false;
        let unsubscribe = null;

        const finish = user => {
          if (settled) return;
          settled = true;
          if (typeof unsubscribe === "function") unsubscribe();
          resolve(user || null);
        };

        try {
          if (typeof auth.onAuthStateChanged === "function") {
            unsubscribe = auth.onAuthStateChanged(
              user => finish(user),
              () => finish(auth.currentUser || null)
            );
            setTimeout(() => finish(auth.currentUser || null), 3000);
            return;
          }

          finish(auth.currentUser || null);
        } catch {
          finish(auth.currentUser || null);
        }
      });
    }

    function _setCheckoutBusy(isBusy) {
      document.querySelectorAll("#checkout-btn, [data-checkout-plan]").forEach(btn => {
        btn.disabled = isBusy;
        btn.classList.toggle("is-loading", isBusy);
        btn.setAttribute("aria-busy", String(isBusy));
      });
    }

    function _checkoutFallbackUrl(planId, user) {
      const link = planId === "agence" ? STRIPE_AGENCE_LINK : STRIPE_PAYMENT_LINK;
      const uid = user?.uid ? "?client_reference_id=" + encodeURIComponent(user.uid) : "";
      return link + uid;
    }

    async function handleCheckout(planId = "studio") {
      if (isCheckoutPending) return;
      isCheckoutPending = true;
      _setCheckoutBusy(true);

      try {
        const auth = _checkoutAuth();
        const user = await _resolveCheckoutUser(auth);

        if (!user) {
          _show(null);
          if (typeof pushNotification === "function") {
            pushNotification("Connecte-toi pour activer le paiement Stripe.");
          }
          return;
        }

        if (typeof Stripe !== "function") {
          window.location.assign(_checkoutFallbackUrl(planId, user));
          return;
        }

        const stripe = Stripe(STRIPE_PUBLIC_KEY);
        const priceId = STRIPE_PRICE_IDS[planId] || STRIPE_PRICE_IDS.studio;
        const { error } = await stripe.redirectToCheckout({
          lineItems: [{ price: priceId, quantity: 1 }],
          mode: "subscription",
          successUrl: window.location.origin + "/success.html",
          cancelUrl: window.location.origin + "/cancel.html",
          customerEmail: user.email || undefined
        });

        if (error) throw error;
      } catch (err) {
        const message = err?.message || "Une erreur est survenue lors de la redirection vers Stripe.";
        if (typeof pushNotification === "function") {
          pushNotification(message);
        }
      } finally {
        isCheckoutPending = false;
        _setCheckoutBusy(false);
      }
    }

    window.handleCheckout = handleCheckout;

    /* ── Handlers ───────────────────────────────────────────────── */
    const _ERR = {
      "auth/invalid-email":            "E-mail invalide.",
      "auth/user-not-found":           "Aucun compte avec cet e-mail.",
      "auth/wrong-password":           "Mot de passe incorrect.",
      "auth/invalid-credential":       "E-mail ou mot de passe incorrect.",
      "auth/email-already-in-use":     "Cet e-mail est déjà utilisé.",
      "auth/weak-password":            "Mot de passe trop court (min. 6 caractères).",
      "auth/popup-closed-by-user":     "Fenêtre fermée — réessaie.",
      "auth/popup-blocked":            "Popup bloquée par le navigateur — autorise les popups pour ce site.",
      "auth/cancelled-popup-request":  "Connexion annulée.",
      "auth/network-request-failed":   "Erreur réseau — vérifie ta connexion.",
      "auth/too-many-requests":        "Trop de tentatives. Attends quelques minutes.",
      "auth/user-disabled":            "Ce compte a été désactivé.",
      "auth/operation-not-allowed":    "Connexion par e-mail non activée dans Firebase Console.",
      "auth/unauthorized-domain":      "Domaine non autorisé — ajoute ce domaine dans Firebase Console → Authentication → Authorized domains.",
      "auth/internal-error":           "Erreur interne Firebase. Réessaie.",
      "auth/requires-recent-login":    "Reconnecte-toi pour continuer."
    };

    function _err(msg)  { const el = document.getElementById("tm-ae"); if (el) el.textContent = msg; }
    function _busy(on)  {
      const btn = document.getElementById("tm-as");
      if (!btn) return;
      btn.disabled    = on;
      btn.textContent = on ? "Chargement…" : (_activeTab === "login" ? "Se connecter" : "Créer le compte");
    }

    async function _submit() {
      if (!_auth) { _err("Firebase non configuré — suis les instructions de setup."); return; }
      const email = document.getElementById("tm-ai-email")?.value.trim();
      const pass  = document.getElementById("tm-ai-pass")?.value;
      const name  = document.getElementById("tm-ai-name")?.value.trim();
      if (!email || !pass) { _err("Remplis tous les champs."); return; }
      _busy(true); _err("");
      try {
        if (_activeTab === "login") {
          await _auth.signInWithEmailAndPassword(email, pass);
        } else {
          const c = await _auth.createUserWithEmailAndPassword(email, pass);
          if (name) await c.user.updateProfile({ displayName: name });
        }
        _hide();
        if (typeof pushNotification === "function") pushNotification("Bienvenue sur TEOMARCHI");
      } catch(e) {
        _err(_ERR[e.code] || "Erreur inattendue. Réessaie.");
      } finally { _busy(false); }
    }

    async function _google() {
      if (!_auth) { _err("Firebase non configuré."); return; }
      try {
        await _auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        _hide();
        if (typeof pushNotification === "function") pushNotification("Bienvenue sur TEOMARCHI");
      } catch(e) { _err(_ERR[e.code] || "Erreur Google."); }
    }

    /* ── Vérifier isPremium depuis Firestore ────────────────────── */
    async function _checkPremium(user) {
      _isPremium = false;
      if (!user) return;
      try {
        const doc = await firebase.firestore()
          .collection("users").doc(user.uid).get();
        _isPremium = doc.exists && doc.data().isPremium === true;
      } catch (_) { /* offline ou règles — pas bloquant */ }
    }

    /* ── Sync UI après changement d'état ────────────────────────── */
    const ADMIN_EMAIL = "teomarchi@teomarchi.com";

    function _syncUI(user) {
      const lbl = document.getElementById("session-label");
      if (lbl) lbl.textContent = user
        ? (user.displayName || user.email.split("@")[0])
        : "Session";

      /* ── Panneau Admin : visible uniquement pour le fondateur ─── */
      const adminTab     = document.getElementById("tab-admin");
      const adminDashBtn = document.getElementById("btn-admin-dash");
      const isAdmin      = user?.email === ADMIN_EMAIL;
      if (adminTab)     adminTab.style.display     = isAdmin ? "" : "none";
      if (adminDashBtn) adminDashBtn.style.display = isAdmin ? "" : "none";
      if (isAdmin && document.getElementById("module-admin")?.classList.contains("is-active")) {
        _initAdmin();
      }

      if (typeof TEOMARCHI_APP !== "undefined") {
        if (user) TEOMARCHI_APP.session.set({
          name:        user.displayName || user.email.split("@")[0],
          displayName: user.displayName || "",
          email:       user.email || "",
          photoURL:    user.photoURL || "",
          role:        isAdmin ? "Fondateur · Admin" : (_isPremium ? "Membre Premium" : "Utilisateur TEOMARCHI"),
          grade:       isAdmin ? "★★" : (_isPremium ? "★" : "M"),
          connectedAt: new Date().toISOString()
        });
        else TEOMARCHI_APP.session.clear();
      }
    }

    /* ── Panneau Admin ──────────────────────────────────────────── */
    async function _initAdmin() {
      const root = document.getElementById("admin-layout");
      if (!root || root.dataset.loaded) return;
      root.dataset.loaded = "1";

      /* CSS Admin */
      if (!document.getElementById("tm-admin-css")) {
        const s = document.createElement("style");
        s.id = "tm-admin-css";
        s.textContent = `
          .tm-adm { display:grid; gap:1.2rem; }
          .tm-adm-kpis { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:1rem; }
          .tm-adm-kpi {
            background:var(--surface); border:var(--border); border-radius:var(--r-md);
            padding:1.1rem 1.2rem; display:grid; gap:.28rem;
          }
          .tm-adm-kpi__val {
            font-family:var(--serif); font-size:2.4rem; font-weight:300; color:var(--gold); line-height:1;
          }
          .tm-adm-kpi__lbl { font-size:.62rem; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); }
          .tm-adm-section { background:var(--surface); border:var(--border); border-radius:var(--r-xl); padding:1.4rem 1.6rem; }
          .tm-adm-section h3 {
            font-family:var(--serif); font-size:1.5rem; font-weight:300; color:var(--ink);
            margin:0 0 1rem; padding-bottom:.72rem; border-bottom:var(--border);
          }
          .tm-adm-table { width:100%; border-collapse:collapse; }
          .tm-adm-table th, .tm-adm-table td {
            text-align:left; padding:.55rem .6rem; font-size:.72rem; border-bottom:var(--border);
          }
          .tm-adm-table th { color:var(--muted); font-weight:500; letter-spacing:.1em; text-transform:uppercase; }
          .tm-adm-table td { color:var(--ink); }
          .tm-adm-badge {
            display:inline-block; padding:.18rem .55rem; border-radius:99px; font-size:.58rem;
            font-weight:600; letter-spacing:.1em; text-transform:uppercase;
          }
          .tm-adm-badge--premium { background:rgba(201,169,110,.15); color:var(--gold); border:0.5px solid rgba(201,169,110,.35); }
          .tm-adm-badge--free    { background:rgba(107,107,101,.12); color:var(--muted); border:var(--border); }
          .tm-adm-actions { display:flex; gap:.6rem; flex-wrap:wrap; margin-top:.5rem; }
          .tm-adm-btn {
            padding:.5rem 1rem; border-radius:var(--r-sm); font-size:.72rem; font-weight:500;
            cursor:pointer; border:0.5px solid rgba(201,169,110,.38);
            background:rgba(201,169,110,.08); color:var(--gold); transition:background .15s;
          }
          .tm-adm-btn:hover { background:rgba(201,169,110,.18); }
          .tm-adm-btn--danger { border-color:rgba(220,80,80,.38); background:rgba(220,80,80,.08); color:#dc8080; }
          .tm-adm-btn--danger:hover { background:rgba(220,80,80,.18); }
        `;
        document.head.appendChild(s);
      }

      root.innerHTML = `<p style="color:var(--muted);font-size:.8rem;padding:1.2rem">Chargement…</p>`;

      let users = [];
      try {
        const snap = await firebase.firestore().collection("users").get();
        snap.forEach(doc => {
          const d = doc.data();
          const ts = d.createdAt;
          const date = ts?.toDate ? ts.toDate().toISOString().slice(0,10) : (ts || "—");
          users.push({
            email:   d.email   || doc.id,
            plan:    d.plan    || "gratuit",
            date,
            premium: !!d.premium
          });
        });
      } catch(err) {
        root.dataset.loaded = "";
        root.innerHTML = `<p style="color:var(--danger);font-size:.8rem;padding:1.2rem">Erreur Firestore : ${err.message}</p>`;
        return;
      }

      const premiumCount = users.filter(u => u.premium).length;
      const mrrStudio    = users.filter(u => u.plan==="studio").length * 29;
      const mrrAgence    = users.filter(u => u.plan==="agence").length * 89;
      const convRate     = users.length ? ((premiumCount / users.length) * 100).toFixed(0) : 0;

      root.innerHTML = `
        <div class="tm-adm">

          <div class="tm-adm-kpis">
            <div class="tm-adm-kpi">
              <span class="tm-adm-kpi__val">${users.length}</span>
              <span class="tm-adm-kpi__lbl">Utilisateurs</span>
            </div>
            <div class="tm-adm-kpi">
              <span class="tm-adm-kpi__val">${premiumCount}</span>
              <span class="tm-adm-kpi__lbl">Membres premium</span>
            </div>
            <div class="tm-adm-kpi">
              <span class="tm-adm-kpi__val">${mrrStudio + mrrAgence} €</span>
              <span class="tm-adm-kpi__lbl">MRR estimé</span>
            </div>
            <div class="tm-adm-kpi">
              <span class="tm-adm-kpi__val">${convRate} %</span>
              <span class="tm-adm-kpi__lbl">Taux conversion</span>
            </div>
          </div>

          <div class="tm-adm-section">
            <h3>Utilisateurs inscrits</h3>
            <table class="tm-adm-table">
              <thead>
                <tr><th>Email</th><th>Plan</th><th>Inscription</th><th>Statut</th></tr>
              </thead>
              <tbody>
                ${users.length ? users.map(u => `
                  <tr>
                    <td>${u.email}</td>
                    <td>${u.plan.charAt(0).toUpperCase() + u.plan.slice(1)}</td>
                    <td>${u.date}</td>
                    <td><span class="tm-adm-badge ${u.premium ? "tm-adm-badge--premium" : "tm-adm-badge--free"}">
                      ${u.premium ? "Premium" : "Gratuit"}
                    </span></td>
                  </tr>
                `).join("") : `<tr><td colspan="4" style="color:var(--muted);text-align:center;padding:1.2rem">Aucun utilisateur</td></tr>`}
              </tbody>
            </table>
          </div>

          <div class="tm-adm-section">
            <h3>Actions rapides</h3>
            <div class="tm-adm-actions">
              <button class="tm-adm-btn" type="button" data-external-url="https://dashboard.stripe.com">
                Stripe Dashboard
              </button>
              <button class="tm-adm-btn" type="button" data-external-url="https://console.firebase.google.com">
                Firebase Console
              </button>
              <button class="tm-adm-btn" type="button" data-external-url="https://github.com/jyav-ctrl/teomarchi">
                GitHub Repo
              </button>
              <button class="tm-adm-btn tm-adm-btn--danger" id="btn-reset-sessions">
                Reset sessions
              </button>
            </div>
          </div>

        </div>
      `;

      document.getElementById("btn-reset-sessions")?.addEventListener("click", async () => {
        if (!confirm("Forcer la déconnexion de tous les utilisateurs ?")) return;
        try {
          await firebase.firestore().collection("_meta").doc("global")
            .set({ sessionsResetAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
          await firebase.auth().signOut();
        } catch(err) {
          if (typeof pushNotification === "function") pushNotification("Erreur : " + err.message);
        }
      });
    }

    /* Hook Admin — active _initAdmin quand le module devient visible */
    (function hookAdmin() {
      const mod = document.getElementById("module-admin");
      if (!mod) return;
      new MutationObserver(() => {
        if (mod.classList.contains("is-active") && _user?.email === ADMIN_EMAIL) _initAdmin();
      }).observe(mod, { attributes: true, attributeFilter: ["class"] });
    })();

    /* ── Firebase init ──────────────────────────────────────────── */
    function _initFirebase() {
      if (!_ready()) return;
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      _auth = firebase.auth();
      _auth.onAuthStateChanged(async user => {
        _user = user;
        await _checkPremium(user);
        _syncUI(user);

        if (!user) {
          /* Vérifier si on est sur un module protégé */
          GATED.forEach(id => {
            const mod = document.getElementById("module-" + id);
            if (mod?.classList.contains("is-active"))
              setTimeout(() => _show(id), 350);
          });
        }

        if (user && _returnMod) {
          const dest = _returnMod; _returnMod = null;
          setTimeout(() => document.querySelector(`[data-nav="${dest}"]`)?.click(), 200);
        }
      });
    }

    /* ── Gating — capture avant la navigation SPA ───────────────── */
    document.addEventListener("click", e => {
      const tab = e.target.closest("[data-nav]");
      if (!tab || !_ready()) return;
      if (!GATED.has(tab.dataset.nav)) return;
      if (_user) return;
      e.stopImmediatePropagation();
      _show(tab.dataset.nav);
    }, true);

    /* ── Déconnexion — intercepte le bouton profil ──────────────── */
    document.addEventListener("click", e => {
      if (!e.target.closest("#profil-session-btn") || !_auth) return;
      e.stopImmediatePropagation();
      if (_user) {
        _auth.signOut();
        if (typeof pushNotification === "function") pushNotification("Déconnecté");
      } else {
        _show(null);
      }
    }, true);

    /* ── Stripe Checkout — bouton premium principal ─────────────── */
    document.addEventListener("click", e => {
      const btn = e.target.closest("#checkout-btn, [data-checkout-plan]");
      if (!btn) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      handleCheckout(btn.dataset.checkoutPlan || "studio");
    }, true);

    /* ── Stripe — intercepte les boutons de plan ───────────────────── */
    document.addEventListener("click", e => {
      const btn = e.target.closest("[data-plan='studio'], [data-plan='agence']");
      if (!btn) return;
      e.stopImmediatePropagation();
      if (_ready() && !_user) { _show(null); return; }
      const uid  = _user?.uid || "";
      const link = btn.dataset.plan === "agence" ? STRIPE_AGENCE_LINK : STRIPE_PAYMENT_LINK;
      window.open(link + (uid ? "?client_reference_id=" + uid : ""), "_blank");
    }, true);

    /* ── Retour Stripe : recharge isPremium depuis Firestore ────────
       Le webhook peut prendre 2–5s. On poll jusqu'à isPremium = true.  */
    if (new URLSearchParams(location.search).get("paiement") === "ok") {
      history.replaceState(null, "", location.pathname);
      if (typeof pushNotification === "function")
        pushNotification("Paiement reçu — vérification en cours…");

      let _tries = 0;
      const _pollPremium = setInterval(async () => {
        _tries++;
        if (!_user || _tries > 20) { clearInterval(_pollPremium); return; }
        await _checkPremium(_user);
        if (_isPremium) {
          clearInterval(_pollPremium);
          _syncUI(_user);
          if (typeof pushNotification === "function")
            pushNotification("Accès Premium activé — bienvenue !");
        }
      }, 2000);
    }

    /* ── Attente du SDK Firebase (chargé depuis CDN) ─────────────── */
    /* ── Hamburger mobile ───────────────────────────────────────── */
    (function initHamburger() {
      const btn     = document.getElementById("hamburger-btn");
      const sidebar = document.querySelector(".sidebar");
      const overlay = document.getElementById("sidebar-overlay");
      if (!btn || !sidebar || !overlay) return;

      function openSidebar() {
        sidebar.classList.add("is-open");
        overlay.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
      function closeSidebar() {
        sidebar.classList.remove("is-open");
        overlay.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      }

      btn.addEventListener("click", () =>
        sidebar.classList.contains("is-open") ? closeSidebar() : openSidebar()
      );
      overlay.addEventListener("click", closeSidebar);

      /* Fermer automatiquement après navigation */
      sidebar.addEventListener("click", e => {
        if (e.target.closest(".sidebar-item")) closeSidebar();
      });
    })();

    let _pollTries = 0;
    const _poll = setInterval(() => {
      _pollTries++;
      if (_ready()) { clearInterval(_poll); _initFirebase(); return; }
      if (_pollTries > 40) { clearInterval(_poll); console.warn("Firebase SDK non chargé après 10s — vérifier la connexion CDN."); }
    }, 250);

  })();
