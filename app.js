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
  des Payment Links publics côté client, ou une Cloud Function pour créer
  une session Checkout si des Price IDs sont réintroduits plus tard.
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
      studio: "",
      agence: ""
    },
    paymentLinks: {
      studio: "https://buy.stripe.com/3cIbIUegv65P7j6d8w1RC06",
      agence: "https://buy.stripe.com/5kQ28ka0f3XHeLy7Oc1RC05"
    }
  }
};

const TEOMARCHI_ROLES = Object.freeze(["free", "studio", "agency", "moderator", "admin"]);
const USER_STATUS = Object.freeze(["active", "suspended", "deleted"]);
const PLAN_ACCESS = Object.freeze({
  free: Object.freeze([
    "read:atlas",
    "read:chronos",
    "read:pantheon",
    "read:outils-basic",
    "read:ecologie"
  ]),
  studio: Object.freeze([
    "read:atlas",
    "read:chronos",
    "read:pantheon",
    "read:outils-basic",
    "read:ecologie",
    "tools:advanced",
    "journalier:full",
    "ai:full",
    "cloud:save",
    "feed:advanced"
  ]),
  agency: Object.freeze([
    "read:atlas",
    "read:chronos",
    "read:pantheon",
    "read:outils-basic",
    "read:ecologie",
    "tools:advanced",
    "journalier:full",
    "ai:full",
    "cloud:save",
    "feed:advanced",
    "showroom:publish",
    "sponsor:publish",
    "projects:multi",
    "analytics:agency",
    "visibility:agency"
  ]),
  moderator: Object.freeze(["moderation:read", "moderation:write"]),
  admin: Object.freeze(["*"]) // admin bypass : contourne les limitations et accès à tous les modules.
});
const PLAN_LABELS = Object.freeze({
  free: "Free",
  studio: "Studio",
  agency: "Agency",
  moderator: "Modérateur",
  admin: "Admin"
});
window.TEOMARCHI_SECURITY_MODEL = Object.freeze({
  roles: TEOMARCHI_ROLES,
  status: USER_STATUS,
  plans: PLAN_ACCESS,
  note: "Sécurité critique à appliquer via Firestore Rules ou Cloud Functions, jamais uniquement côté front."
});

function getUserPlan(source = window.TEOMARCHI_AUTH_STATE) {
  const user = source?.user || source;
  const email = String(user?.email || source?.email || "").toLowerCase();
  if (email === "teomarchi@teomarchi.com" || source?.isAdmin || source?.role === "admin") return "admin";
  const raw = String(source?.plan || source?.role || source?.subscriptionRole || "").toLowerCase();
  if (raw === "agence") return "agency";
  if (TEOMARCHI_ROLES.includes(raw)) return raw;
  if (source?.isPremium === true) return "studio";
  return "free";
}

function canAccessFeature(feature, source = window.TEOMARCHI_AUTH_STATE) {
  const plan = getUserPlan(source);
  const access = PLAN_ACCESS[plan] || PLAN_ACCESS.free;
  return access.includes("*") || access.includes(feature);
}

function renderUpgradeGate(feature, targetPlan = "studio") {
  const plan = targetPlan === "agency" ? "agency" : "studio";
  return `
    <div class="tm-upgrade-gate" data-upgrade-plan="${plan}" data-upgrade-feature="${String(feature || "")}">
      <p class="eyebrow">Accès ${PLAN_LABELS[plan]}</p>
      <h3>Fonction réservée aux abonnés ${PLAN_LABELS[plan]}.</h3>
      <p>Votre plan actuel permet la consultation. Passez à ${PLAN_LABELS[plan]} pour activer cette fonction.</p>
      <button class="text-btn text-btn--primary" type="button" data-checkout-plan="${plan === "agency" ? "agence" : "studio"}">
        Passer à ${PLAN_LABELS[plan]}
      </button>
    </div>
  `;
}

const ACQUISITION_PLAYBOOK = Object.freeze([
  {
    channel: "LinkedIn",
    cadence: "2 publications par semaine",
    action: "Extraits techniques Atlas/Panthéon et visuels premium."
  },
  {
    channel: "Reddit / Discord",
    cadence: "Veille hebdomadaire",
    action: "architecture_students, architecture, serveurs d'écoles et retours étudiants."
  },
  {
    channel: "Partenariats écoles",
    cadence: "Prises de contact ciblées",
    action: "La Cambre, ENSAV, ENSA Paris et ateliers francophones."
  },
  {
    channel: "Instagram/TikTok",
    cadence: "Formats courts",
    action: "Croquis, systèmes constructifs, avant/après et esthétique TEOMARCHI."
  }
]);

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
      { id: "accueil",    label: "Accueil"    },
      { id: "atlas",      label: "Atlas"      },
      { id: "chronos",    label: "Chronos"    },
      { id: "pantheon",   label: "Panthéon"   },
      { id: "fiches",     label: "Normes"     },
      { id: "etudes",     label: "Études"     },
      { id: "outils",     label: "Outils"     },
      { id: "ecologie",   label: "Écologie"   },
      { id: "journalier", label: "Journalier" },
      { id: "showroom",   label: "Showroom"   },
      { id: "contact",    label: "Contact"    },
      { id: "feed",       label: "Feed"       },
      /* ── Modules accédés via la navbar (hors sidebar) ── */
      { id: "profil",     label: "Profil",     noSidebar: true },
      { id: "messagerie", label: "Messagerie", noSidebar: true },
      { id: "admin",      label: "Admin",      noSidebar: true, hidden: true }
    ];

    /* Icônes SVG par module */
    const MODULE_ICONS = {
      accueil:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/><path d="M9 20v-6h6v6"/></svg>`,
      atlas:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9"/></svg>`,
      chronos:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
      pantheon:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18M5 20V10M19 20V10M9 20V10M15 20V10M12 4l8 6H4l8-6z"/></svg>`,
      fiches:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11z"/><circle cx="12" cy="10" r="2.2"/><path d="M4 21h16"/></svg>`,
      etudes:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
      outils:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
      ecologie:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22c4.5-3.5 7-7.5 7-12.5A6.5 6.5 0 0 0 12 3a6.5 6.5 0 0 0-7 6.5C5 14.5 7.5 18.5 12 22z"/><path d="M9 11c2.8-.2 4.8-1.6 6-4"/><path d="M12 22V10"/></svg>`,
      journalier: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>`,
      showroom:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/></svg>`,
      contact:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/><path d="M8 20h8"/></svg>`,
      feed:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
      profil:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
      messagerie: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>`,
      admin:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`
    };

    const METRICS = [
      { value: "12", label: "Modules"        },
      { value: "30", label: "Villes normées" },
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

    const escapeHTML = value => String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    /* ── État ─────────────────────────────────────────────────── */
    let currentModule = "atlas";
    let aiBooted = false;

    const SPONSOR_DECK_SECTIONS = [
      {
        title: "TEOMARCHI en une phrase",
        body: "Une infrastructure numérique architecturale pour apprendre, concevoir, comparer et publier avec plus de méthode."
      },
      {
        title: "Vision",
        body: "Rendre l’architecture plus accessible, plus technique et plus humaine, avec une plateforme sobre, évolutive et utile aux ateliers."
      },
      {
        title: "Modules",
        body: "Atlas, Chronos, Panthéon, Outils, Normes & Villes, Écologie, Journalier, Feed et Showroom."
      },
      {
        title: "Audience",
        body: "Étudiants, écoles, agences, architectes d’intérieur, designers, marques matériaux, mobilier, BIM et habitat."
      },
      {
        title: "Offres sponsor",
        body: "sponsoring showroom, sponsoring module, soutien développement, licences logicielles, matériel, collaborations écoles/agences."
      },
      {
        title: "Contact",
        body: "Contact direct pour proposer un partenariat, devenir sponsor ou échanger avec TEOMARCHI."
      }
    ];

    const AI_NAME_CANDIDATES = ["Aster", "Axia", "Lithia"];
    const AI_DEFAULT_NAME = "Lithia";
    const AI_LIMIT_MESSAGE = "L’IA TEOMARCHI fournit une aide pédagogique. Les choix techniques doivent être vérifiés selon les normes locales, le contexte du projet et les professionnels compétents.";
    const AI_PRIVACY_NOTE = "Confidentialité : ne pas entrer d’informations confidentielles, de données personnelles sensibles, de secrets de projet ou de documents privés.";
    const AI_QUICK_PROMPTS = [
      "Quel matériau pour un climat humide ?",
      "Comment améliorer l’inertie thermique ?",
      "Quelle toiture pour la Belgique ?",
      "Quel système constructif bas-carbone ?",
      "Aide-moi à organiser mon projet."
    ];

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

    function initLandingSections () {
      const root = $("#landing-sections");
      if (!root || root.dataset.loaded === "landing") return;
      root.dataset.loaded = "landing";
      root.innerHTML = `
        <section class="landing-band landing-band--split">
          <div>
            <p class="landing-kicker">Créateur & intention</p>
            <h2 class="landing-title">Une infrastructure de conception.</h2>
          </div>
          <div class="landing-card">
            <h3>Jonathan YAV, étudiant en architecture</h3>
            <p>
              TEOMARCHI naît d'un besoin concret d'atelier : rendre l'architecture plus lisible,
              mieux structurée et plus accessible, sans perdre l'exigence technique du projet.
            </p>
            <p>
              La plateforme connecte références, outils, journal de projet, communauté, profils,
              partenaires et futurs espaces de publication dans un même environnement sobre.
            </p>
          </div>
        </section>

        <section class="landing-band landing-band--modules">
          <div class="landing-band__head">
            <p class="landing-kicker">Modules principaux</p>
            <h2 class="landing-title landing-title--wide">Une bibliothèque active pour concevoir.</h2>
          </div>
          <div class="landing-modules-grid">
            ${[
              ["Atlas", "Géographie des systèmes constructifs, climats, matières et leçons contemporaines.", "atlas"],
              ["Chronos", "Frise matière-époque pour comprendre l'évolution technique de l'espace.", "chronos"],
              ["Journalier", "Pilotage de projet : tâches, deadlines, calendrier, progression et notes.", "journalier"],
              ["Feed", "Espace social architectural protégé contre le plagiat et pensé pour les rendus.", "feed"],
              ["Showroom", "Galerie premium pour mobilier, matériaux, agences, sponsors et jeunes créateurs.", "showroom"]
            ].map(([name, desc, nav]) => `
              <article class="landing-card" role="button" tabindex="0" data-nav="${nav}">
                <p class="landing-kicker">${name}</p>
                <h3>${name}</h3>
                <p>${desc}</p>
              </article>
            `).join("")}
          </div>
        </section>

        <section class="landing-band landing-band--premium">
          <div class="landing-band__head">
            <p class="landing-kicker">Offres premium</p>
            <h2 class="landing-title landing-title--wide">Publier les projets, prescrire les ressources, gagner en visibilité.</h2>
            <p class="landing-copy">
              Les abonnements préparent l'accès aux outils avancés, au Showroom, à la publication,
              aux mises en avant et aux futurs espaces professionnels.
            </p>
          </div>
          <div class="landing-premium-grid">
            <article class="landing-card">
              <p class="landing-kicker">Studio</p>
              <h3>Créateurs & étudiants</h3>
              <p><span class="landing-price">29€</span> / mois</p>
              <ul>
                <li>Outils avancés et IA TEOMARCHI</li>
                <li>Journalier complet et sauvegarde cloud</li>
                <li>Feed avancé pour suivre les projets</li>
              </ul>
              <button type="button" class="text-btn text-btn--primary" data-checkout-plan="studio">Choisir Studio</button>
            </article>
            <article class="landing-card">
              <p class="landing-kicker">Agence</p>
              <h3>Studios & partenaires</h3>
              <p><span class="landing-price">89€</span> / mois</p>
              <ul>
                <li>Publication Showroom et sponsor</li>
                <li>Multi-projets et analytics agence</li>
                <li>Visibilité prioritaire pour studios</li>
              </ul>
              <button type="button" class="text-btn text-btn--primary" data-checkout-plan="agence">Choisir Agence</button>
            </article>
          </div>
        </section>

        <section class="landing-status">
          <div class="landing-band__head">
            <p class="landing-kicker">État du projet</p>
            <h2 class="landing-title landing-title--wide">Plateforme en développement actif, ouverte aux collaborations.</h2>
            <p class="landing-copy">
              TEOMARCHI se construit comme une future plateforme architecturale mondiale :
              culturelle, technique, communautaire et ouverte aux collaborations.
            </p>
          </div>
        </section>

        <section class="landing-band">
          <div>
            <p class="landing-kicker">Contact & réseaux</p>
            <h2 class="landing-title">Collaboration, Sponsors, Communauté.</h2>
          </div>
          <div class="landing-contact-grid">
            <article class="landing-card">
              <h3>Contact</h3>
              <p>Pour toute question, collaboration, support ou partenariat.</p>
              <a href="mailto:teomarchi@teomarchi.com" class="text-btn">teomarchi@teomarchi.com</a>
            </article>
            <article class="landing-card">
              <h3>Futurs sponsors</h3>
              <p>Matériaux, mobilier, BIM, écoles, studios, marques design et services créatifs.</p>
              <button type="button" class="text-btn" data-nav="showroom">Découvrir le Showroom</button>
            </article>
            <article class="landing-card">
              <h3>Communauté</h3>
              <p>Étudiants, designers, agences, enseignants et créateurs liés à l'habitat.</p>
              <button type="button" class="text-btn" data-nav="feed">Voir le Feed</button>
            </article>
            <article class="landing-card">
              <h3>IA TEOMARCHI</h3>
              <p>Lithia accompagne les choix de matériaux, systèmes constructifs, écologie et organisation de projet.</p>
              <button type="button" class="text-btn" data-ai-open>Ouvrir Lithia</button>
            </article>
          </div>
        </section>
      `;
    }

    function initContactSponsors () {
      const root = $("#contact-layout");
      if (!root) return;
      if (root.dataset.loaded === "contact-sponsors") return;
      root.dataset.loaded = "contact-sponsors";

      root.innerHTML = `
        <div class="tm-contact">
          <section class="tm-contact-hero">
            <div>
              <p class="landing-kicker">Contact & Sponsors</p>
              <h3>Collaborer avec TEOMARCHI</h3>
              <p>
                TEOMARCHI rassemble apprentissage architectural, culture constructive,
                outils techniques, écologie, publication et Showroom premium. Cette page
                prépare les partenariats avec marques, écoles, agences, designers,
                studios et sponsors liés à l’habitat.
              </p>
            </div>
            <div class="tm-contact-actions">
              <a class="text-btn text-btn--gold" href="mailto:teomarchi@teomarchi.com?subject=Partenariat%20TEOMARCHI">
                Proposer un partenariat
              </a>
              <a class="text-btn" href="mailto:teomarchi@teomarchi.com?subject=Contact%20TEOMARCHI">
                Contacter TEOMARCHI
              </a>
              <a class="text-btn" href="mailto:teomarchi@teomarchi.com?subject=Devenir%20sponsor%20TEOMARCHI">
                Devenir sponsor
              </a>
            </div>
          </section>

          <section class="tm-contact-grid">
            <article class="landing-card">
              <p class="landing-kicker">Vision</p>
              <h3>Une plateforme architecturale en construction active.</h3>
              <p>
                Le projet vise une bibliothèque technique, un atelier numérique,
                un réseau social spécialisé et une galerie partenaire haut de gamme.
              </p>
            </article>
            <article class="landing-card">
              <p class="landing-kicker">Audience cible</p>
              <h3>Étudiants, agences, écoles et marques.</h3>
              <p>
                TEOMARCHI parle aux créateurs de l’habitat : architecture, urbanisme,
                design d’espace, matériaux, mobilier, BIM, écoconstruction et édition.
              </p>
            </article>
            <article class="landing-card">
              <p class="landing-kicker">Partenariats recherchés</p>
              <h3>Visibilité sobre, utile et non intrusive.</h3>
              <p>
                sponsoring showroom, sponsoring module, soutien développement,
                licences logicielles, matériel, collaborations écoles/agences.
              </p>
            </article>
          </section>

          <section class="tm-contact-deck">
            <div>
              <p class="landing-kicker">Sponsor Deck</p>
              <h3>Base exportable pour un futur dossier sponsor.</h3>
            </div>
            <div class="tm-contact-deck__grid">
              ${SPONSOR_DECK_SECTIONS.map(section => `
                <article class="tm-contact-deck__card">
                  <span>${escapeHTML(section.title)}</span>
                  <p>${escapeHTML(section.body)}</p>
                </article>
              `).join("")}
            </div>
          </section>

          <section class="tm-contact-links">
            <article>
              <span>Email</span>
              <a href="mailto:teomarchi@teomarchi.com">teomarchi@teomarchi.com</a>
            </article>
            <article>
              <span>Instagram</span>
              <a href="https://instagram.com/teomarchi.co" target="_blank" rel="noopener">@teomarchi.co</a>
            </article>
            <article>
              <span>LinkedIn</span>
              <p>En attente de création</p>
            </article>
            <article>
              <span>Site officiel</span>
              <a href="https://teomarchi.com" target="_blank" rel="noopener">teomarchi.com</a>
            </article>
          </section>
        </div>
      `;
    }

    function injectAICSS () {
      if (document.getElementById("tm-ai-css")) return;
      const style = document.createElement("style");
      style.id = "tm-ai-css";
      style.textContent = `
        .tm-ai-panel {
          position: fixed;
          inset: 0;
          z-index: 9990;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity .24s ease, visibility .24s ease;
        }
        .tm-ai-panel.is-open {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }
        .tm-ai-panel__scrim {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,.42);
          backdrop-filter: blur(6px);
        }
        .tm-ai-panel__sheet {
          position: absolute;
          top: 0;
          right: 0;
          width: min(440px, calc(100vw - 1rem));
          height: 100dvh;
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: 0;
          background: color-mix(in srgb, var(--surface) 94%, var(--bg));
          border-left: var(--border-gold);
          box-shadow: -28px 0 80px rgba(0,0,0,.34);
          transform: translateX(105%);
          transition: transform .28s ease;
        }
        .tm-ai-panel.is-open .tm-ai-panel__sheet { transform: translateX(0); }
        .tm-ai-panel__head,
        .tm-ai-panel__form {
          padding: 1rem;
          border-bottom: var(--border);
        }
        .tm-ai-panel__form { border-top: var(--border); border-bottom: 0; }
        .tm-ai-panel__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: .8rem;
        }
        .tm-ai-panel__head h3 {
          margin: .2rem 0 0;
          font-family: var(--serif);
          font-size: clamp(1.45rem, 4vw, 2rem);
          font-weight: 300;
        }
        .tm-ai-panel__messages {
          min-width: 0;
          overflow-y: auto;
          padding: 1rem;
          display: grid;
          align-content: start;
          gap: .8rem;
        }
        .tm-ai-msg {
          border: var(--border);
          border-radius: 16px;
          padding: .85rem;
          background: color-mix(in srgb, var(--surface-2) 80%, transparent);
          color: var(--ink);
        }
        .tm-ai-msg--user {
          margin-left: auto;
          max-width: 88%;
          border-color: rgba(201,169,110,.34);
          background: rgba(201,169,110,.12);
        }
        .tm-ai-msg p { margin: .35rem 0 0; color: var(--muted); }
        .tm-ai-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: .45rem;
          margin-top: .75rem;
        }
        .tm-ai-suggestions button,
        .tm-ai-panel__form button {
          min-height: 40px;
        }
        .tm-ai-panel__form {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: .6rem;
        }
        .tm-ai-panel__form input {
          min-width: 0;
          width: 100%;
          border: var(--border);
          border-radius: 999px;
          background: var(--surface-2);
          color: var(--ink);
          padding: .85rem 1rem;
          outline: none;
        }
        @media (max-width: 720px) {
          .tm-ai-panel__sheet {
            width: 100vw;
            border-left: 0;
          }
          .tm-ai-panel__form {
            grid-template-columns: 1fr;
          }
        }
      `;
      document.head.appendChild(style);
    }

    function renderAIIntro () {
      const messages = $("#tm-ai-messages");
      if (!messages) return;
      messages.innerHTML = `
        <article class="tm-ai-msg">
          <strong>${AI_DEFAULT_NAME}, IA TEOMARCHI</strong>
          <p>
            J’aide sur les matériaux, systèmes constructifs, écologie, organisation de projet,
            références Atlas/Chronos/Panthéon, Outils et Normes. ${AI_LIMIT_MESSAGE}
          </p>
          <p>${AI_PRIVACY_NOTE}</p>
          <div class="tm-ai-suggestions">
            ${AI_QUICK_PROMPTS.map(prompt => `
              <button class="chip" type="button" data-ai-suggestion="${escapeHTML(prompt)}">${escapeHTML(prompt)}</button>
            `).join("")}
          </div>
        </article>
      `;
    }

    function initTeomarchiAI () {
      if (aiBooted) return;
      aiBooted = true;
      injectAICSS();
      if (!$("#teomarchi-ai-panel")) {
        const panel = document.createElement("aside");
        panel.id = "teomarchi-ai-panel";
        panel.className = "tm-ai-panel";
        panel.setAttribute("aria-hidden", "true");
        panel.innerHTML = `
          <div class="tm-ai-panel__scrim" data-ai-close></div>
          <section class="tm-ai-panel__sheet" role="dialog" aria-modal="true" aria-labelledby="tm-ai-title">
            <header class="tm-ai-panel__head">
              <div>
                <p class="landing-kicker">Assistant architectural</p>
                <h3 id="tm-ai-title">${AI_DEFAULT_NAME}</h3>
              </div>
              <button class="icon-btn" type="button" data-ai-close aria-label="Fermer l’IA">×</button>
            </header>
            <div class="tm-ai-panel__messages" id="tm-ai-messages"></div>
            <form class="tm-ai-panel__form" data-ai-form>
              <input id="tm-ai-input" name="message" type="text" maxlength="520"
                     autocomplete="off" placeholder="Question architecture, matière, écologie..." data-ai-input>
              <button class="text-btn text-btn--gold" type="submit" data-ai-submit>Envoyer</button>
            </form>
          </section>
        `;
        document.body.appendChild(panel);
      }
      renderAIIntro();
      $("#ai-panel-btn")?.addEventListener("click", e => {
        e.preventDefault();
        openAIPanel();
      }, { once: false });
    }

    function openAIPanel () {
      initTeomarchiAI();
      const panel = $("#teomarchi-ai-panel");
      if (!panel) return;
      panel.classList.add("is-open");
      panel.removeAttribute("aria-hidden");
      panel.style.display = "block";
      panel.style.position = "fixed";
      panel.style.inset = "0";
      panel.style.width = "100vw";
      panel.style.height = "100vh";
      panel.style.zIndex = "9990";
      panel.style.background = "rgba(0, 0, 0, 0.42)";
      panel.style.opacity = "1";
      panel.style.visibility = "visible";
      panel.style.pointerEvents = "auto";
      const sheet = $(".tm-ai-panel__sheet", panel);
      if (sheet) {
        sheet.style.position = "absolute";
        sheet.style.display = "grid";
        sheet.style.top = "0";
        sheet.style.right = "0";
        sheet.style.width = "440px";
        sheet.style.maxWidth = "calc(100vw - 1rem)";
        sheet.style.height = "100vh";
        sheet.style.background = "var(--surface)";
        sheet.style.transform = "translateX(0)";
      }
      document.body.classList.add("has-open-panel");
      $("#tm-ai-input")?.focus({ preventScroll: true });
    }

    function closeAIPanel () {
      const panel = $("#teomarchi-ai-panel");
      if (!panel) return;
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      panel.style.display = "";
      panel.style.position = "";
      panel.style.inset = "";
      panel.style.width = "";
      panel.style.height = "";
      panel.style.zIndex = "";
      panel.style.background = "";
      panel.style.opacity = "";
      panel.style.visibility = "";
      panel.style.pointerEvents = "";
      const sheet = $(".tm-ai-panel__sheet", panel);
      if (sheet) {
        sheet.style.position = "";
        sheet.style.display = "";
        sheet.style.top = "";
        sheet.style.right = "";
        sheet.style.width = "";
        sheet.style.maxWidth = "";
        sheet.style.height = "";
        sheet.style.background = "";
        sheet.style.transform = "";
      }
      document.body.classList.remove("has-open-panel");
    }

    function sanitizeAIInput (value) {
      return String(value ?? "")
        .replace(/[<>]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 520);
    }

    function guardAIResponseDomain (message) {
      const normalized = normalize(message);
      const suspicious = /(secret|cle privee|cle api|api key|sk_live|sk_test|webhook|whsec|service account|code source|firebase config|token github|prompt injection|ignore previous|system prompt)/i;
      if (suspicious.test(normalized)) {
        return {
          allowed: false,
          eventType: "demande de secrets ou code source / prompt injection",
          severity: "high",
          reply: "Je ne peux pas aider à obtenir des secrets, du code source privé, des clés, des tokens ou contourner les règles de l’assistant."
        };
      }

      const domain = /(architecture|habitat|materiau|matériau|beton|béton|bois|acier|verre|pierre|terre|climat|ecologie|écologie|toiture|isolation|ventilation|inertie|structure|constructif|projet|atelier|plan|norme|pmr|urbanisme|ville|atlas|chronos|pantheon|panthéon|showroom|journalier|fiches|outils|belgique|france|maroc|japon|norvege|norvège|canada|chaud|humide|froid|bas-carbone)/i;
      if (!domain.test(normalized)) {
        return {
          allowed: false,
          eventType: "hors domaine architecture",
          severity: "low",
          reply: "Je reste centrée sur l’architecture, l’habitat, les matériaux, l’écologie, les normes, le projet et la culture constructive."
        };
      }

      return { allowed: true };
    }

    function appendAIMessage (content, type = "assistant") {
      const messages = $("#tm-ai-messages");
      if (!messages) return;
      const item = document.createElement("article");
      item.className = `tm-ai-msg${type === "user" ? " tm-ai-msg--user" : ""}`;
      item.innerHTML = type === "user"
        ? `<strong>Vous</strong><p>${escapeHTML(content)}</p>`
        : `<strong>${AI_DEFAULT_NAME}</strong><p>${escapeHTML(content)}</p>`;
      messages.appendChild(item);
      messages.scrollTop = messages.scrollHeight;
    }

    function getLocalArchitectureAnswer (message) {
      const q = normalize(message);
      if (q.includes("belgique") || q.includes("toiture")) {
        return "Pour la Belgique : privilégier une enveloppe continue, isolation forte, gestion des ponts thermiques, ventilation contrôlée, toiture isolée et ventilée. Les matériaux courants restent brique, bois, isolants biosourcés et réemploi selon contexte.";
      }
      if (q.includes("humide")) {
        return "En climat humide : protéger les parois de l’eau, ventiler correctement, éviter les parois non respirantes mal conçues, travailler les débords, drainage, ventilation et matériaux compatibles avec l’humidité.";
      }
      if (q.includes("inertie")) {
        return "Pour améliorer l’inertie thermique : placer de la masse utile côté intérieur, limiter les surchauffes par protection solaire, ventiler la nuit si le climat le permet et associer matériaux lourds avec isolation continue.";
      }
      if (q.includes("bas-carbone") || q.includes("carbone")) {
        return "Un système bas-carbone commence par sobriété, réemploi, bois/CLT si pertinent, terre crue, isolants biosourcés, préfabrication raisonnée et limitation des portées inutiles.";
      }
      if (q.includes("organiser") || q.includes("projet")) {
        return "Structure le projet en phases : intention, références, contraintes, esquisses, système constructif, calendrier, checklist, rendus et revue. Le module Journalier sert à piloter tâches, deadlines et avancement.";
      }
      if (q.includes("maroc") || q.includes("chaud")) {
        return "Pour climat chaud : inertie thermique, patios, ombre, ventilation naturelle, terre crue ou pierre selon ressources, couleurs claires, protections solaires et limitation des gains directs.";
      }
      return "Je peux orienter la réponse avec Atlas, Chronos, Panthéon, Outils, Normes & Villes et Écologie. Précise le pays, le climat, le matériau ou le type de projet pour obtenir une recommandation plus ciblée.";
    }

    function getAIAdminDiagnostics () {
      const user = window.TEOMARCHI_AUTH_STATE?.user || null;
      const userEmail = String(user?.email || "").toLowerCase();
      if (userEmail === ADMIN_EMAIL) {
        return [
          "Diagnostic admin TEOMARCHI : accès autorisé.",
          `Modules déclarés : ${MODULES.map(m => m.id).join(", ")}.`,
          `Stripe Studio : ${window.TEOMARCHI_CONFIG?.stripe?.paymentLinks?.studio || "manquant"}.`,
          `Stripe Agence : ${window.TEOMARCHI_CONFIG?.stripe?.paymentLinks?.agence || "manquant"}.`,
          "Actions destructives non disponibles depuis cette commande front."
        ].join(" ");
      }
      logSecurityEvent("commande admin refusee", "/teo-admin", "medium");
      return "Commande admin refusée. /teo-admin est réservé à l’admin principal connecté.";
    }

    function logSecurityEvent (eventType, message, severity = "low") {
      try {
        const user = window.TEOMARCHI_AUTH_STATE?.user || null;
        if (!user || typeof getFirestoreDb !== "function") return;
        const db = getFirestoreDb();
        if (!db) return;
        db.collection("securityLogs").add({
          userId: user.uid,
          email: user.email || "",
          eventType,
          message: String(message || "").slice(0, 300),
          severity,
          createdAt: typeof firebase !== "undefined" && firebase.firestore
            ? firebase.firestore.FieldValue.serverTimestamp()
            : new Date().toISOString()
        }).catch(() => {});
      } catch {}
    }

    function handleAIMessage (rawMessage) {
      const message = sanitizeAIInput(rawMessage);
      if (!message) return;
      appendAIMessage(message, "user");

      if (message === "/teo-admin") {
        appendAIMessage(getAIAdminDiagnostics(), "assistant");
        return;
      }

      const guard = guardAIResponseDomain(message);
      if (!guard.allowed) {
        logSecurityEvent(guard.eventType, message, guard.severity);
        appendAIMessage(guard.reply, "assistant");
        return;
      }

      appendAIMessage(getLocalArchitectureAnswer(message), "assistant");
    }

    /* ── Navigation ───────────────────────────────────────────── */
    function resolveHash () {
      const hash = location.hash.replace("#", "").trim();
      return MODULES.some(m => m.id === hash) ? hash : "accueil";
    }

    function navigateTo (moduleId, pushHistory = true) {
      if (!MODULES.some(m => m.id === moduleId)) moduleId = "accueil";
      currentModule = moduleId;

      /* Modules : afficher le courant, masquer les autres */
      $$(".module").forEach(section => {
        section.classList.toggle("is-active", section.dataset.module === moduleId);
      });

      syncTabs(moduleId);
      if (moduleId === "contact") initContactSponsors();

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
          <span>Essayez : Atlas, Chronos, Normes, PMR…</span>
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

        const aiOpen = e.target.closest("[data-ai-open]");
        if (aiOpen) {
          e.preventDefault();
          openAIPanel();
          return;
        }

        const aiClose = e.target.closest("[data-ai-close]");
        if (aiClose) {
          e.preventDefault();
          closeAIPanel();
          return;
        }

        const aiSuggestion = e.target.closest("[data-ai-suggestion]");
        if (aiSuggestion) {
          e.preventDefault();
          const input = $("#tm-ai-input");
          if (input) input.value = aiSuggestion.dataset.aiSuggestion || "";
          handleAIMessage(aiSuggestion.dataset.aiSuggestion || "");
          return;
        }

        const aiSubmit = e.target.closest("[data-ai-submit]");
        if (aiSubmit) {
          e.preventDefault();
          const form = aiSubmit.closest("[data-ai-form]");
          const input = form?.querySelector("[data-ai-input]");
          const value = input?.value || "";
          if (input) input.value = "";
          handleAIMessage(value);
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

      document.addEventListener("submit", e => {
        const form = e.target.closest("[data-ai-form]");
        if (!form) return;
        e.preventDefault();
        const input = form.querySelector("[data-ai-input]");
        const value = input?.value || "";
        if (input) input.value = "";
        handleAIMessage(value);
      });

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
        if (e.key === "Escape") {
          closeLegalSlider();
          closeAIPanel();
        }
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
      run("landing",      initLandingSections);
      run("teomarchiAI",  initTeomarchiAI);
      run("syncSession",  syncSessionBtn);
      run("navigate",     () => navigateTo(resolveHash(), false));
      run("bindEvents",   bindEvents);
      run("cursor",       initCursor);
    }

    window.navigateTo  = navigateTo;
    window.toggleTheme = toggleTheme;
    window.TEOMARCHI_AI = {
      open: openAIPanel,
      close: closeAIPanel,
      ask: handleAIMessage
    };

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
      .tm-journalier-workbench {
        background:
          linear-gradient(90deg, rgba(245,245,241,.025) 1px, transparent 1px),
          linear-gradient(rgba(245,245,241,.02) 1px, transparent 1px);
        background-size: 42px 42px;
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
      .tm-journalier-progress-central {
        padding: .9rem;
        border: .5px solid rgba(201,169,110,.28);
        border-radius: var(--r-md);
        background: rgba(201,169,110,.045);
      }
      .tm-journalier-timeline {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: .42rem;
        margin-top: .85rem;
      }
      .tm-journalier-timeline span {
        height: 3px;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--gold), rgba(245,245,241,.18));
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
      setSaveStatus("Sauvegarde locale effectuée", "local");
      saveJournalierCloud(next);
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
          <p id="journalier-save-status" class="tm-save-status" data-save-state="idle">Mode local prêt — Sauvegarde cloud si Firestore disponible</p>
        </div>
        <div id="journalier-progress" class="tm-journalier-progress-central">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:1rem;margin-bottom:.55rem">
            <span class="tm-journalier-muted">Progression consolidée</span>
            <strong style="font-family:var(--serif);font-size:2.4rem;font-weight:300;line-height:1;color:var(--gold)">${progress}%</strong>
          </div>
          ${_renderProgressTrack(progress, "Progression globale du projet")}
          <div class="tm-journalier-timeline" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
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
      <div class="tm-journalier tm-journalier-workbench tm-shell tm-reveal" aria-label="Centre de gestion Journalier">
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
  ].map(item => ({
    influences: item.tags?.join(" / ") || item.epoque,
    courantsLies: item.epoque,
    mouvement: item.mouvement || item.epoque,
    philosophie: item.philosophie || item.doctrine,
    influence: item.influence || item.tags?.join(" / ") || item.epoque,
    architectesLies: item.architectesLies || item.tags?.join(" / ") || item.epoque,
    ...item
  }));

  const DATA_PANTHEON_EXPANDED = [
    ...DATA_PANTHEON,
    { id: "alberti", nom: "Leon Battista Alberti", pays: "Italie", epoque: "Renaissance", mouvement: "Humanisme", doctrine: "Architecture comme discipline savante", matiereDominante: "Pierre", systemeFavori: "Façade proportionnée", oeuvreRepere: "Santa Maria Novella", apportTechnique: "Relie théorie, proportion et représentation.", philosophie: "La beauté naît de l'ordre mesuré.", influence: "Palladio / Renaissance", architectesLies: "Palladio, Brunelleschi", leconProjet: "Un projet gagne en force quand sa règle est lisible.", tags: ["proportion", "humanisme"] },
    { id: "borromini", nom: "Francesco Borromini", pays: "Italie", epoque: "Baroque", mouvement: "Baroque", doctrine: "Géométrie dynamique", matiereDominante: "Pierre / stuc", systemeFavori: "Plans courbes", oeuvreRepere: "San Carlo alle Quattro Fontane", apportTechnique: "Complexifie la géométrie sans perdre la structure.", philosophie: "L'espace peut être mis en tension.", influence: "Baroque romain", architectesLies: "Bernini, Guarini", leconProjet: "La courbe doit organiser la coupe, pas seulement l'image.", tags: ["baroque", "géométrie"] },
    { id: "william-morris", nom: "William Morris", pays: "Royaume-Uni", epoque: "XIXe siècle", mouvement: "Arts & Crafts", doctrine: "Retour à l'artisanat", matiereDominante: "Bois / brique", systemeFavori: "Maison artisanale", oeuvreRepere: "Red House", apportTechnique: "Réconcilie usage, fabrication et décoration.", philosophie: "La qualité sociale passe par le travail bien fait.", influence: "Arts & Crafts / design moderne", architectesLies: "Voysey, Mackintosh", leconProjet: "Le détail est un acte culturel autant que technique.", tags: ["artisanat", "design"] },
    { id: "horta", nom: "Victor Horta", pays: "Belgique", epoque: "Art nouveau", mouvement: "Art nouveau", doctrine: "Structure ornementale", matiereDominante: "Fer / verre / pierre", systemeFavori: "Escalier, verrière, ossature métallique", oeuvreRepere: "Hôtel Tassel", apportTechnique: "Transforme le métal en langage spatial fluide.", philosophie: "La structure peut devenir mouvement.", influence: "Art nouveau européen", architectesLies: "Guimard, Gaudí", leconProjet: "Un matériau industriel peut produire une architecture organique.", tags: ["fer", "verrière"] },
    { id: "gropius", nom: "Walter Gropius", pays: "Allemagne", epoque: "Modernisme", mouvement: "Bauhaus", doctrine: "Art, industrie et pédagogie", matiereDominante: "Acier / verre", systemeFavori: "Ossature rationnelle", oeuvreRepere: "Bauhaus Dessau", apportTechnique: "Institutionnalise la synthèse design-construction.", philosophie: "Former par le prototype et la production.", influence: "Bauhaus / modernisme", architectesLies: "Mies, Breuer", leconProjet: "L'école peut devenir un système spatial.", tags: ["bauhaus", "verre"] },
    { id: "perriand", nom: "Charlotte Perriand", pays: "France", epoque: "Modernisme", mouvement: "Modernisme social", doctrine: "Habiter par l'équipement", matiereDominante: "Bois / métal", systemeFavori: "Mobilier intégré", oeuvreRepere: "Équipements pour l'habitation", apportTechnique: "Relie corps, mobilier, logement et industrialisation.", philosophie: "Le confort est une précision sociale.", influence: "Design moderne", architectesLies: "Le Corbusier, Jean Prouvé", leconProjet: "Dessiner l'intérieur revient à dessiner l'usage.", tags: ["mobilier", "usage"] },
    { id: "prouve", nom: "Jean Prouvé", pays: "France", epoque: "Modernisme", mouvement: "Industrialisation", doctrine: "Construire comme on fabrique", matiereDominante: "Acier / aluminium", systemeFavori: "Panneaux préfabriqués", oeuvreRepere: "Maison Tropicale", apportTechnique: "Pousse la préfabrication légère et démontable.", philosophie: "La logique d'atelier doit rester visible.", influence: "High-tech / préfabrication", architectesLies: "Perriand, Piano, Rogers", leconProjet: "Une pièce bien pensée contient déjà le chantier.", tags: ["préfabriqué", "métal"] },
    { id: "saarinen", nom: "Eero Saarinen", pays: "Finlande / États-Unis", epoque: "Modernisme", mouvement: "Modernisme expressif", doctrine: "Structure iconique", matiereDominante: "Béton / acier", systemeFavori: "Coques et grandes portées", oeuvreRepere: "TWA Flight Center", apportTechnique: "Donne une dimension expressive aux portées modernes.", philosophie: "La structure peut représenter le mouvement.", influence: "Modernisme américain", architectesLies: "Kahn, Niemeyer", leconProjet: "L'icône reste crédible si sa structure est claire.", tags: ["coque", "portée"] },
    { id: "paul-rudolph", nom: "Paul Rudolph", pays: "États-Unis", epoque: "Brutalisme", mouvement: "Brutalisme", doctrine: "Complexité spatiale béton", matiereDominante: "Béton", systemeFavori: "Coupe épaisse", oeuvreRepere: "Yale Art and Architecture Building", apportTechnique: "Développe une spatialité stratifiée par niveaux.", philosophie: "La coupe est un relief social.", influence: "Brutalisme américain", architectesLies: "Kahn, Le Corbusier", leconProjet: "La complexité doit rester orientable.", tags: ["béton", "coupe"] },
    { id: "sejima", nom: "Kazuyo Sejima", pays: "Japon", epoque: "Contemporain", mouvement: "Minimalisme atmosphérique", doctrine: "Fluidité légère", matiereDominante: "Acier / verre", systemeFavori: "Plans fins et transparence", oeuvreRepere: "Rolex Learning Center", apportTechnique: "Dissout limites et hiérarchies par structure légère.", philosophie: "L'espace peut être continu et non autoritaire.", influence: "SANAA", architectesLies: "Ryue Nishizawa", leconProjet: "La simplicité exige une structure extrêmement maîtrisée.", tags: ["SANAA", "transparence"] },
    { id: "nishizawa", nom: "Ryue Nishizawa", pays: "Japon", epoque: "Contemporain", mouvement: "Minimalisme atmosphérique", doctrine: "Fragmentation douce", matiereDominante: "Acier / verre", systemeFavori: "Petites structures autonomes", oeuvreRepere: "Moriyama House", apportTechnique: "Recompose l'habitat en unités fines et poreuses.", philosophie: "Le vide entre les volumes est un espace habité.", influence: "SANAA", architectesLies: "Kazuyo Sejima", leconProjet: "Fragmenter peut créer plus de relations qu'un bloc unique.", tags: ["SANAA", "porosité"] },
    { id: "zumthor", nom: "Peter Zumthor", pays: "Suisse", epoque: "Contemporain", mouvement: "Phénoménologie", doctrine: "Atmosphère matérielle", matiereDominante: "Pierre / bois / béton", systemeFavori: "Masse précise", oeuvreRepere: "Thermes de Vals", apportTechnique: "Fait du détail matériel une expérience complète.", philosophie: "La matière porte la mémoire du lieu.", influence: "Architecture sensorielle", architectesLies: "Kahn, Aalto", leconProjet: "La précision constructive produit une émotion durable.", tags: ["matière", "atmosphère"] },
    { id: "toyo-ito", nom: "Toyo Ito", pays: "Japon", epoque: "Contemporain", mouvement: "Structure organique numérique", doctrine: "Fluidité structurelle", matiereDominante: "Acier / béton", systemeFavori: "Trames irrégulières", oeuvreRepere: "Médiathèque de Sendai", apportTechnique: "Transforme noyaux et tubes en système spatial.", philosophie: "La structure peut devenir paysage intérieur.", influence: "Architecture japonaise contemporaine", architectesLies: "SANAA, Sou Fujimoto", leconProjet: "Un système porteur peut organiser flux, lumière et programme.", tags: ["tube", "numérique"] },
    { id: "shigeru-ban", nom: "Shigeru Ban", pays: "Japon", epoque: "Contemporain bas-carbone", mouvement: "Humanitaire / papier", doctrine: "Légèreté et urgence", matiereDominante: "Bois / carton", systemeFavori: "Tubes carton, bois, structures démontables", oeuvreRepere: "Centre Pompidou-Metz", apportTechnique: "Légitime des matériaux pauvres et démontables.", philosophie: "La dignité constructive doit être accessible.", influence: "Architecture humanitaire", architectesLies: "Kuma, Kéré", leconProjet: "La sobriété matérielle peut être très technique.", tags: ["carton", "démontable"] },
    { id: "herzog-de-meuron", nom: "Herzog & de Meuron", pays: "Suisse", epoque: "Contemporain", mouvement: "Matérialité critique", doctrine: "Surface, matière, perception", matiereDominante: "Béton / brique / verre", systemeFavori: "Enveloppe expressive", oeuvreRepere: "Tate Modern", apportTechnique: "Transforme la peau du bâtiment en système culturel.", philosophie: "L'enveloppe peut porter mémoire et programme.", influence: "Architecture suisse contemporaine", architectesLies: "Zumthor, Koolhaas", leconProjet: "Une façade forte doit aussi résoudre climat et structure.", tags: ["enveloppe", "matière"] },
    { id: "sanaa", nom: "SANAA", pays: "Japon", epoque: "Contemporain", mouvement: "Minimalisme atmosphérique", doctrine: "Transparence sociale", matiereDominante: "Acier / verre", systemeFavori: "Plateaux fluides", oeuvreRepere: "Rolex Learning Center", apportTechnique: "Organise le programme par continuité et douceur.", philosophie: "L'espace collectif peut devenir paysage.", influence: "Sejima / Nishizawa", architectesLies: "Kazuyo Sejima, Ryue Nishizawa", leconProjet: "La fluidité se construit par une grande rigueur géométrique.", tags: ["collectif", "fluidité"] },
    { id: "doshi", nom: "Balkrishna Doshi", pays: "Inde", epoque: "Contemporain", mouvement: "Modernisme tropical", doctrine: "Climat social", matiereDominante: "Béton / brique", systemeFavori: "Voûtes, cours, ombre", oeuvreRepere: "Aranya Housing", apportTechnique: "Adapte modernisme, climat et ville informelle.", philosophie: "L'architecture doit accompagner les modes de vie.", influence: "Le Corbusier / Inde", architectesLies: "Le Corbusier, Kahn", leconProjet: "Le logement gagne quand il accepte l'appropriation.", tags: ["Inde", "social"] },
    { id: "hassan-fathy", nom: "Hassan Fathy", pays: "Égypte", epoque: "Modernisme régional", mouvement: "Vernaculaire moderne", doctrine: "Terre, climat et communauté", matiereDominante: "Terre crue", systemeFavori: "Voûte nubienne", oeuvreRepere: "New Gourna", apportTechnique: "Réhabilite les savoir-faire de terre crue.", philosophie: "La modernité peut venir du local.", influence: "Architecture bioclimatique", architectesLies: "Kéré, Doshi", leconProjet: "Un système local doit être socialement transmissible.", tags: ["terre", "voûte"] },
    { id: "glenn-murcutt", nom: "Glenn Murcutt", pays: "Australie", epoque: "Contemporain", mouvement: "Régionalisme climatique", doctrine: "Toucher légèrement la terre", matiereDominante: "Acier / tôle / bois", systemeFavori: "Maison légère ventilée", oeuvreRepere: "Marika-Alderton House", apportTechnique: "Développe une architecture fine adaptée au climat.", philosophie: "Suivre le vent, le soleil et l'eau.", influence: "Architecture bioclimatique", architectesLies: "Aalto, Kéré", leconProjet: "La légèreté doit répondre précisément au climat.", tags: ["Australie", "ventilation"] }
  ].map(item => ({
    influences: item.influences || item.influence || item.tags?.join(" / ") || item.epoque,
    courantsLies: item.courantsLies || item.mouvement || item.epoque,
    ...item
  }));

  /* ── DATA_ATLAS — géographie des systèmes constructifs ─────── */
  const ATLAS_CONTINENTS = {
    "sahara-terre": "Afrique",
    "japon-bois": "Asie",
    "rome-beton": "Europe",
    "gothique-france": "Europe",
    "mediterranee-pierre": "Europe / Afrique",
    "alpes-mixte": "Europe",
    "scandinavie-massif": "Europe",
    "bresil-modernisme": "Amérique du Sud",
    "high-tech-europe": "Europe",
    "bambou-tropical": "Asie / Amérique du Sud",
    "clt-bas-carbone": "Europe",
    "terre-contemporaine": "Europe / Afrique"
  };

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
  ].map(item => ({
    ...item,
    continent: ATLAS_CONTINENTS[item.id] || "Monde",
    lieu: item.ville,
    region: item.ville,
    materiauDominant: item.matiere,
    typeHabitat: item.typeHabitat || "Habitat et équipement",
    contraintePrincipale: item.technique,
    ventilation: item.ventilation || "À calibrer selon climat local",
    isolation: item.isolation || "À adapter à l'enveloppe",
    risqueNaturel: item.risqueNaturel || "Variable",
    leconArchitecturale: item.lecon
  }));

  const DATA_ATLAS_EXPANDED = [
    ...DATA_ATLAS,
    { id: "belgique-brique", titre: "Belgique — brique isolée", pays: "Belgique", region: "Bruxelles / Flandre / Wallonie", continent: "Europe", climat: "Océanique humide", periode: "Contemporain", materiauDominant: "Brique / isolation", systemeConstructif: "Maçonnerie porteuse ou parement + structure isolée", typeHabitat: "Maison mitoyenne / logement collectif", contraintePrincipale: "Humidité, ponts thermiques, mitoyenneté", inertie: "Moyenne à forte", portee: "Moyenne", ventilation: "Ventilation contrôlée et extraction humide", isolation: "Forte isolation continue", risqueNaturel: "Humidité", leconArchitecturale: "Travailler l'enveloppe comme une coupe hygrothermique.", tags: ["brique", "humidité", "isolation"], relatedIds: ["eco-belgique", "pmr"] },
    { id: "france-pierre-beton", titre: "France — pierre, béton et réhabilitation", pays: "France", region: "Paris / Lyon / littoral", continent: "Europe", climat: "Tempéré varié", periode: "Moderne à contemporain", materiauDominant: "Pierre / béton", systemeConstructif: "Mur porteur réhabilité, béton armé, ossature bois en extension", typeHabitat: "Logement collectif / équipement", contraintePrincipale: "Réemploi du bâti et performance carbone", inertie: "Forte", portee: "Moyenne à grande", ventilation: "Naturelle assistée ou double flux", isolation: "ITE ou ITI selon patrimoine", risqueNaturel: "Canicule / retrait argile", leconArchitecturale: "Composer avec l'existant réduit souvent matière et carbone.", tags: ["réhabilitation", "pierre", "béton"], relatedIds: ["eco-france", "chronos-moderne"] },
    { id: "pays-bas-pilotis", titre: "Pays-Bas — sol humide et structures légères", pays: "Pays-Bas", region: "Randstad / polders", continent: "Europe", climat: "Océanique humide", periode: "Contemporain", materiauDominant: "Bois / acier / brique", systemeConstructif: "Fondations profondes, façades légères, toiture compacte", typeHabitat: "Logement dense", contraintePrincipale: "Eau, sol compressible, densité", inertie: "Moyenne", portee: "Moyenne", ventilation: "Contrôlée avec récupération", isolation: "Enveloppe très étanche", risqueNaturel: "Inondation", leconArchitecturale: "Le rapport au sol devient un système technique central.", tags: ["eau", "polder", "fondation"], relatedIds: ["eco-pays-bas"] },
    { id: "suisse-mineral-bois", titre: "Suisse — précision minérale et bois", pays: "Suisse", region: "Plateau suisse / Alpes", continent: "Europe", climat: "Froid à tempéré", periode: "Contemporain", materiauDominant: "Bois / béton / pierre", systemeConstructif: "Hybride béton-bois, enveloppe performante", typeHabitat: "Habitat dense / chalet réinterprété", contraintePrincipale: "Froid, pente, précision constructive", inertie: "Forte", portee: "Moyenne", ventilation: "Contrôlée en hiver", isolation: "Très forte", risqueNaturel: "Neige / pente", leconArchitecturale: "La précision du détail protège matière, énergie et usage.", tags: ["alpin", "bois", "précision"], relatedIds: ["eco-suisse"] },
    { id: "italie-maconnerie", titre: "Italie — maçonnerie, patio et séisme", pays: "Italie", region: "Toscane / Rome / Sicile", continent: "Europe", climat: "Méditerranéen", periode: "Antiquité à contemporain", materiauDominant: "Pierre / brique", systemeConstructif: "Maçonnerie renforcée, voûtes, patios", typeHabitat: "Maison urbaine / palais / logement", contraintePrincipale: "Séisme et chaleur estivale", inertie: "Forte", portee: "Moyenne", ventilation: "Traversante + patios", isolation: "Isolation par l'extérieur si compatible", risqueNaturel: "Séisme", leconArchitecturale: "Renforcer sans effacer la logique porteuse historique.", tags: ["maçonnerie", "séisme", "patio"], relatedIds: ["eco-italie"] },
    { id: "espagne-patio", titre: "Espagne — patio, ombre et céramique", pays: "Espagne", region: "Andalousie / Catalogne", continent: "Europe", climat: "Chaud sec à méditerranéen", periode: "Vernaculaire à contemporain", materiauDominant: "Brique / céramique / béton", systemeConstructif: "Maison patio, murs épais, protections solaires", typeHabitat: "Maison patio / logement collectif", contraintePrincipale: "Surchauffe estivale", inertie: "Forte", portee: "Moyenne", ventilation: "Nocturne + patios", isolation: "Priorité toiture et protections solaires", risqueNaturel: "Canicule", leconArchitecturale: "L'ombre est un matériau de projet.", tags: ["patio", "ombre", "céramique"], relatedIds: ["eco-espagne"] },
    { id: "maroc-terre-patio", titre: "Maroc — terre crue et compacité", pays: "Maroc", region: "Marrakech / Atlas / médinas", continent: "Afrique", climat: "Aride chaud", periode: "Vernaculaire", materiauDominant: "Terre crue", systemeConstructif: "Pisé, adobe, patio, ruelles compactes", typeHabitat: "Riad / ksar", contraintePrincipale: "Chaleur, soleil, poussière", inertie: "Très forte", portee: "Faible à moyenne", ventilation: "Patio + tirage thermique", isolation: "Masse et ombrage plutôt qu'isolant léger", risqueNaturel: "Séisme / chaleur", leconArchitecturale: "La compacité fabrique du confort avant la machine.", tags: ["terre", "patio", "aride"], relatedIds: ["eco-maroc"] },
    { id: "egypte-inertie", titre: "Égypte — masse et ventilation sèche", pays: "Égypte", region: "Le Caire / vallée du Nil", continent: "Afrique", climat: "Désertique", periode: "Antiquité à contemporain", materiauDominant: "Pierre / terre / béton", systemeConstructif: "Murs massifs, moucharabieh, cours ombrées", typeHabitat: "Habitat dense / équipement", contraintePrincipale: "Rayonnement solaire et poussière", inertie: "Très forte", portee: "Moyenne", ventilation: "Ventilation haute et protections filtrantes", isolation: "Toitures protégées", risqueNaturel: "Chaleur extrême", leconArchitecturale: "Filtrer lumière et air peut structurer toute la façade.", tags: ["inertie", "ombre", "désert"], relatedIds: ["eco-egypte"] },
    { id: "chine-cour-trame", titre: "Chine — cour, trame et densité", pays: "Chine", region: "Pékin / Shanghai / provinces", continent: "Asie", climat: "Continental à subtropical", periode: "Impérial à contemporain", materiauDominant: "Bois / brique / béton", systemeConstructif: "Cour intérieure, trame bois, béton dense", typeHabitat: "Cour urbaine / tour", contraintePrincipale: "Densité, pollution, amplitudes thermiques", inertie: "Moyenne à forte", portee: "Moyenne à grande", ventilation: "Cour + filtration selon contexte", isolation: "Variable selon zone climatique", risqueNaturel: "Séisme / pollution", leconArchitecturale: "La cour reste un outil climatique même en densité.", tags: ["cour", "trame", "densité"], relatedIds: ["eco-chine"] },
    { id: "inde-jali", titre: "Inde — jali, veranda et mousson", pays: "Inde", region: "Ahmedabad / Kerala / Delhi", continent: "Asie", climat: "Tropical à chaud humide", periode: "Vernaculaire à moderne", materiauDominant: "Brique / pierre / béton", systemeConstructif: "Brise-soleil, jali, vérandas, toiture ventilée", typeHabitat: "Maison / institution", contraintePrincipale: "Mousson, chaleur, ventilation", inertie: "Forte", portee: "Moyenne", ventilation: "Traversante + ombrage profond", isolation: "Toiture ventilée prioritaire", risqueNaturel: "Mousson / chaleur", leconArchitecturale: "La façade peut être un filtre climatique habité.", tags: ["jali", "mousson", "ventilation"], relatedIds: ["eco-inde"] },
    { id: "mexique-patio-masse", titre: "Mexique — patio minéral et séisme", pays: "Mexique", region: "Mexico / Oaxaca", continent: "Amérique du Nord", climat: "Altitude tempérée à chaud sec", periode: "Vernaculaire à contemporain", materiauDominant: "Pierre / béton / adobe", systemeConstructif: "Cour, murs massifs, béton parasismique", typeHabitat: "Maison patio / équipement", contraintePrincipale: "Séisme et amplitude thermique", inertie: "Forte", portee: "Moyenne", ventilation: "Patio + ventilation nocturne", isolation: "Masse + protections solaires", risqueNaturel: "Séisme", leconArchitecturale: "L'épaisseur peut protéger du climat et stabiliser l'espace.", tags: ["patio", "séisme", "masse"], relatedIds: ["eco-mexique"] },
    { id: "usa-light-frame", titre: "États-Unis — light frame et grands climats", pays: "États-Unis", region: "Nord-Est / Californie / Sud", continent: "Amérique du Nord", climat: "Très varié", periode: "Moderne à contemporain", materiauDominant: "Bois / acier / béton", systemeConstructif: "Light frame, noyaux béton, enveloppe industrialisée", typeHabitat: "Maison individuelle / immeuble", contraintePrincipale: "Cyclone, feu, séisme selon région", inertie: "Faible à moyenne", portee: "Moyenne à grande", ventilation: "Mécanique selon climat", isolation: "Variable, souvent forte en climat froid", risqueNaturel: "Feu / cyclone / séisme", leconArchitecturale: "Un même pays impose plusieurs architectures climatiques.", tags: ["light-frame", "risques", "industrialisation"], relatedIds: ["eco-etats-unis"] },
    { id: "canada-envelope", titre: "Canada — enveloppe froide et bois", pays: "Canada", region: "Québec / Ontario / Colombie-Britannique", continent: "Amérique du Nord", climat: "Froid continental", periode: "Contemporain", materiauDominant: "Bois / béton", systemeConstructif: "Ossature bois, CLT, enveloppe très isolée", typeHabitat: "Maison / logement collectif", contraintePrincipale: "Froid long, condensation, neige", inertie: "Moyenne", portee: "Moyenne", ventilation: "Double flux ou ventilation contrôlée", isolation: "Très forte + pare-vapeur maîtrisé", risqueNaturel: "Neige / gel", leconArchitecturale: "L'étanchéité à l'air est une question de dessin.", tags: ["froid", "bois", "enveloppe"], relatedIds: ["eco-canada"] },
    { id: "allemagne-passivhaus", titre: "Allemagne — Passivhaus et préfabrication", pays: "Allemagne", region: "Freiburg / Berlin", continent: "Europe", climat: "Tempéré froid", periode: "Contemporain", materiauDominant: "Bois / brique / béton", systemeConstructif: "Enveloppe passive, préfabrication, solaire maîtrisé", typeHabitat: "Logement collectif / équipement", contraintePrincipale: "Performance énergétique et précision", inertie: "Moyenne à forte", portee: "Moyenne", ventilation: "Double flux haute efficacité", isolation: "Très forte", risqueNaturel: "Canicule croissante", leconArchitecturale: "Mesurer l'énergie transforme l'organisation du détail.", tags: ["passif", "préfabrication", "énergie"], relatedIds: ["eco-allemagne"] },
    { id: "royaume-uni-brique", titre: "Royaume-Uni — terrasse brique et humidité", pays: "Royaume-Uni", region: "Londres / Manchester", continent: "Europe", climat: "Océanique humide", periode: "Industriel à contemporain", materiauDominant: "Brique / acier", systemeConstructif: "Terraced house, rénovation, structure acier en extension", typeHabitat: "Maison mitoyenne / équipement", contraintePrincipale: "Humidité, patrimoine, densification", inertie: "Moyenne", portee: "Moyenne", ventilation: "Naturelle assistée", isolation: "Réhabilitation fine des parois", risqueNaturel: "Humidité / inondation", leconArchitecturale: "La répétition typologique peut devenir support d'adaptation.", tags: ["brique", "mitoyen", "réhabilitation"], relatedIds: ["eco-royaume-uni"] },
    { id: "grece-blanc-ombre", titre: "Grèce — masse blanche et ventilation", pays: "Grèce", region: "Cyclades / Athènes", continent: "Europe", climat: "Méditerranéen chaud", periode: "Vernaculaire", materiauDominant: "Pierre / chaux", systemeConstructif: "Maison compacte, enduit clair, toiture plate", typeHabitat: "Maison insulaire", contraintePrincipale: "Soleil, vent, rareté de l'eau", inertie: "Forte", portee: "Faible", ventilation: "Traversante par petites ouvertures", isolation: "Masse + réflexion solaire", risqueNaturel: "Séisme / chaleur", leconArchitecturale: "Réduire l'ouverture peut améliorer le confort d'été.", tags: ["blanc", "insulaire", "ombre"], relatedIds: ["eco-grece"] },
    { id: "turquie-seisme", titre: "Turquie — trame parasismique", pays: "Turquie", region: "Istanbul / Anatolie", continent: "Europe / Asie", climat: "Méditerranéen à continental", periode: "Ottoman à contemporain", materiauDominant: "Bois / pierre / béton", systemeConstructif: "Ossature bois historique, béton armé parasismique", typeHabitat: "Maison urbaine / immeuble", contraintePrincipale: "Séisme et densité", inertie: "Moyenne", portee: "Moyenne", ventilation: "Traversante selon trame", isolation: "Variable selon région", risqueNaturel: "Séisme", leconArchitecturale: "La ductilité doit guider structure et façade.", tags: ["séisme", "ossature", "trame"], relatedIds: ["eco-turquie"] },
    { id: "kenya-climat-social", titre: "Kenya — ventilation et ressources locales", pays: "Kenya", region: "Nairobi / Mombasa", continent: "Afrique", climat: "Tropical d'altitude à humide", periode: "Contemporain", materiauDominant: "Terre / pierre / métal", systemeConstructif: "Double toiture, murs ventilés, matériaux locaux", typeHabitat: "École / habitat communautaire", contraintePrincipale: "Chaleur, coût, maintenance", inertie: "Moyenne à forte", portee: "Faible à moyenne", ventilation: "Naturelle permanente", isolation: "Toiture protégée", risqueNaturel: "Chaleur / pluies intenses", leconArchitecturale: "La simplicité climatique améliore aussi l'économie du projet.", tags: ["local", "ventilation", "école"], relatedIds: ["eco-kenya"] },
    { id: "afrique-du-sud-hybride", titre: "Afrique du Sud — climat sec et hybridation", pays: "Afrique du Sud", region: "Le Cap / Johannesburg", continent: "Afrique", climat: "Méditerranéen à semi-aride", periode: "Contemporain", materiauDominant: "Brique / béton / acier", systemeConstructif: "Maçonnerie, protections solaires, structure mixte", typeHabitat: "Maison / équipement", contraintePrincipale: "Soleil, eau, sécurité, vent", inertie: "Forte", portee: "Moyenne", ventilation: "Traversante protégée", isolation: "Toitures et parois exposées", risqueNaturel: "Sécheresse / feu", leconArchitecturale: "L'eau et l'ombre doivent être intégrées au plan.", tags: ["sécheresse", "ombre", "hybride"], relatedIds: ["eco-afrique-du-sud"] },
    { id: "australie-bushfire", titre: "Australie — légèreté, ombre et feu", pays: "Australie", region: "Sydney / Melbourne / zones rurales", continent: "Océanie", climat: "Chaud sec à tempéré", periode: "Contemporain", materiauDominant: "Bois / acier / terre", systemeConstructif: "Maison ventilée, véranda, protections feu", typeHabitat: "Maison individuelle", contraintePrincipale: "Surchauffe, feu, sécheresse", inertie: "Faible à moyenne", portee: "Moyenne", ventilation: "Traversante + surtoiture", isolation: "Toiture et ombrage prioritaires", risqueNaturel: "Feu / chaleur", leconArchitecturale: "La protection incendie devient une stratégie spatiale.", tags: ["feu", "véranda", "ombre"], relatedIds: ["eco-australie"] }
  ].map(item => ({
    ...item,
    ville: item.ville || item.region,
    lieu: item.lieu || item.region,
    matiere: item.matiere || item.materiauDominant,
    technique: item.technique || item.contraintePrincipale,
    lecon: item.lecon || item.leconArchitecturale
  }));

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
        grid-template-columns:repeat(auto-fit,minmax(178px,1fr));
        gap:.72rem;
        align-items:start;
      }
      .tm-tech-search { grid-column:span 2; }
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
      .tm-tech-filter-group { display:grid; gap:.42rem; min-width:0; }
      .tm-tech-chip-row {
        display:flex;
        flex-wrap:wrap;
        gap:.3rem;
        min-width:0;
      }
      .tm-tech-chip {
        appearance:none;
        border:var(--border);
        border-radius:var(--r-pill);
        background:rgba(245,245,241,.035);
        color:var(--muted);
        cursor:pointer;
        font-size:.55rem;
        letter-spacing:.08em;
        min-height:24px;
        padding:.15rem .5rem;
        text-transform:uppercase;
        transition:border-color .18s ease, color .18s ease, background .18s ease;
      }
      .tm-tech-chip:hover,
      .tm-tech-chip.is-active {
        border-color:rgba(201,169,110,.42);
        background:var(--gold-glow);
        color:var(--gold);
      }
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
      .tm-tech-detail {
        max-height:calc(100vh - 112px);
        overflow:auto;
      }
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
        .tm-tech-search { grid-column:auto; }
        .tm-tech-detail { position:static; }
      }
    `;
    document.head.appendChild(s);
  })();

  /* ── Renderer générique léger pour modules techniques ───────── */
  const _techState = {};

  function normalizeSearch(value) {
    return String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function normalizeText(value) {
    return normalizeSearch(value);
  }

  function filterBySearch(data, query, keys = []) {
    const needle = normalizeText(query);
    if (!needle) return data;
    return data.filter(item => {
      const haystack = keys.length
        ? keys.map(key => item[key]).flat().join(" ")
        : Object.values(item).flat().join(" ");
      return normalizeText(haystack).includes(needle);
    });
  }

  function renderEmptyState(title = "Aucun résultat", text = "Ajustez la recherche ou les filtres.") {
    return `
      <div class="tm-tech-empty">
        <strong>${_esc(title)}</strong>
        <p>${_esc(text)}</p>
      </div>
    `;
  }

  function renderTagList(tags = [], className = "tm-tech-badges") {
    const list = Array.isArray(tags) ? tags : String(tags || "").split(",").map(tag => tag.trim()).filter(Boolean);
    if (!list.length) return "";
    return `<div class="${_esc(className)}">${list.slice(0, 8).map(tag => `<span>${_esc(tag)}</span>`).join("")}</div>`;
  }

  function getUniqueValues(data, key) {
    return [...new Set((data || []).map(item => item?.[key]).filter(Boolean))]
      .sort((a, b) => String(a).localeCompare(String(b), "fr"));
  }

  const _techNorm = normalizeSearch;

  const _uniqueValues = (data, key) =>
    getUniqueValues(data, key);

  const _techItemText = item =>
    _techNorm(Object.values(item).flat().join(" "));

  const _techDetailRows = (item, fields) => fields.map(field => `
    <div class="tm-tech-row">
      <span>${_esc(field.label)}</span>
      <strong>${_esc(item[field.key] || "—")}</strong>
    </div>
  `).join("");

  function renderFilterChips(data, filters, state, moduleId) {
    if (!Array.isArray(filters) || !filters.length) return "";

    return filters.map(filter => {
      const values = _uniqueValues(data, filter.key);
      return `
        <div class="tm-tech-filter-group" data-tech-filter-group="${_esc(filter.key)}">
          <label class="field tm-tech-filter">
            <span>${_esc(filter.label)}</span>
            <select data-tech-filter="${_esc(filter.key)}">
              <option value="">Tous</option>
              ${values.map(value => `
                <option value="${_esc(value)}" ${state.filters?.[filter.key] === value ? "selected" : ""}>
                  ${_esc(value)}
                </option>
              `).join("")}
            </select>
          </label>
          <div class="tm-tech-chip-row" aria-label="${_esc(filter.label)} ${_esc(moduleId)}">
            ${values.slice(0, 5).map(value => `
              <button type="button"
                      class="tm-tech-chip ${state.filters?.[filter.key] === value ? "is-active" : ""}"
                      data-tech-chip
                      data-tech-filter="${_esc(filter.key)}"
                      data-tech-value="${_esc(value)}">
                ${_esc(value)}
              </button>
            `).join("")}
          </div>
        </div>
      `;
    }).join("");
  }

  function renderDetailPanel(selected, options, fields, titleKey) {
    const detailClass = ["tm-tech-detail", options.detailClass || `tm-${options.id}-detail`]
      .filter(Boolean)
      .join(" ");

    return `
      <aside class="${_esc(detailClass)}" data-tech-detail>
        ${selected ? `
          <p class="tm-tech-kicker">${_esc(options.detailKicker(selected))}</p>
          <h3>${_esc(selected[titleKey])}</h3>
          <div class="tm-tech-rows">${_techDetailRows(selected, fields)}</div>
          ${(selected.influences || selected.courantsLies) ? `
            <div class="tm-tech-rows">
              ${selected.influences ? `
                <div class="tm-tech-row">
                  <span>Influences</span>
                  <strong>${_esc(selected.influences)}</strong>
                </div>
              ` : ""}
              ${selected.courantsLies ? `
                <div class="tm-tech-row">
                  <span>Courants liés</span>
                  <strong>${_esc(selected.courantsLies)}</strong>
                </div>
              ` : ""}
            </div>
          ` : ""}
          <p class="tm-tech-lesson">${_esc(options.lesson(selected))}</p>
        ` : `
          <div class="tm-tech-empty">
            <strong>${_esc(options.emptyTitle || "Aucune donnée")}</strong>
            <p>${_esc(options.emptyText || "Ce module ne contient pas encore d'entrée.")}</p>
          </div>
        `}
      </aside>
    `;
  }

  function restoreTechnicalSearchFocus(container, focusState) {
    if (!container || !focusState?.active) return;
    const input = container.querySelector("[data-tech-search]");
    if (!input) return;

    input.focus({ preventScroll: true });
    const cursor = Math.min(focusState.cursor ?? input.value.length, input.value.length);
    if (typeof input.setSelectionRange === "function") {
      input.setSelectionRange(cursor, cursor);
    }
  }

  function renderTechnicalCards(container, data, options) {
    if (!container) return;

    const id = options.id;
    const state = _techState[id] ||= { query: "", filters: {}, selectedId: data[0]?.id || null, compare: [] };
    state.filters ||= {};
    state.compare ||= [];
    state.query ||= "";

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
      state.selectedId = filtered[0]?.id || null;
    }
    const selected = filtered.find(item => item.id === state.selectedId) || filtered[0] || null;

    const compareItems = (state.compare || [])
      .map(itemId => data.find(item => item.id === itemId))
      .filter(Boolean);

    const visualContext = { data, filtered, selected, state, options };
    const listClass = ["tm-tech-grid", options.listClass || ""].filter(Boolean).join(" ");
    const activeSearch = container.contains(document.activeElement)
      && document.activeElement.matches("[data-tech-search]");
    const focusState = {
      active: activeSearch,
      cursor: activeSearch ? document.activeElement.selectionStart : state.query.length
    };

    container.dataset.techModule = id;
    container.innerHTML = `
      <div class="tm-tech tm-tech--${_esc(id)} tm-${_esc(id)} tm-shell tm-reveal" data-tech-shell="${_esc(id)}">
        ${options.visualIntro ? options.visualIntro(visualContext) : ""}
        <div class="tm-tech-controls ${_esc(options.controlsClass || "")}">
          <label class="field tm-tech-search">
            <input type="search" data-tech-search placeholder="${_esc(options.searchPlaceholder || "Rechercher...")}"
                   value="${_esc(state.query)}" autocomplete="off" />
          </label>
          ${renderFilterChips(data, filters, state, id)}
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
          <div class="${_esc(listClass)}">
            ${filtered.length ? filtered.map((item, i) => {
              const active = item.id === selected?.id;
              const compared = state.compare?.includes(item.id);
              const cardClass = [
                "tm-tech-card",
                active ? "is-active" : "",
                options.cardClass || "",
                options.id === "chronos" ? "tm-chronos-period-card" : "",
                options.id === "pantheon" ? "tm-pantheon-figure-card" : "",
                options.id === "atlas" ? "tm-atlas-system-card" : ""
              ].filter(Boolean).join(" ");

              if (options.layout === "timeline") {
                return `
                  <article class="${_esc(cardClass)}"
                           data-tech-card="${_esc(item.id)}"
                           data-chronos-period="${_esc(item.id)}"
                           tabindex="0">
                    <div class="tm-chronos-marker">
                      <span>${_esc(item.dates || "")}</span>
                    </div>
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
              }

              return `
                <article class="${_esc(cardClass)}"
                         data-tech-card="${_esc(item.id)}"
                         ${options.id === "pantheon" ? `data-pantheon-figure="${_esc(item.id)}"` : ""}
                         ${options.id === "atlas" ? `data-atlas-system="${_esc(item.id)}"` : ""}
                         tabindex="0">
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
                <strong>${_esc(options.emptyTitle || "Aucun résultat")}</strong>
                <p>${_esc(options.emptyText || "Modifiez la recherche ou les filtres.")}</p>
              </div>
            `}
          </div>

          ${renderDetailPanel(selected, options, fields, titleKey)}
        </div>
      </div>
    `;
    restoreTechnicalSearchFocus(container, focusState);
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
      const chip = e.target.closest("[data-tech-chip]");
      if (chip) {
        const state = _techState[options.id] ||= { filters: {}, compare: [] };
        state.filters ||= {};
        const key = chip.dataset.techFilter;
        const value = chip.dataset.techValue || "";
        if (key) state.filters[key] = state.filters[key] === value ? "" : value;
        renderTechnicalCards(root, data, options);
        return;
      }

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

  const ETUDES_PAGE_SIZE = 6;
  const CITY_PAGE_SIZE = 9;

  const DATA_ETUDES_ECOLES = [
    { id: "ulb-lacambre-horta", nom: "ULB — Faculté d'Architecture La Cambre Horta", ville: "Bruxelles", pays: "Belgique", type: "université", filieresProposees: ["Architecture", "Patrimoine / restauration", "Architecture durable / écoconstruction"], officialUrl: "https://archi.ulb.be", description: "Formation universitaire en architecture. Certaines informations pédagogiques restent à vérifier selon l'année académique." },
    { id: "uclouvain-loci", nom: "UCLouvain — LOCI", ville: "Louvain-la-Neuve", pays: "Belgique", type: "université", filieresProposees: ["Architecture", "Urbanisme", "Architecture durable / écoconstruction"], officialUrl: "https://uclouvain.be/fr/facultes/loci", description: "Faculté d'architecture, d'ingénierie architecturale et d'urbanisme. Données de parcours à vérifier." },
    { id: "uliege-archi", nom: "Université de Liège — Faculté d'Architecture", ville: "Liège", pays: "Belgique", type: "université", filieresProposees: ["Architecture", "Urbanisme", "BIM / modélisation"], officialUrl: "https://www.archi.uliege.be", description: "Formation universitaire en architecture et culture constructive. Détails de programme à vérifier." },
    { id: "umons-fau", nom: "UMONS — Faculté d'Architecture et d'Urbanisme", ville: "Mons", pays: "Belgique", type: "université", filieresProposees: ["Architecture", "Urbanisme", "Patrimoine / restauration"], officialUrl: "https://web.umons.ac.be/fau/", description: "Parcours architecture et urbanisme avec ancrage territorial. Informations à vérifier." },
    { id: "saint-luc-bruxelles", nom: "ESA Saint-Luc Bruxelles", ville: "Bruxelles", pays: "Belgique", type: "supérieur artistique", filieresProposees: ["Architecture d’intérieur", "Design d’espace", "Scénographie", "Design mobilier"], officialUrl: "https://www.stluc-bruxelles-esa.be/", description: "École supérieure artistique orientée espace, objet et image. Parcours à vérifier." },
    { id: "saint-luc-liege", nom: "ESA Saint-Luc Liège", ville: "Liège", pays: "Belgique", type: "supérieur artistique", filieresProposees: ["Architecture d’intérieur", "Design d’espace", "Scénographie"], officialUrl: "https://www.saint-luc.be/", description: "École artistique proposant des formations liées à l'espace et au design. Données à vérifier." },
    { id: "luca-gand", nom: "LUCA School of Arts", ville: "Gand", pays: "Belgique", type: "supérieur artistique", filieresProposees: ["Architecture d’intérieur", "Design mobilier", "Design d’espace"], officialUrl: "https://www.luca-arts.be/", description: "École d'art et de design. Vérifier campus et intitulés précis." },
    { id: "uantwerpen-design", nom: "University of Antwerp — Design Sciences", ville: "Anvers", pays: "Belgique", type: "université", filieresProposees: ["Architecture d’intérieur", "Patrimoine / restauration", "Design d’espace"], officialUrl: "https://www.uantwerpen.be/en/about-uantwerp/faculties/faculty-design-sciences/", description: "Faculté liée aux sciences du design. Détails de filières à vérifier." },
    { id: "kuleuven-architecture", nom: "KU Leuven — Faculty of Architecture", ville: "Gand", pays: "Belgique", type: "université", filieresProposees: ["Architecture", "Urbanisme", "BIM / modélisation"], officialUrl: "https://www.kuleuven.be/faculteitarchitectuur", description: "Faculté d'architecture implantée notamment à Bruxelles et Gand. Données à vérifier." },
    { id: "esa-tournai", nom: "ESA Saint-Luc Tournai", ville: "Tournai", pays: "Belgique", type: "supérieur artistique", filieresProposees: ["Architecture d’intérieur", "Design d’espace", "Scénographie"], officialUrl: "https://www.stluc-tournai.be/", description: "École supérieure artistique. Intitulés exacts à vérifier avant candidature." },
    { id: "ensaplv", nom: "ENSA Paris-La Villette", ville: "Paris", pays: "France", type: "public", filieresProposees: ["Architecture", "Urbanisme", "BIM / modélisation"], officialUrl: "https://www.paris-lavillette.archi.fr/", description: "École nationale supérieure d'architecture. Parcours et admissions à vérifier." },
    { id: "ensapb", nom: "ENSA Paris-Belleville", ville: "Paris", pays: "France", type: "public", filieresProposees: ["Architecture", "Patrimoine / restauration", "Architecture durable / écoconstruction"], officialUrl: "https://www.paris-belleville.archi.fr/", description: "École nationale supérieure d'architecture. Détails pédagogiques à vérifier." },
    { id: "ensa-lyon", nom: "ENSA Lyon", ville: "Lyon", pays: "France", type: "public", filieresProposees: ["Architecture", "Architecture durable / écoconstruction", "Ingénierie construction"], officialUrl: "https://www.lyon.archi.fr/", description: "École nationale supérieure d'architecture. Parcours à vérifier." },
    { id: "ensa-marseille", nom: "ENSA Marseille", ville: "Marseille", pays: "France", type: "public", filieresProposees: ["Architecture", "Urbanisme", "Paysage"], officialUrl: "https://www.marseille.archi.fr/", description: "École nationale supérieure d'architecture, contexte méditerranéen. Données à vérifier." },
    { id: "ensa-nantes", nom: "ENSA Nantes", ville: "Nantes", pays: "France", type: "public", filieresProposees: ["Architecture", "Scénographie", "BIM / modélisation"], officialUrl: "https://www.nantes.archi.fr/", description: "École nationale supérieure d'architecture. Ateliers et formations à vérifier." },
    { id: "ensap-lille", nom: "ENSAP Lille", ville: "Lille", pays: "France", type: "public", filieresProposees: ["Architecture", "Paysage", "Urbanisme"], officialUrl: "https://www.lille.archi.fr/", description: "École nationale supérieure d'architecture et de paysage. Données à vérifier." },
    { id: "ensap-bordeaux", nom: "ENSAP Bordeaux", ville: "Bordeaux", pays: "France", type: "public", filieresProposees: ["Architecture", "Paysage", "Architecture durable / écoconstruction"], officialUrl: "https://www.bordeaux.archi.fr/", description: "École nationale supérieure d'architecture et de paysage. Informations à vérifier." },
    { id: "ensa-strasbourg", nom: "ENSA Strasbourg", ville: "Strasbourg", pays: "France", type: "public", filieresProposees: ["Architecture", "Ingénierie construction", "BIM / modélisation"], officialUrl: "https://www.strasbourg.archi.fr/", description: "École nationale supérieure d'architecture. Certains doubles parcours sont à vérifier." },
    { id: "ensa-grenoble", nom: "ENSA Grenoble", ville: "Grenoble", pays: "France", type: "public", filieresProposees: ["Architecture", "Architecture durable / écoconstruction", "Ingénierie construction"], officialUrl: "https://www.grenoble.archi.fr/", description: "École nationale supérieure d'architecture, culture montagne et environnement. À vérifier." },
    { id: "ensa-toulouse", nom: "ENSA Toulouse", ville: "Toulouse", pays: "France", type: "public", filieresProposees: ["Architecture", "Urbanisme", "Patrimoine / restauration"], officialUrl: "https://www.toulouse.archi.fr/", description: "École nationale supérieure d'architecture. Données à vérifier." },
    { id: "ensa-montpellier", nom: "ENSA Montpellier", ville: "Montpellier", pays: "France", type: "public", filieresProposees: ["Architecture", "Architecture durable / écoconstruction", "Patrimoine / restauration"], officialUrl: "https://www.montpellier.archi.fr/", description: "École nationale supérieure d'architecture. Parcours et admissions à vérifier." }
  ].map(school => ({
    statut: "à vérifier",
    filieres: school.filieresProposees,
    lienOfficiel: school.officialUrl,
    courteDescription: school.description,
    ...school
  }));

  const DATA_ETUDES_FILIERES = [
    { id: "architecture", nom: "Architecture", description: "Formation centrale pour concevoir bâtiments, espaces publics, détails constructifs et stratégies territoriales.", dureeMoyenne: "5 ans en Belgique ou France, hors spécialisations", diplomeVise: "Master / diplôme d'État selon pays, à vérifier", competences: ["projet", "représentation", "construction", "histoire", "urbanisme"], logicielsUtiles: ["AutoCAD", "Revit", "Rhino", "SketchUp", "Adobe CC"], debouches: ["architecte", "chef de projet", "assistant de projet", "maîtrise d'œuvre"], ecolesAssociees: ["ulb-lacambre-horta", "uclouvain-loci", "uliege-archi", "umons-fau", "ensaplv", "ensapb", "ensa-lyon"], villes: ["Bruxelles", "Louvain-la-Neuve", "Liège", "Mons", "Paris", "Lyon"], pays: ["Belgique", "France"], tags: ["atelier", "projet", "construction"] },
    { id: "interieur", nom: "Architecture d’intérieur", description: "Conception des espaces intérieurs, ambiances, mobilier intégré, matériaux et usages.", dureeMoyenne: "3 à 5 ans selon école", diplomeVise: "Bachelor / master artistique ou diplôme spécialisé, à vérifier", competences: ["espace", "matériaux", "ergonomie", "lumière", "mobilier"], logicielsUtiles: ["SketchUp", "AutoCAD", "Rhino", "Enscape", "InDesign"], debouches: ["architecte d'intérieur", "designer d'espace", "scénographe", "concepteur retail"], ecolesAssociees: ["saint-luc-bruxelles", "saint-luc-liege", "luca-gand", "uantwerpen-design", "esa-tournai"], villes: ["Bruxelles", "Liège", "Gand", "Anvers", "Tournai"], pays: ["Belgique"], tags: ["intérieur", "matière", "ambiance"] },
    { id: "urbanisme", nom: "Urbanisme", description: "Lecture territoriale, planification, mobilité, habitat, politiques publiques et formes urbaines.", dureeMoyenne: "1 à 5 ans selon entrée et master", diplomeVise: "Master urbanisme / architecture / aménagement, à vérifier", competences: ["cartographie", "diagnostic", "règlement", "mobilité", "concertation"], logicielsUtiles: ["QGIS", "Illustrator", "AutoCAD", "Excel", "InDesign"], debouches: ["urbaniste", "chargé d'études", "programmiste", "collectivité"], ecolesAssociees: ["uclouvain-loci", "umons-fau", "uliege-archi", "ensaplv", "ensa-marseille", "ensap-lille", "ensa-toulouse"], villes: ["Louvain-la-Neuve", "Mons", "Liège", "Paris", "Marseille", "Lille", "Toulouse"], pays: ["Belgique", "France"], tags: ["ville", "territoire", "cartographie"] },
    { id: "paysage", nom: "Paysage", description: "Projet de sols, végétal, eau, climat, espaces publics et transformation des territoires.", dureeMoyenne: "3 à 5 ans selon école", diplomeVise: "Diplôme de paysagiste / master paysage, à vérifier", competences: ["végétal", "sol", "hydrologie", "territoire", "dessin"], logicielsUtiles: ["QGIS", "AutoCAD", "Photoshop", "Illustrator", "InDesign"], debouches: ["paysagiste", "concepteur espace public", "chargé d'études environnement"], ecolesAssociees: ["ensap-lille", "ensap-bordeaux", "ensa-marseille"], villes: ["Lille", "Bordeaux", "Marseille"], pays: ["France"], tags: ["sol", "climat", "végétal"] },
    { id: "design-espace", nom: "Design d’espace", description: "Conception d'espaces culturels, commerciaux, événementiels et domestiques avec forte attention à l'usage.", dureeMoyenne: "3 à 5 ans selon école", diplomeVise: "Bachelor / master artistique ou diplôme spécialisé, à vérifier", competences: ["scénario d'usage", "volume", "signalétique", "maquette", "matière"], logicielsUtiles: ["SketchUp", "Rhino", "Blender", "Adobe CC"], debouches: ["designer d'espace", "concepteur retail", "assistant scénographe"], ecolesAssociees: ["saint-luc-bruxelles", "saint-luc-liege", "luca-gand", "esa-tournai"], villes: ["Bruxelles", "Liège", "Gand", "Tournai"], pays: ["Belgique"], tags: ["usage", "volume", "expérience"] },
    { id: "design-mobilier", nom: "Design mobilier", description: "Création d'objets, meubles, prototypes et systèmes de fabrication liés à l'habitat.", dureeMoyenne: "3 à 5 ans selon école", diplomeVise: "Bachelor / master design, à vérifier", competences: ["ergonomie", "prototype", "assemblage", "matériaux", "dessin technique"], logicielsUtiles: ["Rhino", "Fusion 360", "SolidWorks", "KeyShot", "Adobe CC"], debouches: ["designer mobilier", "prototypiste", "designer produit"], ecolesAssociees: ["saint-luc-bruxelles", "luca-gand"], villes: ["Bruxelles", "Gand"], pays: ["Belgique"], tags: ["objet", "prototype", "fabrication"] },
    { id: "scenographie", nom: "Scénographie", description: "Conception d'espaces narratifs pour exposition, spectacle, musées, événements et installations.", dureeMoyenne: "3 à 5 ans selon école", diplomeVise: "Diplôme artistique / spécialisation, à vérifier", competences: ["récit spatial", "lumière", "parcours", "montage", "maquette"], logicielsUtiles: ["SketchUp", "Vectorworks", "Blender", "Adobe CC"], debouches: ["scénographe", "concepteur exposition", "designer événementiel"], ecolesAssociees: ["saint-luc-bruxelles", "saint-luc-liege", "ensa-nantes", "esa-tournai"], villes: ["Bruxelles", "Liège", "Nantes", "Tournai"], pays: ["Belgique", "France"], tags: ["exposition", "récit", "lumière"] },
    { id: "patrimoine", nom: "Patrimoine / restauration", description: "Étude du bâti existant, relevé, diagnostic, restauration, réemploi et interventions sensibles.", dureeMoyenne: "1 à 5 ans selon spécialisation", diplomeVise: "Master ou spécialisation patrimoine, à vérifier", competences: ["relevé", "diagnostic", "matériaux anciens", "réhabilitation", "règlement"], logicielsUtiles: ["AutoCAD", "Revit", "Recap", "QGIS", "InDesign"], debouches: ["architecte patrimoine", "chargé de mission", "diagnostiqueur bâti"], ecolesAssociees: ["ulb-lacambre-horta", "umons-fau", "uantwerpen-design", "ensapb", "ensa-toulouse", "ensa-montpellier"], villes: ["Bruxelles", "Mons", "Anvers", "Paris", "Toulouse", "Montpellier"], pays: ["Belgique", "France"], tags: ["patrimoine", "réhabilitation", "diagnostic"] },
    { id: "ingenierie-construction", nom: "Ingénierie construction", description: "Approche technique structure, enveloppe, chantier, physique du bâtiment et coordination.", dureeMoyenne: "3 à 5 ans selon école", diplomeVise: "Master ingénierie / architecture / construction, à vérifier", competences: ["structure", "physique du bâtiment", "chantier", "détail", "économie"], logicielsUtiles: ["Revit", "Robot", "Excel", "AutoCAD", "BIMcollab"], debouches: ["ingénieur construction", "coordinateur technique", "AMO", "chef de projet"], ecolesAssociees: ["ensa-lyon", "ensa-strasbourg", "ensa-grenoble"], villes: ["Lyon", "Strasbourg", "Grenoble"], pays: ["France"], tags: ["structure", "chantier", "technique"] },
    { id: "bim", nom: "BIM / modélisation", description: "Modélisation numérique, coordination, maquette informationnelle, synthèse et documentation.", dureeMoyenne: "1 à 5 ans selon entrée et spécialisation", diplomeVise: "Certificat / bachelor / master, à vérifier", competences: ["modèle BIM", "coordination", "familles", "quantités", "interopérabilité"], logicielsUtiles: ["Revit", "Archicad", "Navisworks", "BIMcollab", "Dynamo"], debouches: ["BIM modeleur", "BIM coordinateur", "dessinateur-projeteur", "synthèse technique"], ecolesAssociees: ["uliege-archi", "kuleuven-architecture", "ensaplv", "ensa-nantes", "ensa-strasbourg"], villes: ["Liège", "Gand", "Paris", "Nantes", "Strasbourg"], pays: ["Belgique", "France"], tags: ["BIM", "maquette", "coordination"] },
    { id: "durable", nom: "Architecture durable / écoconstruction", description: "Conception bas-carbone, bioclimatique, matériaux biosourcés, réemploi et sobriété constructive.", dureeMoyenne: "1 à 5 ans selon parcours", diplomeVise: "Master ou spécialisation environnement, à vérifier", competences: ["ACV", "bioclimatique", "isolation", "réemploi", "matériaux"], logicielsUtiles: ["Pleiades", "Revit", "One Click LCA", "Excel", "QGIS"], debouches: ["consultant durable", "architecte bas-carbone", "AMO environnement", "chargé d'études"], ecolesAssociees: ["ulb-lacambre-horta", "uclouvain-loci", "ensapb", "ensa-lyon", "ensap-bordeaux", "ensa-grenoble", "ensa-montpellier"], villes: ["Bruxelles", "Louvain-la-Neuve", "Paris", "Lyon", "Bordeaux", "Grenoble", "Montpellier"], pays: ["Belgique", "France"], tags: ["bas-carbone", "écoconstruction", "réemploi"] }
  ].map(filiere => ({
    durée: filiere.dureeMoyenne,
    diplôme: filiere.diplomeVise,
    ...filiere
  }));

  const DATA_FICHES_TECHNIQUES = [
    { id: "toiture-plate-chaude", titre: "toiture plate chaude", categorie: "Toitures", sousCategorie: "Toiture plate", niveau: "intermédiaire", usage: "Toiture compacte isolée au-dessus du support.", descriptionCourte: "Détail pédagogique d'une toiture plate chaude avec pare-vapeur, isolant, étanchéité et acrotère.", couches: ["support porteur", "pare-vapeur", "isolant rigide", "étanchéité EPDM", "protection"], materiaux: ["béton", "EPDM", "PIR", "laine de bois"], pointsVigilance: ["continuité du pare-vapeur", "relevés d'étanchéité", "pente minimale"], erreursFrequentes: ["oublier les évacuations EP", "percer l'étanchéité sans traitement"], avantages: ["bonne performance thermique", "détail courant"], limites: ["points singuliers sensibles"], motsCles: ["acrotère", "étanchéité", "pare-vapeur"], externalLinks: [{ label: "Voir un organisme technique", url: "https://www.buildwise.be/", type: "site technique" }], schema: "toiture", statut: "à vérifier" },
    { id: "toiture-plate-froide", titre: "toiture plate froide", categorie: "Toitures", sousCategorie: "Toiture ventilée", niveau: "avancé", usage: "Cas à manier avec prudence, ventilation nécessaire.", descriptionCourte: "Toiture avec isolation sous support et lame d'air ventilée.", couches: ["plafond", "pare-vapeur", "isolant semi-rigide", "lame d'air", "support", "étanchéité"], materiaux: ["bois", "laine minérale", "EPDM"], pointsVigilance: ["ventilation réelle", "risque condensation"], erreursFrequentes: ["lame d'air bloquée", "pare-vapeur discontinu"], avantages: ["compatible rénovation ciblée"], limites: ["risque hygrothermique élevé"], motsCles: ["condensation", "ventilation", "frein-vapeur"], externalLinks: [{ label: "Documentation technique générale", url: "https://www.cstb.fr/", type: "documentation" }], schema: "toiture", statut: "à compléter" },
    { id: "toiture-vegetalisee", titre: "toiture végétalisée", categorie: "Toitures", sousCategorie: "Végétalisation", niveau: "avancé", usage: "Rétention d'eau, inertie et biodiversité sur toiture plate.", descriptionCourte: "Principe de couches : étanchéité anti-racine, drainage, substrat, végétal.", couches: ["support", "pare-vapeur", "isolant", "membrane anti-racine", "drainage", "substrat", "végétation"], materiaux: ["EPDM", "substrat", "drainage", "végétal"], pointsVigilance: ["charge", "entretien", "évacuation trop-plein"], erreursFrequentes: ["sous-estimer le poids saturé", "absence de protection racinaire"], avantages: ["rétention d'eau", "confort d'été"], limites: ["entretien et charge"], motsCles: ["biodiversité", "eau", "substrat"], externalLinks: [{ label: "Ressource environnement", url: "https://www.ademe.fr/", type: "documentation" }], schema: "toiture", statut: "à vérifier" },
    { id: "toiture-pente", titre: "toiture en pente", categorie: "Charpentes", sousCategorie: "Couverture inclinée", niveau: "débutant", usage: "Couverture tuile, ardoise ou zinc avec isolation et ventilation.", descriptionCourte: "Détail de toiture en pente avec chevrons, écran, isolant, pare-vapeur et couverture.", couches: ["chevrons", "isolant", "pare-vapeur", "écran sous-toiture", "liteaux", "couverture"], materiaux: ["bois", "tuile", "ardoise", "laine de bois"], pointsVigilance: ["ventilation sous couverture", "continuité air", "raccord gouttière"], erreursFrequentes: ["écran non raccordé", "pont thermique au pied de rampant"], avantages: ["écoulement simple", "détail lisible"], limites: ["raccords et lucarnes complexes"], motsCles: ["chevron", "liteau", "gouttière"], externalLinks: [{ label: "Voir ressource bois", url: "https://www.fcba.fr/", type: "documentation" }], schema: "toiture-pente", statut: "à compléter" },
    { id: "terrasse-bois", titre: "terrasse bois", categorie: "Terrasses", sousCategorie: "Platelage extérieur", niveau: "débutant", usage: "Sol extérieur sur lambourdes, plots ou structure légère.", descriptionCourte: "Terrasse avec lames, lambourdes, cales, pente et ventilation.", couches: ["support", "plots", "lambourdes", "lames bois", "jeu périphérique"], materiaux: ["bois", "acier galvanisé", "plots"], pointsVigilance: ["pente", "ventilation", "désolidarisation"], erreursFrequentes: ["bois en contact permanent avec eau", "entraxe excessif"], avantages: ["montage sec", "remplaçable"], limites: ["entretien"], motsCles: ["lambourdes", "plots", "extérieur"], externalLinks: [{ label: "Documentation bois", url: "https://www.fcba.fr/", type: "documentation" }], schema: "plancher", statut: "à vérifier" },
    { id: "mur-ossature-bois", titre: "mur ossature bois", categorie: "Ossature bois", sousCategorie: "Mur porteur léger", niveau: "intermédiaire", usage: "Mur porteur ou remplissage avec isolant, panneaux et bardage.", descriptionCourte: "Coupe mur ossature bois : lisse basse, montants, OSB, laine de bois, pare-pluie, bardage.", couches: ["bardage", "lame d'air", "pare-pluie", "laine de bois", "OSB", "frein-vapeur", "parement intérieur"], materiaux: ["bois", "OSB", "laine de bois", "bardage"], pointsVigilance: ["contreventement", "continuité frein-vapeur", "pied de mur"], erreursFrequentes: ["OSB côté froid mal placé", "bardage non ventilé"], avantages: ["léger", "préfabriqué", "bas-carbone"], limites: ["détails humidité"], motsCles: ["OSB", "lisse haute", "isolant semi-rigide"], externalLinks: [{ label: "Ressource construction bois", url: "https://www.fcba.fr/", type: "documentation" }], schema: "mur", statut: "à vérifier" },
    { id: "mur-beton-ite", titre: "mur béton isolé par l’extérieur", categorie: "Béton", sousCategorie: "ITE", niveau: "intermédiaire", usage: "Mur porteur lourd avec isolation continue extérieure.", descriptionCourte: "Voile béton, isolant extérieur, sous-enduit ou façade ventilée.", couches: ["béton", "fixations", "isolant", "sous-enduit", "finition"], materiaux: ["béton", "laine minérale", "enduit"], pointsVigilance: ["fixation", "soubassement", "ponts thermiques"], erreursFrequentes: ["retour d'isolant oublié", "départ ITE trop bas"], avantages: ["inertie intérieure", "ponts thermiques réduits"], limites: ["traitement des seuils"], motsCles: ["ITE", "voile", "soubassement"], externalLinks: [{ label: "Centre scientifique et technique", url: "https://www.cstb.fr/", type: "site technique" }], schema: "mur", statut: "à vérifier" },
    { id: "facade-ventilee", titre: "façade ventilée", categorie: "Façade", sousCategorie: "Bardage rapporté", niveau: "intermédiaire", usage: "Enveloppe avec lame d'air ventilée et peau extérieure.", descriptionCourte: "Mur support, isolant, ossature secondaire, lame d'air, parement.", couches: ["support", "isolant", "pare-pluie", "ossature secondaire", "lame d'air", "parement"], materiaux: ["acier", "bois", "aluminium", "fibre-ciment"], pointsVigilance: ["entrée/sortie d'air", "feu façade", "fixations"], erreursFrequentes: ["lame d'air interrompue", "pare-pluie exposé"], avantages: ["durable", "réparable"], limites: ["détail feu et coût"], motsCles: ["lame d'air", "bardage", "pare-pluie"], externalLinks: [{ label: "Ressource technique", url: "https://www.buildwise.be/", type: "site technique" }], schema: "facade", statut: "à compléter" },
    { id: "bardage-bois", titre: "bardage bois", categorie: "Façade", sousCategorie: "Peau extérieure", niveau: "débutant", usage: "Parement extérieur ventilé en lames ou panneaux bois.", descriptionCourte: "Bardage, tasseaux, pare-pluie, ventilation basse et haute.", couches: ["pare-pluie", "tasseaux", "lame d'air", "bardage", "fixations"], materiaux: ["bois", "inox", "pare-pluie"], pointsVigilance: ["classe d'emploi", "eau stagnante", "entraxe"], erreursFrequentes: ["coupe horizontale non protégée", "absence grille anti-rongeur"], avantages: ["renouvelable", "léger"], limites: ["grisaillement et entretien"], motsCles: ["tasseau", "ventilation", "fixation"], externalLinks: [{ label: "Documentation bois", url: "https://www.fcba.fr/", type: "documentation" }], schema: "facade", statut: "à vérifier" },
    { id: "plancher-bois", titre: "plancher bois", categorie: "Planchers", sousCategorie: "Solivage", niveau: "intermédiaire", usage: "Plancher léger avec solives, panneau, acoustique et revêtement.", descriptionCourte: "Solives, OSB, isolant acoustique, chape sèche ou revêtement.", couches: ["solives", "OSB", "isolant", "lambourdes", "revêtement de sol"], materiaux: ["bois", "OSB", "laine de bois"], pointsVigilance: ["vibrations", "acoustique", "trémies"], erreursFrequentes: ["portée mal estimée", "absence désolidarisation acoustique"], avantages: ["léger", "sec", "réversible"], limites: ["acoustique à traiter"], motsCles: ["solives", "OSB", "revêtement de sol"], externalLinks: [{ label: "Ressource bois", url: "https://www.fcba.fr/", type: "documentation" }], schema: "plancher", statut: "à compléter" },
    { id: "dalle-beton", titre: "dalle béton", categorie: "Béton", sousCategorie: "Plancher lourd", niveau: "débutant", usage: "Plancher ou dalle sur terre-plein selon contexte.", descriptionCourte: "Dalle, armatures, isolant, rupteurs et finitions.", couches: ["hérisson", "film", "isolant", "béton armé", "chape", "revêtement"], materiaux: ["béton", "acier", "isolant"], pointsVigilance: ["joints", "remontées capillaires", "ponts thermiques"], erreursFrequentes: ["absence rupture périphérique", "cure insuffisante"], avantages: ["inertie", "robustesse"], limites: ["carbone", "temps de séchage"], motsCles: ["dalle", "armature", "terre-plein"], externalLinks: [{ label: "Ressource technique", url: "https://www.cstb.fr/", type: "site technique" }], schema: "plancher", statut: "à vérifier" },
    { id: "semelle-filante", titre: "fondation semelle filante", categorie: "Fondations", sousCategorie: "Fondation superficielle", niveau: "intermédiaire", usage: "Support continu sous murs porteurs.", descriptionCourte: "Semelle, armatures, béton de propreté, mur de soubassement.", couches: ["sol porteur", "béton de propreté", "armatures", "semelle", "soubassement"], materiaux: ["béton", "acier"], pointsVigilance: ["sol", "hors gel", "drainage"], erreursFrequentes: ["dimensionnement sans étude sol", "drain absent"], avantages: ["simple", "courant"], limites: ["dépend du sol"], motsCles: ["hors gel", "semelle", "drain"], externalLinks: [{ label: "Centre technique", url: "https://www.buildwise.be/", type: "site technique" }], schema: "fondation", statut: "à vérifier" },
    { id: "acrotere", titre: "acrotère", categorie: "Acrotères", sousCategorie: "Relevé toiture plate", niveau: "avancé", usage: "Couronnement et relevé d'étanchéité en rive de toiture.", descriptionCourte: "Acrotère avec relevé, isolant, couvertine, pente et rupture thermique.", couches: ["mur support", "isolant", "relevé étanchéité", "capot / acrotère", "couvertine"], materiaux: ["béton", "EPDM", "aluminium", "isolant"], pointsVigilance: ["hauteur relevé", "fixation couvertine", "pont thermique"], erreursFrequentes: ["couvertine plate", "relevé trop bas"], avantages: ["bord net", "protection rive"], limites: ["point singulier sensible"], motsCles: ["capot", "relevé", "couvertine"], externalLinks: [{ label: "Documentation toiture", url: "https://www.buildwise.be/", type: "site technique" }], schema: "toiture", statut: "à vérifier" },
    { id: "evacuation-ep", titre: "gouttière / évacuation EP", categorie: "Étanchéité", sousCategorie: "Eaux pluviales", niveau: "intermédiaire", usage: "Collecte et évacuation des eaux de toiture.", descriptionCourte: "Naissance EP, trop-plein, pente, crapaudine et raccord étanchéité.", couches: ["étanchéité", "naissance EP", "crapaudine", "descente", "trop-plein"], materiaux: ["zinc", "PVC", "EPDM", "aluminium"], pointsVigilance: ["débit", "entretien", "trop-plein"], erreursFrequentes: ["évacuation unique", "pente insuffisante"], avantages: ["sécurité toiture"], limites: ["maintenance"], motsCles: ["EP", "gouttière", "trop-plein"], externalLinks: [{ label: "Ressource technique", url: "https://www.cstb.fr/", type: "documentation" }], schema: "toiture", statut: "à compléter" },
    { id: "isolation-interieure", titre: "isolation intérieure", categorie: "Isolation", sousCategorie: "ITI", niveau: "débutant", usage: "Isolation côté intérieur en rénovation ou contraintes façade.", descriptionCourte: "Ossature, isolant, pare-vapeur/frein-vapeur et parement.", couches: ["mur existant", "isolant semi-rigide", "frein-vapeur", "ossature", "plaque"], materiaux: ["laine de bois", "plaque de plâtre", "frein-vapeur"], pointsVigilance: ["condensation", "ponts thermiques", "continuité vapeur"], erreursFrequentes: ["pare-vapeur percé", "retours non isolés"], avantages: ["intérieur maîtrisé", "façade conservée"], limites: ["perte surface", "hygrothermie"], motsCles: ["ITI", "frein-vapeur", "pont thermique"], externalLinks: [{ label: "Ressource environnement", url: "https://www.ademe.fr/", type: "documentation" }], schema: "mur", statut: "à vérifier" },
    { id: "isolation-exterieure", titre: "isolation extérieure", categorie: "Isolation", sousCategorie: "ITE", niveau: "intermédiaire", usage: "Enveloppe continue à l'extérieur du support.", descriptionCourte: "ITE sous enduit ou sous bardage avec traitement des points singuliers.", couches: ["support", "isolant", "fixation", "sous-enduit", "finition"], materiaux: ["laine minérale", "fibre de bois", "enduit"], pointsVigilance: ["soubassement", "menuiseries", "feu"], erreursFrequentes: ["départs mal protégés", "tableaux oubliés"], avantages: ["continuité thermique", "inertie conservée"], limites: ["autorisation façade"], motsCles: ["ITE", "tableau", "soubassement"], externalLinks: [{ label: "Ressource technique", url: "https://www.cstb.fr/", type: "site technique" }], schema: "mur", statut: "à vérifier" },
    { id: "pare-vapeur", titre: "pare-vapeur", categorie: "Isolation", sousCategorie: "Gestion vapeur", niveau: "débutant", usage: "Limiter fortement le passage de vapeur d'eau.", descriptionCourte: "Membrane continue côté chaud selon composition et climat.", couches: ["support", "adhésif", "pare-vapeur", "passage réseau traité"], materiaux: ["membrane", "adhésif", "manchon"], pointsVigilance: ["continuité", "traversées", "recouvrements"], erreursFrequentes: ["prise électrique non traitée", "adhésif inadapté"], avantages: ["réduit condensation"], limites: ["peut bloquer le séchage"], motsCles: ["vapeur", "membrane", "étanchéité air"], externalLinks: [{ label: "Ressource pédagogique", url: "https://www.buildwise.be/", type: "documentation" }], schema: "membrane", statut: "à compléter" },
    { id: "frein-vapeur", titre: "frein-vapeur", categorie: "Isolation", sousCategorie: "Gestion vapeur", niveau: "intermédiaire", usage: "Réguler la vapeur tout en permettant un certain séchage.", descriptionCourte: "Membrane hygrovariable ou freinant la diffusion selon détail.", couches: ["parement", "frein-vapeur", "isolant", "support"], materiaux: ["membrane", "adhésif", "bois"], pointsVigilance: ["choix hygrothermique", "continuité"], erreursFrequentes: ["confusion avec pare-vapeur", "jonctions non collées"], avantages: ["sécurité hygrothermique"], limites: ["nécessite calcul"], motsCles: ["hygrovariable", "vapeur", "bois"], externalLinks: [{ label: "Ressource technique", url: "https://www.buildwise.be/", type: "site technique" }], schema: "membrane", statut: "à vérifier" },
    { id: "epdm", titre: "étanchéité EPDM", categorie: "Étanchéité", sousCategorie: "Membrane", niveau: "intermédiaire", usage: "Membrane souple pour toiture plate, relevés et points singuliers.", descriptionCourte: "EPDM collé ou lesté avec relevés, angles et évacuations traités.", couches: ["support", "primaire", "membrane EPDM", "relevé", "protection"], materiaux: ["EPDM", "colle", "aluminium"], pointsVigilance: ["angles", "collage", "évacuations"], erreursFrequentes: ["angle sans pièce adaptée", "support humide"], avantages: ["durable", "souple"], limites: ["pose précise"], motsCles: ["membrane", "relevé", "toiture"], externalLinks: [{ label: "Ressource toiture", url: "https://www.buildwise.be/", type: "documentation" }], schema: "toiture", statut: "à vérifier" },
    { id: "poteau-poutre", titre: "assemblage poteau-poutre", categorie: "Acier", sousCategorie: "Structure", niveau: "avancé", usage: "Nœud structurel bois ou acier selon système.", descriptionCourte: "Principe d'assemblage avec platine, boulons, équerres ou connecteurs.", couches: ["poteau", "poutre", "platine", "boulons", "contreventement"], materiaux: ["acier", "bois", "boulonnerie"], pointsVigilance: ["reprise d'efforts", "feu", "tolérances"], erreursFrequentes: ["détail non démontable", "jeu de montage oublié"], avantages: ["lisible", "préfabriquable"], limites: ["calcul obligatoire"], motsCles: ["poteau", "poutre", "platine"], externalLinks: [{ label: "Ressource structure bois", url: "https://www.fcba.fr/", type: "documentation" }], schema: "structure", statut: "à compléter" },
    { id: "seuil-porte", titre: "détail seuil de porte", categorie: "Menuiseries", sousCategorie: "Seuil", niveau: "avancé", usage: "Jonction sol intérieur/extérieur, accessibilité et étanchéité.", descriptionCourte: "Seuil avec rupture thermique, pente, relevé et ressaut limité.", couches: ["revêtement intérieur", "seuil", "étanchéité", "pente extérieure", "isolant"], materiaux: ["aluminium", "béton", "EPDM", "isolant"], pointsVigilance: ["eau", "PMR", "pont thermique"], erreursFrequentes: ["seuil trop haut", "pente vers intérieur"], avantages: ["confort d'usage"], limites: ["détail sensible"], motsCles: ["seuil", "PMR", "eau"], externalLinks: [{ label: "Ressource accessibilité", url: "https://www.ecologie.gouv.fr/", type: "documentation" }], schema: "seuil", statut: "à vérifier" },
    { id: "detail-fenetre", titre: "détail fenêtre", categorie: "Menuiseries", sousCategorie: "Tableau", niveau: "intermédiaire", usage: "Pose en tunnel, applique ou nu extérieur selon stratégie thermique.", descriptionCourte: "Menuiserie, tapées, compribande, tablette, retour isolant.", couches: ["mur", "isolant", "dormant", "joint", "appui", "tableau"], materiaux: ["bois", "aluminium", "PVC", "isolant"], pointsVigilance: ["étanchéité air/eau", "pont thermique", "appui"], erreursFrequentes: ["joint discontinu", "tableau non isolé"], avantages: ["performance enveloppe"], limites: ["multiples variantes"], motsCles: ["fenêtre", "tableau", "appui"], externalLinks: [{ label: "Ressource technique", url: "https://www.cstb.fr/", type: "documentation" }], schema: "fenetre", statut: "à vérifier" },
    { id: "escalier-bois", titre: "escalier bois", categorie: "Escaliers", sousCategorie: "Circulation verticale", niveau: "intermédiaire", usage: "Escalier intérieur, limons, marches, garde-corps.", descriptionCourte: "Principe marche/giron/limon avec garde-corps et échappée.", couches: ["limon", "marche", "contremarche", "garde-corps", "palier"], materiaux: ["bois", "acier"], pointsVigilance: ["Blondel", "échappée", "garde-corps"], erreursFrequentes: ["giron irrégulier", "main courante oubliée"], avantages: ["léger", "chaleureux"], limites: ["acoustique et feu"], motsCles: ["giron", "limon", "Blondel"], externalLinks: [{ label: "Ressource bois", url: "https://www.fcba.fr/", type: "documentation" }], schema: "escalier", statut: "à compléter" },
    { id: "escalier-beton", titre: "escalier béton", categorie: "Béton", sousCategorie: "Escalier coulé", niveau: "avancé", usage: "Escalier robuste intégré à la structure.", descriptionCourte: "Paillasse, armatures, nez de marche, palier et finition.", couches: ["coffrage", "armatures", "béton", "nez de marche", "revêtement"], materiaux: ["béton", "acier", "pierre"], pointsVigilance: ["coffrage", "ferraillage", "hauteur constante"], erreursFrequentes: ["première marche différente", "réservation oubliée"], avantages: ["inertie", "robustesse"], limites: ["poids", "chantier humide"], motsCles: ["paillasse", "coffrage", "marche"], externalLinks: [{ label: "Ressource technique", url: "https://www.cstb.fr/", type: "site technique" }], schema: "escalier", statut: "à vérifier" },
    { id: "angle-ossature", titre: "détail d’angle ossature bois", categorie: "Détails d’angle", sousCategorie: "Angle sortant", niveau: "avancé", usage: "Continuité isolation, pare-pluie et bardage sur angle.", descriptionCourte: "Angle avec montants, panneaux, tasseaux croisés, retour pare-pluie.", couches: ["montants", "OSB", "isolant", "pare-pluie", "tasseaux", "bardage"], materiaux: ["bois", "OSB", "laine de bois"], pointsVigilance: ["continuité air", "fixation bardage", "eau"], erreursFrequentes: ["angle non ventilé", "pare-pluie coupé"], avantages: ["préfabricable"], limites: ["précision nécessaire"], motsCles: ["angle", "bardage", "ossature"], externalLinks: [{ label: "Ressource bois", url: "https://www.fcba.fr/", type: "documentation" }], schema: "angle", statut: "à compléter" },
    { id: "jonction-mur-toiture", titre: "jonction mur/toiture", categorie: "Jonctions mur/toiture", sousCategorie: "Raccord enveloppe", niveau: "avancé", usage: "Continuité thermique, vapeur, air et étanchéité entre mur et toiture.", descriptionCourte: "Raccord lisse haute, pare-vapeur, isolant, écran et couverture.", couches: ["mur", "lisse haute", "pare-vapeur", "isolant toiture", "écran", "couverture"], materiaux: ["bois", "membrane", "laine de bois"], pointsVigilance: ["continuité des membranes", "pont thermique rive"], erreursFrequentes: ["membrane interrompue", "isolant compressé"], avantages: ["performance enveloppe"], limites: ["détail complexe"], motsCles: ["lisse haute", "jonction", "pare-vapeur"], externalLinks: [{ label: "Ressource technique", url: "https://www.buildwise.be/", type: "site technique" }], schema: "jonction", statut: "à vérifier" },
    { id: "jonction-mur-plancher", titre: "jonction mur/plancher", categorie: "Jonctions mur/plancher", sousCategorie: "Nez de dalle", niveau: "avancé", usage: "Traitement pont thermique et acoustique au droit du plancher.", descriptionCourte: "Mur, plancher, isolant périphérique, rupteur et parement.", couches: ["mur", "plancher", "rupteur", "isolant", "parement"], materiaux: ["béton", "bois", "isolant"], pointsVigilance: ["pont thermique", "acoustique", "feu"], erreursFrequentes: ["nez de dalle exposé", "joint acoustique absent"], avantages: ["continuité constructive"], limites: ["coordination structure/enveloppe"], motsCles: ["nez de dalle", "rupteur", "acoustique"], externalLinks: [{ label: "Ressource technique", url: "https://www.cstb.fr/", type: "site technique" }], schema: "jonction", statut: "à compléter" },
    { id: "pmr-douche", titre: "détail PMR douche accessible", categorie: "Détails PMR", sousCategorie: "Salle d'eau", niveau: "intermédiaire", usage: "Douche de plain-pied avec pente, siphon et aire de manœuvre.", descriptionCourte: "Receveur intégré, étanchéité sous carrelage, pente et ressaut nul.", couches: ["support", "forme de pente", "étanchéité", "carrelage", "siphon"], materiaux: ["béton", "carrelage", "membrane"], pointsVigilance: ["pente", "ressaut", "glissance"], erreursFrequentes: ["siphon mal placé", "pente insuffisante"], avantages: ["accessibilité", "confort"], limites: ["réservations nécessaires"], motsCles: ["PMR", "douche", "plain-pied"], externalLinks: [{ label: "Ressource accessibilité", url: "https://www.ecologie.gouv.fr/", type: "documentation" }], schema: "pmr", statut: "à vérifier" },
    { id: "detail-ecologique-paille", titre: "détail écologique paille enduite", categorie: "Détails écologiques", sousCategorie: "Biosourcé", niveau: "avancé", usage: "Mur à forte épaisseur isolante en bottes de paille ou caissons.", descriptionCourte: "Ossature, paille, enduit terre/chaux, protection pluie et soubassement.", couches: ["soubassement", "ossature bois", "paille", "enduit terre", "enduit chaux"], materiaux: ["paille", "bois", "terre", "chaux"], pointsVigilance: ["humidité", "soubassement", "feu"], erreursFrequentes: ["paille proche du sol", "débord toiture insuffisant"], avantages: ["bas-carbone", "isolant"], limites: ["détails eau très sensibles"], motsCles: ["paille", "terre", "biosourcé"], externalLinks: [{ label: "Ressource environnement", url: "https://www.ademe.fr/", type: "documentation" }], schema: "mur", statut: "à vérifier" }
  ];

  const CITY_WARNING = "Ces données sont indicatives et pédagogiques. Les règles exactes doivent toujours être vérifiées auprès des documents officiels, communes, cantons, régions ou services d’urbanisme compétents.";

  const cityLink = (label, url, type = "site officiel") => ({ label, url, type });

  function makeCityStandard(config) {
    const paysDefaults = {
      Belgique: {
        langue: "français / néerlandais selon région",
        accessibilité: "PMR, cheminements, portes, rampes, sanitaires accessibles à vérifier selon région et affectation.",
        normesFeu: "Sécurité incendie, compartimentage, évacuation, issues et garde-corps à confirmer avec SIAMU ou service incendie compétent.",
        acoustique: "Exigences selon logement, mitoyenneté, voirie et affectation du projet.",
        énergie: "Performance énergétique régionale, isolation continue, ventilation contrôlée, ponts thermiques.",
        toiture: "Toitures plates fréquentes en tissu dense, pentes et évacuations EP à vérifier.",
        façade: "Alignement, matérialité locale, éventuelles contraintes patrimoniales.",
        matériauxCourants: ["brique", "béton", "bois", "enduit", "acier"],
        contraintesClimatiques: "Climat tempéré humide : pluie, gel ponctuel, gestion eau et isolation.",
        documentsOfficiels: ["RRU / CoDT / documents communaux selon région", "service urbanisme communal"]
      },
      France: {
        langue: "français",
        accessibilité: "PMR, ERP, logement, cheminements, ascenseurs et sanitaires selon programme à vérifier.",
        normesFeu: "Incendie, évacuation, escaliers, garde-corps et ERP selon programme à valider avec textes applicables.",
        acoustique: "Exigences selon logement, équipements, voirie, ERP et mitoyenneté.",
        énergie: "RE2020 ou règles rénovation selon cas, stratégie passive et réduction des surchauffes.",
        toiture: "Selon PLU, patrimoine, pente locale, toiture terrasse ou couverture traditionnelle.",
        façade: "PLU, teintes, matériaux, menuiseries, alignements et ABF éventuel.",
        matériauxCourants: ["béton", "pierre", "brique", "bois", "enduit"],
        contraintesClimatiques: "Contraintes variables : humidité, chaleur estivale, vent, montagne ou littoral selon ville.",
        documentsOfficiels: ["PLU / PLUi", "Géoportail de l'urbanisme", "service urbanisme municipal"]
      },
      Suisse: {
        langue: "français / allemand selon canton",
        accessibilité: "Accessibilité, ascenseurs, cheminements et sanitaires à vérifier selon canton et affectation.",
        normesFeu: "Protection incendie, évacuation, garde-corps et exigences cantonales à confirmer.",
        acoustique: "Exigences selon logement, nuisance, affectation et canton.",
        énergie: "Standards énergétiques cantonaux, enveloppe performante, ventilation et limitation des surchauffes.",
        toiture: "Selon commune, canton, neige, patrimoine, pentes ou toitures plates.",
        façade: "Règles communales/cantonales, matérialité locale, intégration paysagère.",
        matériauxCourants: ["béton", "bois", "pierre", "enduit", "verre"],
        contraintesClimatiques: "Climat tempéré à alpin selon ville : froid, neige, humidité, surchauffe estivale.",
        documentsOfficiels: ["règlement communal", "règlement cantonal", "service urbanisme compétent"]
      }
    };
    const d = paysDefaults[config.pays] || paysDefaults.France;
    return {
      id: config.id,
      pays: config.pays,
      ville: config.ville,
      région: config.région,
      langue: config.langue || d.langue,
      typeZone: config.typeZone || "tissu urbain mixte",
      densitéUrbaine: config.densitéUrbaine || "densité variable selon quartier",
      hauteurIndicative: config.hauteurIndicative || "à vérifier selon règlement local et parcelle",
      reculIndicatif: config.reculIndicatif || "alignement, recul ou mitoyenneté à vérifier selon rue et zone",
      stationnement: config.stationnement || "obligations variables selon programme, accessibilité transports et règlement local",
      accessibilité: config.accessibilité || d.accessibilité,
      espacesVerts: config.espacesVerts || "végétalisation, pleine terre ou compensation à vérifier selon zone",
      normesFeu: config.normesFeu || d.normesFeu,
      acoustique: config.acoustique || d.acoustique,
      énergie: config.énergie || d.énergie,
      toiture: config.toiture || d.toiture,
      façade: config.façade || d.façade,
      matériauxCourants: config.matériauxCourants || d.matériauxCourants,
      contraintesClimatiques: config.contraintesClimatiques || d.contraintesClimatiques,
      documentsOfficiels: config.documentsOfficiels || d.documentsOfficiels,
      liensUtiles: config.liensUtiles || [],
      notes: config.notes || "Fiche pédagogique : toujours confirmer les règles au cas par cas avant dépôt ou conception détaillée.",
      statut: config.statut || "à vérifier"
    };
  }

  const DATA_CITY_STANDARDS = [
    makeCityStandard({ id: "be-bruxelles", pays: "Belgique", ville: "Bruxelles", région: "Bruxelles-Capitale", langue: "français / néerlandais", typeZone: "centre métropolitain dense", densitéUrbaine: "très dense", hauteurIndicative: "gabarits variables, RRU et commune à vérifier", reculIndicatif: "alignement fréquent, mitoyenneté courante", stationnement: "fortement dépendant de l'accessibilité transports", espacesVerts: "cour intérieure, perméabilité et végétalisation à vérifier", documentsOfficiels: ["RRU", "urban.brussels", "commune concernée"], liensUtiles: [cityLink("urban.brussels", "https://urban.brussels/"), cityLink("Ville de Bruxelles", "https://www.bruxelles.be/")], statut: "source officielle" }),
    makeCityStandard({ id: "be-liege", pays: "Belgique", ville: "Liège", région: "Wallonie", typeZone: "ville dense de vallée", densitéUrbaine: "dense en centre, plus ouverte en coteaux", hauteurIndicative: "CoDT et prescriptions communales à vérifier", reculIndicatif: "alignement urbain fréquent, pentes à considérer", matériauxCourants: ["brique", "pierre", "béton", "bois"], contraintesClimatiques: "pluie, relief, ruissellement et îlot de chaleur local", liensUtiles: [cityLink("Ville de Liège", "https://www.liege.be/")], statut: "à vérifier" }),
    makeCityStandard({ id: "be-namur", pays: "Belgique", ville: "Namur", région: "Wallonie", typeZone: "centre historique et vallées", densitéUrbaine: "moyenne à dense", hauteurIndicative: "patrimoine et CoDT à vérifier", reculIndicatif: "alignement historique fréquent", contraintesClimatiques: "confluence, pluie et risque inondation à vérifier", liensUtiles: [cityLink("Ville de Namur", "https://www.namur.be/")], statut: "à vérifier" }),
    makeCityStandard({ id: "be-mons", pays: "Belgique", ville: "Mons", région: "Wallonie", typeZone: "centre patrimonial", densitéUrbaine: "moyenne", hauteurIndicative: "gabarit historique à vérifier", reculIndicatif: "mitoyenneté et alignement fréquents", façade: "vigilance patrimoine, brique, pierre, enduit", liensUtiles: [cityLink("Ville de Mons", "https://www.mons.be/")], statut: "à vérifier" }),
    makeCityStandard({ id: "be-charleroi", pays: "Belgique", ville: "Charleroi", région: "Wallonie", typeZone: "ville industrielle en transformation", densitéUrbaine: "moyenne à dense", hauteurIndicative: "à vérifier selon quartier et reconversion", reculIndicatif: "tissus mixtes, friches et alignements variables", matériauxCourants: ["brique", "béton", "acier", "bois"], notes: "Contexte utile pour reconversion, logements et équipements.", liensUtiles: [cityLink("Ville de Charleroi", "https://www.charleroi.be/")], statut: "à vérifier" }),
    makeCityStandard({ id: "be-tournai", pays: "Belgique", ville: "Tournai", région: "Wallonie", typeZone: "ville patrimoniale", densitéUrbaine: "moyenne", hauteurIndicative: "patrimoine et prescriptions locales à vérifier", reculIndicatif: "alignement historique fréquent", façade: "pierre, brique, enduit et intégration patrimoniale", liensUtiles: [cityLink("Ville de Tournai", "https://www.tournai.be/")], statut: "à vérifier" }),
    makeCityStandard({ id: "be-lln", pays: "Belgique", ville: "Louvain-la-Neuve", région: "Wallonie", typeZone: "ville universitaire planifiée", densitéUrbaine: "dense autour du centre universitaire", hauteurIndicative: "règles UCLouvain/commune à vérifier selon parcelle", reculIndicatif: "interfaces piétonnes et socles actifs à analyser", stationnement: "forte logique piétonne, parkings périphériques à vérifier", liensUtiles: [cityLink("Ottignies-Louvain-la-Neuve", "https://www.olln.be/")], statut: "à vérifier" }),
    makeCityStandard({ id: "be-gand", pays: "Belgique", ville: "Gand", région: "Flandre", langue: "néerlandais", typeZone: "centre flamand dense", densitéUrbaine: "dense", hauteurIndicative: "règles flamandes et communales à vérifier", reculIndicatif: "alignement et patrimoine fréquents", façade: "brique, pierre, menuiseries et patrimoine à étudier", liensUtiles: [cityLink("Stad Gent", "https://stad.gent/")], statut: "à vérifier" }),
    makeCityStandard({ id: "be-anvers", pays: "Belgique", ville: "Anvers", région: "Flandre", langue: "néerlandais", typeZone: "métropole portuaire dense", densitéUrbaine: "très dense en centre, tissus portuaires spécifiques", hauteurIndicative: "règles communales/flamandes à vérifier", reculIndicatif: "front bâti, îlots fermés et grands sites selon quartier", liensUtiles: [cityLink("Stad Antwerpen", "https://www.antwerpen.be/")], statut: "à vérifier" }),
    makeCityStandard({ id: "be-bruges", pays: "Belgique", ville: "Bruges", région: "Flandre", langue: "néerlandais", typeZone: "centre patrimonial majeur", densitéUrbaine: "moyenne à dense", hauteurIndicative: "patrimoine strict à vérifier", reculIndicatif: "alignements historiques sensibles", façade: "intégration patrimoniale prioritaire", liensUtiles: [cityLink("Stad Brugge", "https://www.brugge.be/")], statut: "à vérifier" }),

    makeCityStandard({ id: "fr-paris", pays: "France", ville: "Paris", région: "Île-de-France", typeZone: "centre métropolitain très dense", densitéUrbaine: "très dense", hauteurIndicative: "PLU bioclimatique et règles de gabarit à vérifier", reculIndicatif: "alignement urbain, cours, prospects et mitoyenneté", stationnement: "forte réduction possible selon secteur et programme", espacesVerts: "pleine terre, végétalisation et désimperméabilisation à vérifier", contraintesClimatiques: "îlot de chaleur, pluie intense, confort d'été", liensUtiles: [cityLink("Paris.fr", "https://www.paris.fr/"), cityLink("Géoportail urbanisme", "https://www.geoportail-urbanisme.gouv.fr/")], statut: "source officielle" }),
    makeCityStandard({ id: "fr-lyon", pays: "France", ville: "Lyon", région: "Auvergne-Rhône-Alpes", typeZone: "métropole dense", densitéUrbaine: "dense", hauteurIndicative: "PLU-H métropolitain à vérifier", reculIndicatif: "alignement, prospects et pentes selon secteur", contraintesClimatiques: "chaleur estivale, relief, Rhône/Saône", liensUtiles: [cityLink("Ville de Lyon", "https://www.lyon.fr/")], statut: "à vérifier" }),
    makeCityStandard({ id: "fr-marseille", pays: "France", ville: "Marseille", région: "Provence-Alpes-Côte d'Azur", typeZone: "ville méditerranéenne littorale", densitéUrbaine: "dense en centre, contrastée en périphérie", hauteurIndicative: "PLUi et risques à vérifier", reculIndicatif: "vent, pente, littoral et incendie à étudier", contraintesClimatiques: "chaleur, vent, soleil, risque incendie selon secteur", énergie: "protection solaire, ventilation naturelle, inertie et confort d'été", liensUtiles: [cityLink("Ville de Marseille", "https://www.marseille.fr/")], statut: "à vérifier" }),
    makeCityStandard({ id: "fr-lille", pays: "France", ville: "Lille", région: "Hauts-de-France", typeZone: "métropole dense du nord", densitéUrbaine: "dense", hauteurIndicative: "PLU métropolitain à vérifier", reculIndicatif: "maisons de ville, mitoyenneté et alignements fréquents", contraintesClimatiques: "humidité, pluie, faible ensoleillement hivernal", liensUtiles: [cityLink("Ville de Lille", "https://www.lille.fr/")], statut: "à vérifier" }),
    makeCityStandard({ id: "fr-bordeaux", pays: "France", ville: "Bordeaux", région: "Nouvelle-Aquitaine", typeZone: "ville patrimoniale et métropole", densitéUrbaine: "dense en centre, tissus échoppes", hauteurIndicative: "PLU et patrimoine UNESCO/ABF à vérifier", reculIndicatif: "alignements, cours, extensions en coeur d'îlot à vérifier", façade: "pierre blonde, enduit, patrimoine et teintes sensibles", liensUtiles: [cityLink("Ville de Bordeaux", "https://www.bordeaux.fr/")], statut: "à vérifier" }),
    makeCityStandard({ id: "fr-nantes", pays: "France", ville: "Nantes", région: "Pays de la Loire", typeZone: "métropole fluviale", densitéUrbaine: "moyenne à dense", hauteurIndicative: "PLUm à vérifier", reculIndicatif: "tissus mixtes, renouvellement urbain et berges à analyser", contraintesClimatiques: "pluie, vent, Loire, confort d'été", liensUtiles: [cityLink("Nantes Métropole", "https://metropole.nantes.fr/")], statut: "à vérifier" }),
    makeCityStandard({ id: "fr-strasbourg", pays: "France", ville: "Strasbourg", région: "Grand Est", typeZone: "métropole rhénane", densitéUrbaine: "dense en centre, mixte ailleurs", hauteurIndicative: "PLUi Eurométropole à vérifier", reculIndicatif: "alignement historique et tissus faubourgs", contraintesClimatiques: "froid hivernal, chaleur estivale, nappe et eau", liensUtiles: [cityLink("Strasbourg.eu", "https://www.strasbourg.eu/")], statut: "à vérifier" }),
    makeCityStandard({ id: "fr-toulouse", pays: "France", ville: "Toulouse", région: "Occitanie", typeZone: "métropole du sud-ouest", densitéUrbaine: "moyenne à dense", hauteurIndicative: "PLUi-H à vérifier", reculIndicatif: "brique, faubourgs, tissus pavillonnaires et renouvellement", contraintesClimatiques: "chaleur estivale, soleil, risque inondation selon secteur", liensUtiles: [cityLink("Ville de Toulouse", "https://www.toulouse.fr/")], statut: "à vérifier" }),
    makeCityStandard({ id: "fr-montpellier", pays: "France", ville: "Montpellier", région: "Occitanie", typeZone: "métropole méditerranéenne", densitéUrbaine: "moyenne à dense", hauteurIndicative: "PLU/PLUi à vérifier", reculIndicatif: "soleil, ombrage, tramway et extensions récentes à analyser", contraintesClimatiques: "chaleur, pluies méditerranéennes, confort d'été", liensUtiles: [cityLink("Ville de Montpellier", "https://www.montpellier.fr/")], statut: "à vérifier" }),
    makeCityStandard({ id: "fr-grenoble", pays: "France", ville: "Grenoble", région: "Auvergne-Rhône-Alpes", typeZone: "ville alpine dense", densitéUrbaine: "dense en vallée", hauteurIndicative: "PLUi et contraintes montagne à vérifier", reculIndicatif: "vallée, ombres portées, risques naturels selon secteur", contraintesClimatiques: "froid, chaleur de vallée, inondation, risques montagne", liensUtiles: [cityLink("Ville de Grenoble", "https://www.grenoble.fr/")], statut: "à vérifier" }),
    makeCityStandard({ id: "fr-rennes", pays: "France", ville: "Rennes", région: "Bretagne", typeZone: "métropole compacte", densitéUrbaine: "moyenne à dense", hauteurIndicative: "PLUi Rennes Métropole à vérifier", reculIndicatif: "tissus mixtes, îlots, secteurs patrimoniaux", contraintesClimatiques: "pluie, vent, confort d'été modéré", liensUtiles: [cityLink("Rennes Métropole", "https://metropole.rennes.fr/")], statut: "à vérifier" }),
    makeCityStandard({ id: "fr-nice", pays: "France", ville: "Nice", région: "Provence-Alpes-Côte d'Azur", typeZone: "ville littorale dense", densitéUrbaine: "dense en bande côtière", hauteurIndicative: "PLU et risques littoraux à vérifier", reculIndicatif: "pentes, vues, littoral, incendie et patrimoine à analyser", contraintesClimatiques: "chaleur, soleil, vent, risque ruissellement", liensUtiles: [cityLink("Ville de Nice", "https://www.nice.fr/")], statut: "à vérifier" }),

    makeCityStandard({ id: "ch-geneve", pays: "Suisse", ville: "Genève", région: "Canton de Genève", typeZone: "ville internationale dense", densitéUrbaine: "dense", hauteurIndicative: "règlements cantonaux et communaux à vérifier", reculIndicatif: "gabarits, cours, alignements et voisinage à contrôler", stationnement: "exigences cantonales, mobilité douce et transports à vérifier", liensUtiles: [cityLink("Ville de Genève", "https://www.geneve.ch/")], statut: "source officielle" }),
    makeCityStandard({ id: "ch-lausanne", pays: "Suisse", ville: "Lausanne", région: "Canton de Vaud", typeZone: "ville en pente", densitéUrbaine: "dense en centre, pentes résidentielles", hauteurIndicative: "règlement communal/cantonal à vérifier", reculIndicatif: "pentes, vues, voisinage et patrimoine à analyser", contraintesClimatiques: "pente, pluie, lac, confort d'été", liensUtiles: [cityLink("Ville de Lausanne", "https://www.lausanne.ch/")], statut: "à vérifier" }),
    makeCityStandard({ id: "ch-fribourg", pays: "Suisse", ville: "Fribourg", région: "Canton de Fribourg", typeZone: "ville historique de vallée", densitéUrbaine: "moyenne à dense", hauteurIndicative: "patrimoine et règlement communal/cantonal à vérifier", reculIndicatif: "relief, vues et tissus anciens", liensUtiles: [cityLink("Ville de Fribourg", "https://www.ville-fribourg.ch/")], statut: "à vérifier" }),
    makeCityStandard({ id: "ch-neuchatel", pays: "Suisse", ville: "Neuchâtel", région: "Canton de Neuchâtel", typeZone: "ville lacustre", densitéUrbaine: "moyenne à dense", hauteurIndicative: "règles cantonales/communales à vérifier", reculIndicatif: "pente, lac, patrimoine et vues", contraintesClimatiques: "lac, vent, pluie, confort d'été", liensUtiles: [cityLink("Ville de Neuchâtel", "https://www.neuchatelville.ch/")], statut: "à vérifier" }),
    makeCityStandard({ id: "ch-sion", pays: "Suisse", ville: "Sion", région: "Canton du Valais", typeZone: "ville alpine sèche", densitéUrbaine: "moyenne", hauteurIndicative: "règlement communal/cantonal à vérifier", reculIndicatif: "ensoleillement, pente, patrimoine et risques naturels", contraintesClimatiques: "froid, fort ensoleillement, sécheresse relative, risques alpins", énergie: "inertie, ombrage estival, isolation et ventilation nocturne à étudier", liensUtiles: [cityLink("Ville de Sion", "https://www.sion.ch/")], statut: "à vérifier" }),
    makeCityStandard({ id: "ch-zurich", pays: "Suisse", ville: "Zurich", région: "Canton de Zurich", langue: "allemand", typeZone: "métropole dense", densitéUrbaine: "dense", hauteurIndicative: "règles communales/cantonales à vérifier", reculIndicatif: "îlots, densification et voisinage à contrôler", liensUtiles: [cityLink("Stadt Zürich", "https://www.stadt-zuerich.ch/")], statut: "à vérifier" }),
    makeCityStandard({ id: "ch-bale", pays: "Suisse", ville: "Bâle", région: "Canton de Bâle-Ville", langue: "allemand", typeZone: "ville rhénane dense", densitéUrbaine: "dense", hauteurIndicative: "règlement cantonal/communal à vérifier", reculIndicatif: "front bâti, patrimoine et parcelles compactes", contraintesClimatiques: "Rhin, chaleur estivale, pluie", liensUtiles: [cityLink("Kanton Basel-Stadt", "https://www.bs.ch/")], statut: "à vérifier" }),
    makeCityStandard({ id: "ch-berne", pays: "Suisse", ville: "Berne", région: "Canton de Berne", langue: "allemand / français selon contexte", typeZone: "capitale patrimoniale", densitéUrbaine: "moyenne à dense", hauteurIndicative: "patrimoine et règlements à vérifier", reculIndicatif: "centre historique très sensible, gabarits contrôlés", façade: "pierre, enduit, toiture et patrimoine à vérifier", liensUtiles: [cityLink("Stadt Bern", "https://www.bern.ch/")], statut: "à vérifier" })
  ];

  /* ── Études / Normes & Villes V1 — renderers légers et filtrables ─────── */
  const _studyState = { query: "", country: "", sector: "", city: "", selectedId: DATA_ETUDES_FILIERES[0]?.id || "", selectedSchoolId: "", visible: ETUDES_PAGE_SIZE };
  const _cityState = { query: "", country: "", zone: "", selectedId: DATA_CITY_STANDARDS[0]?.id || "", visible: CITY_PAGE_SIZE };

  function _unique(list, pick) {
    return [...new Set(list.flatMap(item => {
      const value = typeof pick === "function" ? pick(item) : item[pick];
      return Array.isArray(value) ? value : [value];
    }).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "fr"));
  }

  function _captureLibraryFocus(root, selector) {
    const active = document.activeElement;
    if (!root || !active || !root.contains(active) || !active.matches(selector)) return null;
    return { selector, cursor: active.selectionStart ?? active.value.length };
  }

  function _restoreLibraryFocus(root, focus) {
    if (!root || !focus) return;
    const input = root.querySelector(focus.selector);
    if (!input) return;
    input.focus({ preventScroll: true });
    const cursor = Math.min(focus.cursor ?? input.value.length, input.value.length);
    if (typeof input.setSelectionRange === "function") input.setSelectionRange(cursor, cursor);
  }

  function _selectOptions(values, selected) {
    return `<option value="">Tous</option>${values.map(value => `<option value="${_esc(value)}" ${selected === value ? "selected" : ""}>${_esc(value)}</option>`).join("")}`;
  }

  function _schoolById(id) {
    return DATA_ETUDES_ECOLES.find(school => school.id === id);
  }

  function _studyText(item) {
    const schools = (item.ecolesAssociees || []).map(id => _schoolById(id)).filter(Boolean);
    return normalizeText([
      item.nom,
      item.description,
      item.diplomeVise,
      item.competences,
      item.logicielsUtiles,
      item.debouches,
      item.tags,
      schools.map(s => [s.nom, s.ville, s.pays, s.type, s.description].join(" "))
    ].flat().join(" "));
  }

  function _filterEtudes() {
    const q = normalizeText(_studyState.query);
    return DATA_ETUDES_FILIERES.filter(item => {
      const schools = (item.ecolesAssociees || []).map(id => _schoolById(id)).filter(Boolean);
      const countryMatch = !_studyState.country || item.pays.includes(_studyState.country);
      const sectorMatch = !_studyState.sector || item.nom === _studyState.sector;
      const cityMatch = !_studyState.city || item.villes.includes(_studyState.city) || schools.some(s => s.ville === _studyState.city);
      const searchMatch = !q || _studyText(item).includes(q);
      return countryMatch && sectorMatch && cityMatch && searchMatch;
    });
  }

  function _renderStudyCard(item) {
    return `
      <article class="tm-library-card ${item.id === _studyState.selectedId ? "is-active" : ""}" data-study-card="${_esc(item.id)}" tabindex="0">
        <p class="tm-tech-kicker">${_esc(item.pays.join(" / "))}</p>
        <h3>${_esc(item.nom)}</h3>
        <p>${_esc(item.description)}</p>
        <div class="tm-tech-badges">${item.tags.slice(0, 4).map(tag => `<span>${_esc(tag)}</span>`).join("")}</div>
      </article>
    `;
  }

  function _renderStudyDetail(item) {
    if (!item) return `<article class="tm-library-detail"><div class="tm-tech-empty"><strong>Aucune filière</strong><p>Aucune filière ne correspond aux filtres.</p></div></article>`;
    const schools = (item.ecolesAssociees || []).map(id => _schoolById(id)).filter(Boolean);
    const school = _schoolById(_studyState.selectedSchoolId) || schools[0] || null;
    return `
      <article class="tm-library-detail">
        <p class="tm-tech-kicker">Fiche filière</p>
        <h3>${_esc(item.nom)}</h3>
        <p class="tm-library-lead">${_esc(item.description)}</p>
        <div class="tm-library-matrix">
          <div><span>Durée moyenne</span><strong>${_esc(item.dureeMoyenne)}</strong></div>
          <div><span>Diplôme visé</span><strong>${_esc(item.diplomeVise)}</strong></div>
          <div><span>Villes</span><strong>${_esc(item.villes.join(" · "))}</strong></div>
          <div><span>Débouchés</span><strong>${_esc(item.debouches.join(" · "))}</strong></div>
        </div>
        <section class="tm-library-note">
          <p class="tm-tech-kicker">Parcours type</p>
          <p>Découvrir le projet, consolider la représentation, comprendre la construction, puis spécialiser le profil par atelier, stage, mémoire ou option selon l'école.</p>
        </section>
        <div class="tm-library-columns">
          <section>
            <p class="tm-tech-kicker">Compétences</p>
            <div class="tm-tech-badges">${item.competences.map(v => `<span>${_esc(v)}</span>`).join("")}</div>
          </section>
          <section>
            <p class="tm-tech-kicker">Logiciels utiles</p>
            <div class="tm-tech-badges">${item.logicielsUtiles.map(v => `<span>${_esc(v)}</span>`).join("")}</div>
          </section>
        </div>
        <section>
          <p class="tm-tech-kicker">Écoles associées</p>
          <div class="tm-study-school-list">
            ${schools.map(s => `
              <button type="button" class="${s.id === school?.id ? "is-active" : ""}" data-study-school="${_esc(s.id)}">
                <strong>${_esc(s.nom)}</strong>
                <span>${_esc(s.ville)} · ${_esc(s.pays)} · ${_esc(s.type)}</span>
              </button>
            `).join("")}
          </div>
        </section>
        ${school ? `
          <section class="tm-library-note">
            <p class="tm-tech-kicker">Fiche école</p>
            <h4>${_esc(school.nom)}</h4>
            <p>${_esc(school.description)}</p>
            <p>${_esc(school.ville)} · ${_esc(school.pays)} · ${_esc(school.type)} · ${_esc(school.statut)}</p>
            <button type="button" class="text-btn" data-external-url="${_esc(school.lienOfficiel)}">Lien officiel</button>
          </section>
        ` : ""}
        <p class="tm-library-warning">Les parcours, admissions et intitulés exacts sont à vérifier sur les sites officiels des écoles.</p>
      </article>
    `;
  }

  function renderEtudes(root) {
    if (!root) return;
    const focus = _captureLibraryFocus(root, "[data-study-search]");
    const filtered = _filterEtudes();
    if (!filtered.some(item => item.id === _studyState.selectedId)) _studyState.selectedId = filtered[0]?.id || "";
    const selected = filtered.find(item => item.id === _studyState.selectedId) || filtered[0] || null;
    const visible = filtered.slice(0, _studyState.visible);

    root.innerHTML = `
      <div class="tm-library tm-study tm-shell tm-reveal">
        <section class="tm-editorial-panel tm-library-hero">
          <p class="tm-tech-kicker">Base études Belgique / France</p>
          <h3>Choisir une filière, comprendre les écoles, anticiper les débouchés.</h3>
          <p class="tm-tech-muted">V1 pédagogique : les données restent volontairement prudentes. Les admissions et programmes doivent être confirmés sur les sites officiels.</p>
        </section>
        <div class="tm-library-controls">
          <label class="field"><input type="search" data-study-search placeholder="Rechercher école, ville, logiciel, domaine..." value="${_esc(_studyState.query)}" autocomplete="off"></label>
          <label class="field"><span>Pays</span><select data-study-country>${_selectOptions(_unique(DATA_ETUDES_FILIERES, "pays"), _studyState.country)}</select></label>
          <label class="field"><span>Filière</span><select data-study-sector>${_selectOptions(_unique(DATA_ETUDES_FILIERES, "nom"), _studyState.sector)}</select></label>
          <label class="field"><span>Ville</span><select data-study-city>${_selectOptions(_unique(DATA_ETUDES_ECOLES, "ville"), _studyState.city)}</select></label>
        </div>
        <div class="tm-library-layout">
          <div>
            <div class="tm-library-grid">
              ${visible.length ? visible.map(_renderStudyCard).join("") : `<div class="tm-tech-empty"><strong>Aucune filière</strong><p>Aucune filière ne correspond aux filtres.</p></div>`}
            </div>
            ${filtered.length > visible.length ? `<button type="button" class="text-btn tm-library-more" data-study-more>Voir plus de filières</button>` : ""}
          </div>
          ${_renderStudyDetail(selected)}
        </div>
      </div>
    `;
    _restoreLibraryFocus(root, focus);
  }

  function bindEtudes(root) {
    if (!root || root.dataset.etudesBound) return;
    root.dataset.etudesBound = "true";
    root.addEventListener("input", e => {
      const input = e.target.closest("[data-study-search]");
      if (!input) return;
      _studyState.query = input.value || "";
      _studyState.visible = ETUDES_PAGE_SIZE;
      renderEtudes(root);
    });
    root.addEventListener("change", e => {
      const country = e.target.closest("[data-study-country]");
      const sector = e.target.closest("[data-study-sector]");
      const city = e.target.closest("[data-study-city]");
      if (!country && !sector && !city) return;
      if (country) _studyState.country = country.value;
      if (sector) _studyState.sector = sector.value;
      if (city) _studyState.city = city.value;
      _studyState.visible = ETUDES_PAGE_SIZE;
      renderEtudes(root);
    });
    root.addEventListener("click", e => {
      const card = e.target.closest("[data-study-card]");
      const school = e.target.closest("[data-study-school]");
      const more = e.target.closest("[data-study-more]");
      if (card) _studyState.selectedId = card.dataset.studyCard;
      if (school) _studyState.selectedSchoolId = school.dataset.studySchool;
      if (more) _studyState.visible += ETUDES_PAGE_SIZE;
      if (card || school || more) renderEtudes(root);
    });
  }

  function initEtudes() {
    const root = document.getElementById("etudes-layout");
    if (!root) return;
    renderEtudes(root);
    bindEtudes(root);
  }

  function _cityText(item) {
    return normalizeText([
      item.pays,
      item.ville,
      item.région,
      item.langue,
      item.typeZone,
      item.densitéUrbaine,
      item.hauteurIndicative,
      item.reculIndicatif,
      item.stationnement,
      item.accessibilité,
      item.espacesVerts,
      item.normesFeu,
      item.acoustique,
      item.énergie,
      item.toiture,
      item.façade,
      item.matériauxCourants,
      item.contraintesClimatiques,
      item.documentsOfficiels,
      item.notes,
      item.statut
    ].flat().join(" "));
  }

  function _filterCities() {
    const q = normalizeText(_cityState.query);
    return DATA_CITY_STANDARDS.filter(item => {
      const countryMatch = !_cityState.country || item.pays === _cityState.country;
      const zoneMatch = !_cityState.zone || item.typeZone === _cityState.zone;
      const searchMatch = !q || _cityText(item).includes(q);
      return countryMatch && zoneMatch && searchMatch;
    });
  }

  function _renderCityCountryCard(country, count) {
    const active = _cityState.country === country;
    return `
      <button type="button" class="tm-city-country ${active ? "is-active" : ""}" data-city-country-card="${_esc(country)}">
        <span>${_esc(country)}</span>
        <strong>${count}</strong>
        <small>villes</small>
      </button>
    `;
  }

  function _renderCityCard(item) {
    return `
      <article class="tm-library-card tm-city-card ${item.id === _cityState.selectedId ? "is-active" : ""}" data-city-card="${_esc(item.id)}" tabindex="0">
        <p class="tm-tech-kicker">${_esc(item.pays)} · ${_esc(item.région)}</p>
        <h3>${_esc(item.ville)}</h3>
        <p>${_esc(item.typeZone)} · ${_esc(item.densitéUrbaine)}</p>
        <div class="tm-tech-badges">
          <span>${_esc(item.statut)}</span>
          <span>${_esc(item.hauteurIndicative)}</span>
        </div>
      </article>
    `;
  }

  function _renderCitySection(title, rows) {
    return `
      <section class="tm-city-section">
        <p class="tm-tech-kicker">${_esc(title)}</p>
        <dl>
          ${rows.map(([label, value]) => `
            <div>
              <dt>${_esc(label)}</dt>
              <dd>${Array.isArray(value) ? value.map(v => _esc(v)).join(" · ") : _esc(value)}</dd>
            </div>
          `).join("")}
        </dl>
      </section>
    `;
  }

  function _renderCityDetail(item) {
    if (!item) {
      return `<article class="tm-library-detail"><div class="tm-tech-empty"><strong>Aucune ville</strong><p>Aucune ville ne correspond aux filtres.</p></div></article>`;
    }
    return `
      <article class="tm-library-detail tm-city-detail">
        <p class="tm-tech-kicker">Fiche ville · ${_esc(item.statut)}</p>
        <h3>${_esc(item.ville)}</h3>
        <p class="tm-library-lead">${_esc(item.pays)} · ${_esc(item.région)} · ${_esc(item.typeZone)}</p>
        <div class="tm-library-matrix">
          <div><span>Densité</span><strong>${_esc(item.densitéUrbaine)}</strong></div>
          <div><span>Langue</span><strong>${_esc(item.langue)}</strong></div>
          <div><span>Hauteur</span><strong>${_esc(item.hauteurIndicative)}</strong></div>
          <div><span>Recul</span><strong>${_esc(item.reculIndicatif)}</strong></div>
        </div>
        ${_renderCitySection("Urbanisme général", [
          ["Tissu urbain", item.typeZone],
          ["Densité", item.densitéUrbaine],
          ["Patrimoine / notes", item.notes],
          ["Contraintes climatiques", item.contraintesClimatiques]
        ])}
        ${_renderCitySection("Construction / dimensions", [
          ["Hauteur indicative", item.hauteurIndicative],
          ["Recul indicatif", item.reculIndicatif],
          ["Stationnement", item.stationnement],
          ["Façade", item.façade],
          ["Matériaux courants", item.matériauxCourants]
        ])}
        ${_renderCitySection("Accessibilité", [
          ["PMR / cheminements", item.accessibilité],
          ["Espaces verts", item.espacesVerts]
        ])}
        ${_renderCitySection("Énergie / écologie", [
          ["Énergie", item.énergie],
          ["Toiture", item.toiture],
          ["Acoustique", item.acoustique]
        ])}
        ${_renderCitySection("Sécurité", [
          ["Incendie", item.normesFeu],
          ["Documents à vérifier", item.documentsOfficiels]
        ])}
        <section class="tm-city-section">
          <p class="tm-tech-kicker">Liens officiels</p>
          <div class="tm-study-school-list">
            ${item.liensUtiles.map(link => `
              <button type="button" data-external-url="${_esc(link.url)}">
                <strong>${_esc(link.label)}</strong>
                <span>${_esc(link.type)} · ouvrir lien officiel</span>
              </button>
            `).join("") || `<p class="tm-tech-muted">Lien officiel à ajouter après vérification.</p>`}
          </div>
        </section>
        <p class="tm-library-warning">${_esc(CITY_WARNING)}</p>
      </article>
    `;
  }

  function renderFiches(root) {
    if (!root) return;
    const focus = _captureLibraryFocus(root, "[data-city-search]");
    const filtered = _filterCities();
    if (!filtered.some(item => item.id === _cityState.selectedId)) _cityState.selectedId = filtered[0]?.id || "";
    const selected = filtered.find(item => item.id === _cityState.selectedId) || filtered[0] || null;
    const visibleCards = filtered.slice(0, _cityState.visible);
    const countsByCountry = DATA_CITY_STANDARDS.reduce((acc, item) => {
      acc[item.pays] = (acc[item.pays] || 0) + 1;
      return acc;
    }, {});

    root.innerHTML = `
      <div class="tm-library tm-city-standards tm-shell tm-reveal">
        <section class="tm-editorial-panel tm-library-hero tm-city-hero">
          <p class="tm-tech-kicker">Normothèque urbaine</p>
          <h3>Comparer les contraintes de conception par pays, ville et tissu urbain.</h3>
          <p class="tm-tech-muted">Base V1 pour orienter la recherche réglementaire : chaque projet doit être vérifié auprès des services compétents.</p>
          <div class="tm-city-countries">
            ${_unique(DATA_CITY_STANDARDS, "pays").map(country => _renderCityCountryCard(country, countsByCountry[country] || 0)).join("")}
          </div>
        </section>
        <div class="tm-library-controls">
          <label class="field"><input type="search" data-city-search placeholder="Rechercher ville, pays, zone, contrainte..." value="${_esc(_cityState.query)}" autocomplete="off"></label>
          <label class="field"><span>Pays</span><select data-city-country>${_selectOptions(_unique(DATA_CITY_STANDARDS, "pays"), _cityState.country)}</select></label>
          <label class="field"><span>Type de zone</span><select data-city-zone>${_selectOptions(_unique(DATA_CITY_STANDARDS, "typeZone"), _cityState.zone)}</select></label>
        </div>
        <div class="tm-library-layout">
          <div>
            <div class="tm-library-grid">
              ${visibleCards.length ? visibleCards.map(_renderCityCard).join("") : `<div class="tm-tech-empty"><strong>Aucune ville</strong><p>Aucune ville ne correspond aux filtres.</p></div>`}
            </div>
            ${filtered.length > visibleCards.length ? `<button type="button" class="text-btn tm-library-more" data-city-more>Voir plus de villes</button>` : ""}
          </div>
          ${_renderCityDetail(selected)}
        </div>
      </div>
    `;
    _restoreLibraryFocus(root, focus);
  }

  function bindFiches(root) {
    if (!root || root.dataset.fichesBound) return;
    root.dataset.fichesBound = "true";
    root.addEventListener("input", e => {
      const input = e.target.closest("[data-city-search]");
      if (!input) return;
      _cityState.query = input.value || "";
      _cityState.visible = CITY_PAGE_SIZE;
      renderFiches(root);
    });
    root.addEventListener("change", e => {
      const country = e.target.closest("[data-city-country]");
      const zone = e.target.closest("[data-city-zone]");
      if (!country && !zone) return;
      if (country) _cityState.country = country.value;
      if (zone) _cityState.zone = zone.value;
      _cityState.visible = CITY_PAGE_SIZE;
      renderFiches(root);
    });
    root.addEventListener("click", e => {
      const countryCard = e.target.closest("[data-city-country-card]");
      const card = e.target.closest("[data-city-card]");
      const more = e.target.closest("[data-city-more]");
      if (countryCard) {
        const next = countryCard.dataset.cityCountryCard || "";
        _cityState.country = _cityState.country === next ? "" : next;
        _cityState.visible = CITY_PAGE_SIZE;
      }
      if (card) _cityState.selectedId = card.dataset.cityCard;
      if (more) _cityState.visible += CITY_PAGE_SIZE;
      if (countryCard || card || more) renderFiches(root);
    });
    root.addEventListener("keydown", e => {
      const card = e.target.closest("[data-city-card]");
      if (!card || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      _cityState.selectedId = card.dataset.cityCard;
      renderFiches(root);
    });
  }

  function initFiches() {
    const root = document.getElementById("fiches-layout");
    if (!root) return;
    renderFiches(root);
    bindFiches(root);
  }

  (function injectLibraryCSS() {
    if (document.getElementById("tm-library-css")) return;
    const s = document.createElement("style");
    s.id = "tm-library-css";
    s.textContent = `
      .tm-library { display:grid; gap:1rem; min-width:0; }
      .tm-library-hero {
        display:grid;
        gap:.7rem;
        background:
          linear-gradient(90deg, rgba(201,169,110,.08), transparent 34%),
          repeating-linear-gradient(0deg, rgba(245,245,241,.025) 0 1px, transparent 1px 28px),
          var(--module-surface);
      }
      .tm-library-hero h3 {
        margin:0;
        font-family:var(--serif);
        font-size:clamp(1.8rem,3vw,2.8rem);
        font-weight:300;
        line-height:1.04;
      }
      .tm-library-controls {
        display:grid;
        grid-template-columns:minmax(240px,1.5fr) repeat(3,minmax(150px,.6fr));
        gap:.75rem;
      }
      .tm-library-layout {
        display:grid;
        grid-template-columns:minmax(0,1fr) minmax(300px,.42fr);
        gap:1rem;
        align-items:start;
      }
      .tm-library-grid {
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(230px,1fr));
        gap:1rem;
      }
      .tm-library-card,
      .tm-library-detail {
        border:var(--border);
        border-radius:var(--r-lg);
        background:var(--surface);
      }
      .tm-library-card {
        display:grid;
        gap:.65rem;
        padding:1rem;
        cursor:pointer;
        transition:border-color .18s ease, transform .18s ease, background .18s ease;
      }
      .tm-library-card:hover,
      .tm-library-card.is-active {
        border-color:rgba(201,169,110,.42);
        background:var(--gold-glow);
        transform:translateY(-1px);
      }
      .tm-library-card h3,
      .tm-library-detail h3 {
        margin:0;
        font-family:var(--serif);
        font-weight:300;
        line-height:1.05;
        color:var(--ink);
      }
      .tm-library-card h3 { font-size:1.42rem; }
      .tm-library-detail h3 { font-size:2rem; }
      .tm-library-card p,
      .tm-library-detail p,
      .tm-library-detail li {
        color:var(--muted);
        font-size:.75rem;
        line-height:1.55;
      }
      .tm-library-detail {
        position:sticky;
        top:88px;
        display:grid;
        gap:1rem;
        padding:1.1rem;
        max-height:calc(100vh - 112px);
        overflow:auto;
      }
      .tm-library-lead { color:var(--ink-2) !important; }
      .tm-library-matrix,
      .tm-library-columns {
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:.7rem;
      }
      .tm-library-matrix div,
      .tm-library-note {
        border:var(--border);
        border-radius:var(--r-md);
        padding:.75rem;
        background:var(--surface-2);
      }
      .tm-library-matrix span {
        display:block;
        color:var(--muted);
        font-size:.56rem;
        letter-spacing:.12em;
        text-transform:uppercase;
      }
      .tm-library-matrix strong {
        display:block;
        margin-top:.28rem;
        color:var(--ink-2);
        font-size:.78rem;
        font-weight:400;
      }
      .tm-study-school-list { display:grid; gap:.45rem; }
      .tm-study-school-list button {
        display:grid;
        gap:.2rem;
        text-align:left;
        border:var(--border);
        border-radius:var(--r-md);
        padding:.7rem;
        background:var(--surface-2);
      }
      .tm-study-school-list button:hover,
      .tm-study-school-list button.is-active {
        border-color:rgba(201,169,110,.38);
        background:var(--gold-glow);
      }
      .tm-study-school-list strong { color:var(--ink); font-weight:400; }
      .tm-study-school-list span { color:var(--muted); font-size:.65rem; }
      .tm-library-warning {
        border:var(--border-gold);
        border-radius:var(--r-md);
        padding:.8rem;
        background:var(--gold-glow);
        color:var(--ink-2) !important;
      }
      .tm-city-countries {
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:.65rem;
        margin-top:.35rem;
      }
      .tm-city-country {
        display:grid;
        gap:.18rem;
        text-align:left;
        border:var(--border);
        border-radius:var(--r-md);
        padding:.85rem;
        background:var(--surface);
        color:var(--ink);
        transition:border-color .18s ease, background .18s ease, transform .18s ease;
      }
      .tm-city-country:hover,
      .tm-city-country.is-active {
        border-color:rgba(201,169,110,.42);
        background:var(--gold-glow);
        transform:translateY(-1px);
      }
      .tm-city-country span {
        font-family:var(--serif);
        font-size:1.25rem;
        line-height:1;
      }
      .tm-city-country strong {
        color:var(--gold);
        font-size:1.5rem;
        font-weight:400;
      }
      .tm-city-country small,
      .tm-city-section dt {
        color:var(--muted);
        font-size:.56rem;
        letter-spacing:.12em;
        text-transform:uppercase;
      }
      .tm-city-card .tm-tech-badges span:first-child {
        border-color:rgba(201,169,110,.36);
        color:var(--gold);
      }
      .tm-city-section {
        display:grid;
        gap:.65rem;
        border:var(--border);
        border-radius:var(--r-md);
        padding:.85rem;
        background:var(--surface-2);
      }
      .tm-city-section dl,
      .tm-city-section div {
        display:grid;
        gap:.35rem;
        margin:0;
      }
      .tm-city-section dd {
        margin:0;
        color:var(--ink-2);
        font-size:.75rem;
        line-height:1.55;
      }
      .tm-library-more { margin-top:1rem; width:100%; justify-content:center; }
      .tm-fiche-card { grid-template-rows:auto auto auto 1fr auto; }
      .tm-fiche-sketch,
      .tm-fiche-large-sketch {
        color:var(--gold);
        border:var(--border);
        border-radius:var(--r-md);
        background:
          linear-gradient(90deg, rgba(245,245,241,.04) 1px, transparent 1px),
          linear-gradient(rgba(245,245,241,.035) 1px, transparent 1px),
          var(--surface-2);
        background-size:24px 24px;
        overflow:hidden;
      }
      .tm-fiche-sketch svg { width:100%; height:96px; opacity:.78; }
      .tm-fiche-large-sketch svg { width:100%; height:180px; opacity:.82; }
      @media (max-width:1100px) {
        .tm-library-controls,
        .tm-library-layout,
        .tm-library-matrix,
        .tm-library-columns,
        .tm-city-countries { grid-template-columns:1fr; }
        .tm-library-detail { position:static; max-height:none; }
      }
    `;
    document.head.appendChild(s);
  })();

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

  const DATA_CHRONOS_EXPANDED = [
    ...DATA_CHRONOS,
    { id: "egypte-antique", periode: "Égypte antique", dates: "-3000 / -332", materiau: "Pierre", systeme: "Masse lithique, colonnes, linteaux", portee: "Faible à moyenne", inertie: "Très forte", outil: "Rampe, traîneau, taille pierre", rupture: "Monumentalité par géométrie, axe et masse.", consequenceSpatiale: "Séquences axiales, salles hypostyles, seuils compressés.", exemples: "Karnak, Louxor, Gizeh", tags: ["pierre", "axe", "masse"] },
    { id: "baroque", periode: "Baroque", dates: "1600 / 1750", materiau: "Pierre", systeme: "Maçonnerie courbe, coupoles, stucs", portee: "Moyenne", inertie: "Forte", outil: "Stéréotomie, perspective, chantier artisanal", rupture: "Mouvement spatial et scénographie lumineuse.", consequenceSpatiale: "Plans ovales, axes obliques, espaces dynamiques.", exemples: "San Carlo alle Quattro Fontane, Versailles", tags: ["scénographie", "courbe"] },
    { id: "arts-crafts", periode: "Arts & Crafts", dates: "1860 / 1910", materiau: "Bois", systeme: "Charpente artisanale, brique, menuiserie", portee: "Faible à moyenne", inertie: "Moyenne", outil: "Atelier, assemblage, artisanat", rupture: "Réaction qualitative à l'industrie.", consequenceSpatiale: "Maisons domestiques, détails visibles, intérieur intégré.", exemples: "Red House, maisons de Voysey", tags: ["artisanat", "bois"] },
    { id: "bauhaus", periode: "Bauhaus", dates: "1919 / 1933", materiau: "Acier / verre", systeme: "Ossature, façade rideau, plan rationnel", portee: "Moyenne", inertie: "Faible", outil: "Prototype, standard, dessin industriel", rupture: "Fusion pédagogie, production et spatialité moderne.", consequenceSpatiale: "Ateliers lumineux, plateaux, transparence fonctionnelle.", exemples: "Bauhaus Dessau, maisons de maîtres", tags: ["standard", "verre"] },
    { id: "deconstructivisme", periode: "Déconstructivisme", dates: "1980 / 2010", materiau: "Acier / béton", systeme: "Trames déformées, coques, volumes fragmentés", portee: "Variable", inertie: "Variable", outil: "Modélisation 3D, acier complexe", rupture: "Fragmentation de l'ordre orthogonal.", consequenceSpatiale: "Parcours instables, volumes obliques, enveloppes pliées.", exemples: "Guggenheim Bilbao, Vitra Fire Station", tags: ["fragment", "acier"] },
    { id: "durable-contemporain", periode: "Architecture durable contemporaine", dates: "1990 / aujourd'hui", materiau: "Hybride", systeme: "Bioclimatique, enveloppes performantes, réemploi", portee: "Moyenne", inertie: "Optimisée", outil: "Simulation thermique, ACV, BIM", rupture: "Climat, énergie et carbone deviennent générateurs.", consequenceSpatiale: "Épaisseurs habitées, ventilation naturelle, sobriété constructive.", exemples: "BedZED, Vorarlberg, quartiers passifs", tags: ["bioclimatique", "ACV"] },
    { id: "architecture-ia", periode: "Architecture numérique / IA", dates: "2020 / demain", materiau: "Hybride / réemploi", systeme: "Conception assistée, optimisation, fabrication robotisée", portee: "Variable", inertie: "Calculée", outil: "IA, BIM, scan 3D, robotique", rupture: "Décision et variante deviennent des objets de calcul.", consequenceSpatiale: "Systèmes adaptatifs, détails paramétrés, optimisation matière.", exemples: "Recherche IA, fabrication additive, jumeaux numériques", tags: ["IA", "numérique", "optimisation"] }
  ].map(item => ({
    ...item,
    nom: item.nom || item.periode,
    periodeHistorique: item.periodeHistorique || item.periode,
    materiauDominant: item.materiauDominant || item.materiau,
    systèmesConstructifs: item.systèmesConstructifs || item.systeme,
    systemesConstructifs: item.systemesConstructifs || item.systeme,
    porteeTypique: item.porteeTypique || item.portee,
    portéeTypique: item.portéeTypique || item.portee,
    outilsChantier: item.outilsChantier || item.outil,
    innovationTechnique: item.innovationTechnique || item.rupture,
    contrainteStructurelle: item.contrainteStructurelle || item.systeme,
    exemplesArchitecturaux: item.exemplesArchitecturaux || item.exemples,
    architectesLies: item.architectesLies || item.exemples
  }));

  const _atlasVisualIntro = ({ filtered = [], selected = null } = {}) => `
    <section class="tm-editorial-panel tm-atlas-map tm-atlas-hero" aria-label="Atlas architectural mondial">
      <div class="tm-atlas-hero-copy">
        <p class="tm-tech-kicker">Atlas architectural</p>
        <h3>Explorer le monde par climat, matière et système constructif.</h3>
        <p class="tm-tech-muted">Une lecture d’atlas ancien modernisé : chaque lieu relie sol, climat, inertie, portée et leçon constructive pour le projet contemporain.</p>
        <div class="tm-atlas-stats" aria-label="Statistiques Atlas">
          <span><strong>${_esc(filtered.length)}</strong> systèmes visibles</span>
          <span><strong>${_esc(selected?.continent || "Monde")}</strong> zone active</span>
          <span><strong>${_esc(selected?.materiauDominant || selected?.matiere || "Matières")}</strong></span>
        </div>
      </div>
      <div class="tm-atlas-globe" aria-hidden="true">
        <svg viewBox="0 0 360 260" role="img">
          <defs>
            <linearGradient id="atlasGold" x1="0" x2="1">
              <stop offset="0" stop-color="#C9A96E" stop-opacity=".18"/>
              <stop offset="1" stop-color="#F5F5F1" stop-opacity=".08"/>
            </linearGradient>
          </defs>
          <ellipse cx="180" cy="130" rx="134" ry="92" fill="url(#atlasGold)" stroke="#C9A96E" stroke-opacity=".42"/>
          <path d="M46 130h268M180 38v184M82 78c56 18 130 18 196 0M82 182c56-18 130-18 196 0"
                fill="none" stroke="#F5F5F1" stroke-opacity=".16"/>
          <path d="M112 116l44-34 46 20 38-28 46 42-28 58-66 12-44-26-42 18-30-34z"
                fill="rgba(201,169,110,.12)" stroke="#C9A96E" stroke-opacity=".44"/>
          <circle cx="128" cy="118" r="4" fill="#C9A96E"/>
          <circle cx="178" cy="92" r="3" fill="#C9A96E"/>
          <circle cx="220" cy="154" r="3.5" fill="#C9A96E"/>
          <circle cx="258" cy="106" r="3" fill="#C9A96E"/>
        </svg>
      </div>
    </section>
  `;

  const _chronosVisualIntro = ({ filtered = [] } = {}) => `
    <section class="tm-editorial-panel tm-chronos-spine tm-chronos-hero" aria-label="Ligne du temps constructive">
      <div class="tm-chronos-spine__head">
        <p class="tm-tech-kicker">Frise matière-époque</p>
        <h3>Lire l’histoire par la portée, l’outil et la matière.</h3>
        <p class="tm-tech-muted">${_esc(filtered.length)} périodes techniques visibles. Sélectionnez une époque, puis comparez deux périodes pour mesurer les ruptures.</p>
      </div>
      <div class="tm-chronos-track" aria-label="Repères de la frise matière-époque">
        ${[
          ["Origines", "Pierre massive"],
          ["Antiquité", "Voûtes et ordres"],
          ["Industrie", "Acier et verre"],
          ["Moderne", "Béton armé"],
          ["Numérique", "Paramétrique"],
          ["Bas-carbone", "Biosourcé"]
        ].map(([era, matter], index) => `
          <span class="tm-chronos-era" data-chronos-era="${_esc(era)}" style="--i:${index}">
            <strong>${_esc(era)}</strong>
            <small>${_esc(matter)}</small>
          </span>
        `).join("")}
      </div>
      <div class="tm-chronos-spine__stats" aria-label="Lecture rapide Chronos">
        <span>${_esc(filtered.length)} périodes</span>
        <span>matière dominante</span>
        <span>portée typique</span>
        <span>rupture technique</span>
      </div>
    </section>
  `;

  const _pantheonVisualIntro = ({ data = [], state = {} } = {}) => `
    <section class="tm-editorial-panel tm-pantheon-gallery tm-pantheon-archive" aria-label="Galerie des doctrines">
      <p class="tm-tech-kicker">Archive vivante</p>
      <h3>Une galerie d’architectes classée par doctrines, matières et héritages.</h3>
      <nav class="tm-pantheon-movement-nav" aria-label="Navigation par époque">
        ${_uniqueValues(data, "epoque").map(value => `
          <button type="button"
                  class="tm-tech-chip ${state.filters?.epoque === value ? "is-active" : ""}"
                  data-tech-chip
                  data-tech-filter="epoque"
                  data-tech-value="${_esc(value)}">${_esc(value)}</button>
        `).join("")}
      </nav>
    </section>
  `;

  const _atlasOptions = {
    id: "atlas",
    visualIntro: _atlasVisualIntro,
    titleKey: "titre",
    subtitleKeys: ["continent", "pays", "periode"],
    searchPlaceholder: "Rechercher lieu, matière, climat...",
    listClass: "tm-atlas-grid-systems",
    filters: [
      { key: "continent", label: "Continent" },
      { key: "materiauDominant", label: "Matériau" },
      { key: "climat", label: "Climat" },
      { key: "periode", label: "Période" },
      { key: "systemeConstructif", label: "Système" },
      { key: "risqueNaturel", label: "Risque naturel" }
    ],
    fields: [
      { key: "lieu", label: "Lieu" },
      { key: "continent", label: "Continent" },
      { key: "pays", label: "Pays" },
      { key: "region", label: "Région / ville" },
      { key: "climat", label: "Climat" },
      { key: "periode", label: "Période" },
      { key: "systemeConstructif", label: "Système constructif" },
      { key: "materiauDominant", label: "Matière dominante" },
      { key: "typeHabitat", label: "Type d'habitat" },
      { key: "portee", label: "Portée" },
      { key: "inertie", label: "Inertie" },
      { key: "ventilation", label: "Ventilation" },
      { key: "isolation", label: "Isolation" },
      { key: "risqueNaturel", label: "Risque naturel" },
      { key: "contraintePrincipale", label: "Contrainte principale" }
    ],
    tag: item => item.materiauDominant || item.matiere,
    detailKicker: item => item.climat,
    lesson: item => item.leconArchitecturale || item.lecon,
    emptyTitle: "Aucun système",
    emptyText: "Aucun système constructif ne correspond aux filtres."
  };

  const _chronosOptions = {
    id: "chronos",
    visualIntro: _chronosVisualIntro,
    titleKey: "nom",
    subtitleKeys: ["dates", "materiauDominant", "systemesConstructifs"],
    searchPlaceholder: "Rechercher période, matériau, rupture...",
    compare: true,
    layout: "timeline",
    listClass: "tm-chronos-timeline",
    filters: [{ key: "materiauDominant", label: "Matériau" }],
    fields: [
      { key: "dates", label: "Dates" },
      { key: "periodeHistorique", label: "Période historique" },
      { key: "materiauDominant", label: "Matériau dominant" },
      { key: "systemesConstructifs", label: "Système structurel" },
      { key: "porteeTypique", label: "Portée typique" },
      { key: "inertie", label: "Inertie" },
      { key: "outilsChantier", label: "Outil de chantier" },
      { key: "innovationTechnique", label: "Innovation technique" },
      { key: "contrainteStructurelle", label: "Contrainte structurelle" },
      { key: "consequenceSpatiale", label: "Conséquence spatiale" },
      { key: "exemplesArchitecturaux", label: "Exemples" },
      { key: "architectesLies", label: "Architectes liés" }
    ],
    tag: item => item.materiauDominant || item.materiau,
    detailKicker: item => item.dates,
    lesson: item => item.consequenceSpatiale,
    emptyTitle: "Aucune période",
    emptyText: "Aucune période ne correspond aux filtres."
  };

  const _pantheonOptions = {
    id: "pantheon",
    visualIntro: _pantheonVisualIntro,
    controlsClass: "tm-tech-controls--pantheon",
    titleKey: "nom",
    subtitleKeys: ["epoque", "pays", "doctrine"],
    searchPlaceholder: "Rechercher architecte, pays, doctrine...",
    layout: "archive",
    listClass: "tm-pantheon-figure-grid",
    filters: [
      { key: "epoque", label: "Époque" },
      { key: "pays", label: "Pays" },
      { key: "mouvement", label: "Mouvement" },
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
      { key: "apportTechnique", label: "Apport technique" },
      { key: "philosophie", label: "Philosophie" },
      { key: "influence", label: "Influence" },
      { key: "architectesLies", label: "Architectes liés" }
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
    renderTechnicalCards(root, DATA_ATLAS_EXPANDED, _atlasOptions);
    _bindTechnicalModule(root, DATA_ATLAS_EXPANDED, _atlasOptions);
  }

  function initChronos() {
    const root = document.getElementById("chronos-layout");
    if (!root) return;
    renderTechnicalCards(root, DATA_CHRONOS_EXPANDED, _chronosOptions);
    _bindTechnicalModule(root, DATA_CHRONOS_EXPANDED, _chronosOptions);
  }

  function initPantheon() {
    const root = document.getElementById("pantheon-grid");
    if (!root) return;
    renderTechnicalCards(root, DATA_PANTHEON_EXPANDED, _pantheonOptions);
    _bindTechnicalModule(root, DATA_PANTHEON_EXPANDED, _pantheonOptions);
  }

  /* ── Hooks MutationObserver — modules data-driven ──────────── */
  (function hookGridModules() {
    [
      { mod: "module-pantheon", render: initPantheon },
      { mod: "module-atlas",    render: initAtlas },
      { mod: "module-fiches",   render: initFiches },
      { mod: "module-etudes",   render: initEtudes },
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
        border: var(--border);
        border-radius: 16px;
        background: var(--surface);
        align-content: start;
      }
      .tm-normes-cats-title {
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: .56rem;
        font-weight: 500;
        letter-spacing: .17em;
        text-transform: uppercase;
        color: var(--muted);
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
        background: var(--gold-glow);
        border-color: rgba(201,169,110,.14);
      }
      .tm-normes-cat-btn.is-active {
        background: var(--gold-dim);
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
        background: var(--gold);
        box-shadow: 0 0 6px rgba(201,169,110,.5);
      }
      .tm-normes-cat-text { display: grid; gap: 2px; }
      .tm-normes-cat-label {
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: .80rem;
        font-weight: 400;
        color: var(--ink-2);
        line-height: 1;
      }
      .tm-normes-cat-btn.is-active .tm-normes-cat-label { color: var(--ink); }
      .tm-normes-cat-count {
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: .58rem;
        color: var(--muted);
        line-height: 1;
      }
      .tm-normes-panel { display: grid; gap: .85rem; align-content: start; }
      .tm-normes-header {
        padding-bottom: .72rem;
        border-bottom: var(--border);
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
        border: var(--border);
        border-radius: 14px;
        background: var(--surface-2);
        transition: border-color .18s ease;
      }
      .tm-normes-item:hover { border-color: rgba(201,169,110,.28); }
      .tm-normes-dim {
        font-family: "Cormorant Garamond", Georgia, serif;
        font-size: 1.75rem;
        font-weight: 300;
        color: var(--gold);
        line-height: 1;
        margin: 0;
      }
      .tm-normes-nom {
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: .80rem;
        font-weight: 400;
        color: var(--ink);
        margin: 0;
      }
      .tm-normes-note {
        font-family: "DM Sans", system-ui, sans-serif;
        font-size: .70rem;
        font-weight: 300;
        color: var(--muted);
        line-height: 1.55;
        margin: 0;
      }
      .tm-normes-tags { display:flex; flex-wrap:wrap; gap:.26rem; margin-top:.1rem; }
      .tm-normes-tag {
        padding:.12rem .38rem;
        border:0.5px solid rgba(201,169,110,.18);
        border-radius:999px;
        color:var(--gold);
        font-size:.54rem;
        letter-spacing:.07em;
        text-transform:uppercase;
      }
      .tm-outils-stack { display:grid; gap:1.2rem; }
      .tm-tools-scale-grid { display:grid; grid-template-columns:minmax(0,1fr) minmax(160px,.55fr) minmax(0,1fr) auto; gap:.72rem; align-items:end; }
      .tm-tools-scale-chips { display:flex; flex-wrap:wrap; gap:.4rem; margin-top:.75rem; }
      .tm-tools-scale-chip {
        height:28px; padding:0 .68rem; border:var(--border); border-radius:999px;
        color:var(--muted); background:rgba(201,169,110,.04);
        font-size:.58rem; letter-spacing:.1em; text-transform:uppercase;
      }
      .tm-tools-scale-chip:hover { border-color:rgba(201,169,110,.35); color:var(--gold); }
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
  let DATA_NORMES = [
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

  const TOOLS_DIMENSION_CATALOG = {
    "Salon": ["Canapé 2 places|160 cm|180 cm|90 cm|80 cm|90 cm|180 cm", "Canapé 3 places|210 cm|240 cm|90 cm|82 cm|95 cm|240 cm", "Table basse|90 x 50 cm|120 x 70 cm|40 cm|38 cm|70 cm|120 cm", "Meuble TV|120 cm|180 cm|80 cm|45 cm|45 cm|180 cm", "Distance TV/canapé|200 cm|320 cm|0|0|0|320 cm", "Circulation salon|70 cm|90 cm|90 cm|0|0|90 cm", "Bibliothèque basse|100 cm|180 cm|80 cm|110 cm|35 cm|180 cm"],
    "Chambre": ["Lit simple|90 x 190 cm|90 x 200 cm|60 cm|55 cm|200 cm|90 cm", "Lit double|140 x 190 cm|160 x 200 cm|70 cm|55 cm|200 cm|160 cm", "Lit queen|160 x 200 cm|180 x 200 cm|75 cm|55 cm|200 cm|180 cm", "Table de nuit|35 x 35 cm|50 x 45 cm|40 cm|55 cm|45 cm|50 cm", "Armoire|P 60 cm|L 180 cm|90 cm|220 cm|60 cm|180 cm", "Bureau chambre|100 x 55 cm|120 x 60 cm|80 cm|75 cm|60 cm|120 cm", "Circulation lit|60 cm|75 cm|75 cm|0|0|75 cm"],
    "Cuisine": ["Plan de travail|H 90 cm|H 92 cm|90 cm|90 cm|60 cm|120 cm", "Meuble bas|P 60 cm|P 65 cm|90 cm|90 cm|60 cm|120 cm", "Meuble haut|P 35 cm|P 40 cm|50 cm|140 cm|40 cm|120 cm", "Îlot central|90 x 160 cm|100 x 220 cm|100 cm|92 cm|100 cm|220 cm", "Dégagement cuisine|90 cm|120 cm|120 cm|0|0|120 cm", "Triangle d’activité|4 m|7 m|0|0|0|700 cm", "Colonne four|60 x 60 cm|60 x 65 cm|100 cm|220 cm|65 cm|60 cm"],
    "Salle de bain": ["Douche standard|80 x 90 cm|90 x 120 cm|70 cm|210 cm|90 cm|120 cm", "Douche confortable|90 x 120 cm|100 x 140 cm|90 cm|210 cm|100 cm|140 cm", "Baignoire|70 x 170 cm|80 x 180 cm|70 cm|55 cm|80 cm|180 cm", "Meuble vasque|60 x 45 cm|120 x 50 cm|90 cm|90 cm|50 cm|120 cm", "Lavabo simple|50 cm|60 cm|70 cm|85 cm|45 cm|60 cm", "Sèche-serviette|45 cm|60 cm|60 cm|170 cm|10 cm|60 cm", "Dégagement lavabo|70 cm|90 cm|90 cm|0|0|90 cm"],
    "WC": ["WC standard|80 x 120 cm|90 x 140 cm|60 cm|40 cm|70 cm|90 cm", "WC PMR|150 x 150 cm|170 x 170 cm|150 cm|45 cm|70 cm|170 cm", "Lave-main|22 x 35 cm|30 x 45 cm|60 cm|85 cm|30 cm|45 cm", "Dégagement latéral|80 cm|90 cm|90 cm|0|0|90 cm", "Barre d’appui|60 cm|80 cm|0|75 cm|0|80 cm", "Porte ouvrant extérieur|83 cm|90 cm|90 cm|204 cm|0|90 cm", "Réserve papier|15 cm|25 cm|0|70 cm|12 cm|25 cm"],
    "Bureau": ["Bureau 120 x 60|120 x 60 cm|140 x 70 cm|90 cm|75 cm|70 cm|140 cm", "Bureau double|160 x 70 cm|180 x 80 cm|100 cm|75 cm|80 cm|180 cm", "Chaise bureau|45 x 45 cm|55 x 55 cm|90 cm|90 cm|55 cm|55 cm", "Recul chaise|80 cm|100 cm|100 cm|0|0|100 cm", "Écran|50 cm recul|70 cm recul|0|axe yeux|0|70 cm", "Caisson|40 x 50 cm|45 x 60 cm|60 cm|65 cm|60 cm|45 cm", "Rangement dossiers|P 35 cm|P 45 cm|80 cm|180 cm|45 cm|120 cm"],
    "Garage": ["Place voiture standard|250 x 500 cm|300 x 550 cm|70 cm|220 cm|500 cm|300 cm", "Place voiture confortable|300 x 550 cm|330 x 580 cm|90 cm|240 cm|580 cm|330 cm", "Porte garage|240 cm|300 cm|0|220 cm|0|300 cm", "Rangement vélo|60 x 180 cm|80 x 200 cm|90 cm|180 cm|200 cm|80 cm", "Établi garage|120 x 60 cm|180 x 75 cm|100 cm|90 cm|75 cm|180 cm", "Rayonnage|P 45 cm|P 60 cm|80 cm|200 cm|60 cm|120 cm", "Circulation latérale|70 cm|90 cm|90 cm|0|0|90 cm"],
    "Jardin / Terrasse": ["Table extérieure|160 x 90 cm|220 x 100 cm|100 cm|75 cm|100 cm|220 cm", "Chaise extérieure|55 x 60 cm|65 x 70 cm|70 cm|85 cm|70 cm|65 cm", "Passage terrasse|90 cm|120 cm|120 cm|0|0|120 cm", "Jardinière|P 40 cm|P 60 cm|60 cm|60 cm|60 cm|120 cm", "Barbecue|120 x 80 cm|160 x 90 cm|120 cm|110 cm|90 cm|160 cm", "Bain de soleil|70 x 190 cm|80 x 210 cm|80 cm|35 cm|210 cm|80 cm", "Pergola|250 x 300 cm|300 x 400 cm|120 cm|240 cm|400 cm|300 cm"],
    "Circulations": ["Couloir standard|90 cm|120 cm|0|0|0|120 cm", "Passage confortable|120 cm|140 cm|0|0|0|140 cm", "Porte standard|83 cm|90 cm|0|204 cm|0|90 cm", "Sas entrée|120 x 120 cm|150 x 150 cm|120 cm|0|150 cm|150 cm", "Dégagement meuble|70 cm|90 cm|90 cm|0|0|90 cm", "Hall commun|140 cm|180 cm|180 cm|0|0|180 cm", "Aire retournement|Ø 150 cm|Ø 170 cm|150 cm|0|0|170 cm"],
    "Accessibilité PMR": ["Rotation fauteuil Ø150 cm|150 cm|170 cm|150 cm|0|0|170 cm", "Porte 90 cm|90 cm|93 cm|0|204 cm|0|93 cm", "Rampe|5 %|4 %|120 cm|0|0|120 cm", "Interrupteur|90 cm|110 cm|0|110 cm|0|0", "Douche accessible|120 x 90 cm|140 x 120 cm|150 cm|210 cm|120 cm|140 cm", "Plan vasque PMR|70 cm libre|80 cm libre|90 cm|85 cm|50 cm|90 cm", "Transfert WC|80 cm|90 cm|90 cm|45 cm|0|90 cm"],
    "Escaliers": ["Hauteur marche|16 cm|17 cm|0|17 cm|0|0", "Giron|28 cm|30 cm|0|0|30 cm|0", "Formule Blondel|60 cm|64 cm|0|0|0|0", "Largeur escalier|80 cm|100 cm|0|0|0|100 cm", "Garde-corps|90 cm|100 cm|0|100 cm|0|0", "Palier|90 cm|120 cm|120 cm|0|120 cm|120 cm", "Échappée|190 cm|210 cm|0|210 cm|0|0"],
    "Portes & fenêtres": ["Porte intérieure|73 cm|83 cm|0|204 cm|0|83 cm", "Porte entrée|90 cm|100 cm|0|215 cm|0|100 cm", "Baie vitrée|180 cm|240 cm|120 cm|215 cm|0|240 cm", "Allège fenêtre|90 cm|100 cm|0|100 cm|0|0", "Poignée porte|90 cm|105 cm|0|105 cm|0|0", "Fenêtre chambre|100 x 120 cm|120 x 135 cm|80 cm|135 cm|0|120 cm", "Imposte|30 cm|45 cm|0|45 cm|0|120 cm"],
    "Restaurant / café": ["Table 2 personnes|70 x 70 cm|80 x 80 cm|80 cm|75 cm|80 cm|80 cm", "Table 4 personnes|120 x 80 cm|140 x 90 cm|90 cm|75 cm|90 cm|140 cm", "Allée service|90 cm|120 cm|120 cm|0|0|120 cm", "Comptoir bar|60 cm prof.|70 cm prof.|100 cm|110 cm|70 cm|200 cm", "Banquette|45 cm prof.|55 cm prof.|80 cm|90 cm|55 cm|180 cm", "Cuisine café|120 cm passage|150 cm passage|150 cm|0|0|150 cm", "Attente entrée|120 x 180 cm|180 x 220 cm|120 cm|0|220 cm|180 cm"],
    "Hôtel": ["Chambre compacte|12 m²|16 m²|90 cm|0|0|0", "Chambre double|18 m²|24 m²|100 cm|0|0|0", "Lit hôtel 160|160 x 200 cm|180 x 200 cm|80 cm|60 cm|200 cm|180 cm", "Couloir hôtel|120 cm|150 cm|0|0|0|150 cm", "Bagagerie|P 60 cm|P 80 cm|90 cm|90 cm|80 cm|120 cm", "Salle d'eau hôtel|90 x 160 cm|120 x 220 cm|90 cm|210 cm|220 cm|120 cm", "Desk accueil|180 cm|240 cm|120 cm|110 cm|70 cm|240 cm"],
    "Bibliothèque / espace d’étude": ["Table étude|120 x 70 cm|140 x 80 cm|90 cm|75 cm|80 cm|140 cm", "Place lecture|80 cm|100 cm|80 cm|0|80 cm|100 cm", "Rayonnage livres|P 30 cm|P 35 cm|90 cm|220 cm|35 cm|100 cm", "Allée rayonnage|90 cm|120 cm|120 cm|0|0|120 cm", "Carrel individuel|90 x 120 cm|100 x 140 cm|90 cm|140 cm|140 cm|100 cm", "Banque prêt|160 cm|220 cm|120 cm|105 cm|70 cm|220 cm", "Espace groupe|240 x 240 cm|320 x 320 cm|120 cm|0|320 cm|320 cm"],
    "Atelier / espace créatif": ["Table maquette|180 x 90 cm|240 x 120 cm|100 cm|90 cm|120 cm|240 cm", "Plan découpe|160 x 80 cm|220 x 100 cm|100 cm|92 cm|100 cm|220 cm", "Établi|140 x 70 cm|200 x 80 cm|100 cm|90 cm|80 cm|200 cm", "Stockage cartons|P 60 cm|P 80 cm|100 cm|220 cm|80 cm|180 cm", "Mur affichage|180 cm|300 cm|120 cm|220 cm|0|300 cm", "Zone critique projet|240 x 180 cm|360 x 240 cm|120 cm|0|240 cm|360 cm", "Circulation atelier|100 cm|140 cm|140 cm|0|0|140 cm"]
  };

  const DATA_TOOLS_DIMENSIONS = Object.entries(TOOLS_DIMENSION_CATALOG).flatMap(([categorie, rows]) =>
    rows.map((row, index) => {
      const [nom, dimensionMin, dimensionConfort, degagement, hauteur, profondeur, largeur] = row.split("|");
      const id = `${normalizeText(categorie)}-${normalizeText(nom)}`
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      return {
        id,
        catégorie: categorie,
        categorie,
        nom,
        dimensionMin,
        dimensionConfort,
        dégagement: degagement,
        degagement,
        hauteur,
        profondeur,
        largeur,
        valeur: dimensionConfort || dimensionMin,
        dir: /hauteur|rampe|garde|interrupteur|allège|échappée/i.test(nom) ? "v" : "h",
        note: `Repère ${categorie.toLowerCase()} à vérifier avec le programme, l'ergonomie et les normes locales.`,
        usage: categorie,
        tags: [categorie.toLowerCase(), normalizeText(nom).split(" ")[0] || "dimension", index < 2 ? "essentiel" : "référence"]
      };
    })
  );

  DATA_NORMES = getUniqueValues(DATA_TOOLS_DIMENSIONS, "categorie").map(label => ({
    id: normalizeText(label).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    label,
    kicker: "Dimensions, dégagements et normes d'usage",
    items: DATA_TOOLS_DIMENSIONS.filter(item => item.categorie === label)
  }));

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
          <div class="tm-dim-meta">
            <span>Min. ${_esc(item.dimensionMin || "—")}</span>
            <span>Confort ${_esc(item.dimensionConfort || item.valeur || "—")}</span>
            <span>Dégagement ${_esc(item.degagement || item.dégagement || "—")}</span>
          </div>
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
      <h3 style="font-family:var(--serif);font-size:1.7rem;font-weight:300;line-height:1;color:var(--ink);margin:0 0 .45rem">Du réel vers la feuille</h3>
      <p style="margin:0 0 1rem;color:var(--muted);font-size:.76rem;line-height:1.6">
        Entrez une mesure réelle, choisissez une échelle standard, puis obtenez directement la mesure à tracer sur le plan.
      </p>
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
          <span style="font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:.28rem">Échelle</span>
          <select id="tools-scale-denom" style="width:100%;background:var(--surface-2);border:var(--border);color:var(--ink);border-radius:var(--r-sm);padding:.62rem .75rem;font-size:.82rem;cursor:pointer">
            <option value="100" selected>1/100</option>
            <option value="50">1/50</option>
            <option value="20">1/20</option>
            <option value="10">1/10</option>
            <option value="5">1/5</option>
            <option value="200">1/200</option>
          </select>
        </label>
        <label class="field">
          <span style="font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:.28rem">Mesure sur feuille en mm</span>
          <input id="tools-scale-plan" type="number" min="0.001" step="any" placeholder="résultat" readonly style="width:100%" />
        </label>
        <button type="button" id="tools-scale-btn" class="text-btn text-btn--primary" style="white-space:nowrap">Convertir</button>
      </div>
      <div class="tm-tools-scale-chips" aria-label="Échelles rapides">
        <button type="button" class="tm-tools-scale-chip" data-tools-scale-preset="100">1/100</button>
        <button type="button" class="tm-tools-scale-chip" data-tools-scale-preset="50">1/50</button>
        <button type="button" class="tm-tools-scale-chip" data-tools-scale-preset="20">1/20</button>
        <button type="button" class="tm-tools-scale-chip" data-tools-scale-preset="10">1/10</button>
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
    const denomEl = root.querySelector("#tools-scale-denom");
    const errEl = root.querySelector("#tools-scale-error");
    const resEl = root.querySelector("#tools-scale-result");
    const mainEl = root.querySelector("#tools-scale-main");
    const nearestEl = root.querySelector("#tools-scale-nearest");

    if (!realEl || !unitEl || !planEl || !denomEl || !errEl || !resEl || !mainEl || !nearestEl) return;

    const realRaw = parseFloat(realEl.value);
    const unitMult = parseFloat(unitEl.value);
    const denom = parseFloat(denomEl.value);

    errEl.style.display = "none";
    resEl.style.display = "none";

    if (!realRaw || realRaw <= 0 || !denom || denom <= 0) {
      errEl.textContent = "Entrez une mesure réelle positive et une échelle valide.";
      errEl.style.display = "block";
      return;
    }

    const realMm = realRaw * unitMult;
    const paperMm = realMm / denom;
    const paperCm = paperMm / 10;
    const roundedMm = Math.round(paperMm * 100) / 100;

    planEl.value = String(roundedMm);
    mainEl.textContent = `${roundedMm.toLocaleString("fr-FR")} mm sur feuille`;
    nearestEl.textContent =
      `${realRaw.toLocaleString("fr-FR")} ${unitEl.options[unitEl.selectedIndex]?.text || "mm"} à l'échelle 1/${denom.toLocaleString("fr-FR")} · ${paperCm.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} cm`;

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
    root.querySelector("#tools-scale-denom")?.addEventListener("change", () => _calculateScale(root));
    root.querySelectorAll("[data-tools-scale-preset]").forEach(btn =>
      btn.addEventListener("click", () => {
        const select = root.querySelector("#tools-scale-denom");
        if (!select) return;
        select.value = btn.dataset.toolsScalePreset;
        _calculateScale(root);
      })
    );
    ["tools-scale-real"].forEach(id =>
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

  /* ── DATA_ECOLOGY — recommandations climat / ressources ─────── */
  const DATA_ECOLOGY = [
    { id: "eco-belgique", pays: "Belgique", region: "Bruxelles / Flandre / Wallonie", climat: "Océanique humide", temperature: "Frais à tempéré", humidite: "Élevée", risques: "Humidité, pluie, surchauffe estivale ponctuelle", materiauxRecommandes: ["brique", "bois", "isolants biosourcés", "réemploi"], systemesConstructifs: ["brique + isolation continue", "ossature bois", "rénovation lourde"], strategiesPassives: ["compacité", "protection pluie", "inertie intérieure"], isolationConseillee: "Forte isolation continue, ponts thermiques maîtrisés", ventilationConseillee: "Ventilation contrôlée ou double flux", toitureConseillee: "Toiture isolée et ventilée", erreursAEviter: ["ponts thermiques", "parois non respirantes mal conçues", "ventilation insuffisante"], scoreEcologique: 82, justification: "Le potentiel écologique vient surtout de la rénovation, de l'enveloppe et du réemploi.", tags: ["humidité", "rénovation", "brique"], relatedIds: ["belgique-brique"] },
    { id: "eco-france", pays: "France", region: "Nord / Méditerranée / Alpes / Atlantique", climat: "Tempéré varié", temperature: "Variable", humidite: "Moyenne", risques: "Canicule, retrait argile, inondation selon région", materiauxRecommandes: ["bois", "pierre", "terre", "béton bas-carbone"], systemesConstructifs: ["réhabilitation", "ITE", "hybride bois-béton"], strategiesPassives: ["orientation", "ombrage", "ventilation nocturne"], isolationConseillee: "Adapter au climat local et au patrimoine", ventilationConseillee: "Naturelle assistée ou double flux", toitureConseillee: "Toiture isolée, claire ou végétalisée selon contexte", erreursAEviter: ["solution unique nationale", "surchauffe négligée"], scoreEcologique: 78, justification: "La diversité climatique impose une approche régionale.", tags: ["réhabilitation", "ombrage", "bas-carbone"], relatedIds: ["france-pierre-beton"] },
    { id: "eco-maroc", pays: "Maroc", region: "Marrakech / Atlas / littoral", climat: "Aride chaud", temperature: "Très chaude l'été", humidite: "Faible à moyenne", risques: "Chaleur, séisme, rareté de l'eau", materiauxRecommandes: ["terre crue", "pisé", "pierre", "chaux"], systemesConstructifs: ["maison patio", "murs épais", "toitures protégées"], strategiesPassives: ["inertie", "ombre", "patio", "ventilation nocturne"], isolationConseillee: "Masse thermique et protections solaires prioritaires", ventilationConseillee: "Naturelle par patio et tirage thermique", toitureConseillee: "Toiture claire, isolée et ombragée", erreursAEviter: ["grandes surfaces vitrées ouest", "toiture sombre non isolée"], scoreEcologique: 88, justification: "Les systèmes vernaculaires offrent une excellente base passive.", tags: ["terre", "patio", "aride"], relatedIds: ["maroc-terre-patio"] },
    { id: "eco-japon", pays: "Japon", region: "Honshu / Kyoto / Tokyo", climat: "Tempéré humide", temperature: "Quatre saisons", humidite: "Élevée", risques: "Séisme, typhon, humidité", materiauxRecommandes: ["bois", "bambou", "papier technique", "acier léger"], systemesConstructifs: ["ossature bois", "assemblages secs", "préfabrication légère"], strategiesPassives: ["débords", "ventilation croisée", "réparabilité"], isolationConseillee: "Isolation respirante et gestion vapeur", ventilationConseillee: "Traversante + extraction humide", toitureConseillee: "Toiture légère à grands débords", erreursAEviter: ["masse lourde non ductile", "détails sensibles à l'humidité"], scoreEcologique: 84, justification: "La légèreté, la préfabrication et la réparabilité sont centrales.", tags: ["séisme", "bois", "humidité"], relatedIds: ["japon-bois"] },
    { id: "eco-norvege", pays: "Norvège", region: "Oslo / fjords / nord", climat: "Froid humide", temperature: "Froide", humidite: "Moyenne à élevée", risques: "Neige, gel, vent", materiauxRecommandes: ["bois massif", "CLT", "laine de bois", "triple vitrage"], systemesConstructifs: ["enveloppe très isolée", "bois massif", "préfabrication"], strategiesPassives: ["compacité", "apports solaires", "sas thermiques"], isolationConseillee: "Très forte isolation et étanchéité à l'air", ventilationConseillee: "Double flux avec récupération", toitureConseillee: "Toiture inclinée neige, très isolée", erreursAEviter: ["ponts thermiques", "vitrages faibles", "absence de sas"], scoreEcologique: 86, justification: "Le bois local et la performance d'enveloppe réduisent la demande énergétique.", tags: ["froid", "bois", "neige"], relatedIds: ["scandinavie-massif"] },
    { id: "eco-suede", pays: "Suède", region: "Stockholm / Göteborg / nord", climat: "Froid tempéré", temperature: "Froide", humidite: "Moyenne", risques: "Neige, gel", materiauxRecommandes: ["bois", "CLT", "cellulose", "réemploi"], systemesConstructifs: ["ossature bois", "CLT", "quartier bas-carbone"], strategiesPassives: ["compacité", "lumière contrôlée", "ventilation performante"], isolationConseillee: "Isolation élevée biosourcée", ventilationConseillee: "Double flux", toitureConseillee: "Toiture isolée neige", erreursAEviter: ["faible étanchéité", "matériaux à fort carbone sans raison"], scoreEcologique: 85, justification: "La filière bois et la préfabrication sont très adaptées.", tags: ["CLT", "froid", "préfabrication"], relatedIds: ["scandinavie-massif"] },
    { id: "eco-finlande", pays: "Finlande", region: "Helsinki / lacs / nord", climat: "Froid continental", temperature: "Très froide en hiver", humidite: "Moyenne", risques: "Neige, gel, faible lumière", materiauxRecommandes: ["bois", "laine de bois", "triple vitrage"], systemesConstructifs: ["bois massif", "enveloppe compacte", "sauna / zones tampons"], strategiesPassives: ["compacité", "orientation solaire", "espaces tampons"], isolationConseillee: "Très forte isolation", ventilationConseillee: "Double flux", toitureConseillee: "Toiture inclinée isolée", erreursAEviter: ["surface déperditive excessive", "ventilation non récupérée"], scoreEcologique: 84, justification: "Le climat impose sobriété formelle et enveloppe robuste.", tags: ["froid", "bois", "compact"], relatedIds: ["scandinavie-massif"] },
    { id: "eco-espagne", pays: "Espagne", region: "Andalousie / Madrid / Catalogne", climat: "Méditerranéen à chaud sec", temperature: "Chaude l'été", humidite: "Faible à moyenne", risques: "Canicule, sécheresse", materiauxRecommandes: ["brique", "céramique", "terre", "chaux"], systemesConstructifs: ["patio", "brise-soleil", "murs inertiels"], strategiesPassives: ["ombre", "ventilation nocturne", "compacité"], isolationConseillee: "Toiture et façades exposées", ventilationConseillee: "Traversante + nocturne", toitureConseillee: "Claire, ventilée, parfois végétalisée", erreursAEviter: ["façades vitrées non protégées", "climatisation comme seule stratégie"], scoreEcologique: 83, justification: "Les stratégies d'ombre et d'inertie sont déterminantes.", tags: ["ombre", "patio", "canicule"], relatedIds: ["espagne-patio"] },
    { id: "eco-italie", pays: "Italie", region: "Toscane / Rome / Sicile", climat: "Méditerranéen", temperature: "Chaude l'été", humidite: "Moyenne", risques: "Séisme, chaleur", materiauxRecommandes: ["pierre", "brique", "bois", "chaux"], systemesConstructifs: ["maçonnerie renforcée", "cour", "réhabilitation"], strategiesPassives: ["inertie", "ombre", "ventilation traversante"], isolationConseillee: "Compatible patrimoine et séisme", ventilationConseillee: "Naturelle + extraction", toitureConseillee: "Toiture claire ou ventilée", erreursAEviter: ["renforts qui piègent l'humidité", "survitrage solaire"], scoreEcologique: 79, justification: "Réhabiliter et renforcer avec finesse évite beaucoup de carbone.", tags: ["séisme", "pierre", "réhabilitation"], relatedIds: ["italie-maconnerie"] },
    { id: "eco-egypte", pays: "Égypte", region: "Le Caire / vallée du Nil", climat: "Désertique", temperature: "Très chaude", humidite: "Faible", risques: "Chaleur extrême, poussière", materiauxRecommandes: ["terre", "pierre", "béton bas-carbone", "chaux"], systemesConstructifs: ["murs massifs", "cours ombrées", "façades filtrantes"], strategiesPassives: ["inertie", "moucharabieh", "ventilation haute"], isolationConseillee: "Protection toiture et masse", ventilationConseillee: "Tirage thermique contrôlé", toitureConseillee: "Claire, isolée, ombragée", erreursAEviter: ["vitrage plein sud-ouest", "toiture non protégée"], scoreEcologique: 81, justification: "Masse, filtre et ombre peuvent réduire fortement les besoins.", tags: ["désert", "inertie", "filtre"], relatedIds: ["egypte-inertie"] },
    { id: "eco-inde", pays: "Inde", region: "Ahmedabad / Kerala / Delhi", climat: "Tropical et mousson", temperature: "Chaude", humidite: "Élevée selon régions", risques: "Mousson, chaleur, pollution", materiauxRecommandes: ["brique", "terre", "béton ventilé", "pierre"], systemesConstructifs: ["jali", "véranda", "toiture ventilée"], strategiesPassives: ["ombrage profond", "ventilation", "filtration"], isolationConseillee: "Toiture prioritaire, parois selon région", ventilationConseillee: "Traversante filtrée", toitureConseillee: "Double toiture ventilée", erreursAEviter: ["façade vitrée non protégée", "toiture plate sombre"], scoreEcologique: 82, justification: "Les dispositifs filtrants sont performants et culturellement adaptés.", tags: ["mousson", "jali", "ventilation"], relatedIds: ["inde-jali"] },
    { id: "eco-bresil", pays: "Brésil", region: "Rio / Brasília / São Paulo", climat: "Tropical à subtropical", temperature: "Chaude", humidite: "Élevée", risques: "Surchauffe, pluies intenses", materiauxRecommandes: ["béton", "bois certifié", "brique", "bambou"], systemesConstructifs: ["pilotis", "brise-soleil", "toiture ventilée"], strategiesPassives: ["ombre", "ventilation naturelle", "sol libre"], isolationConseillee: "Toiture et façades exposées", ventilationConseillee: "Naturelle traversante", toitureConseillee: "Débordante, ventilée", erreursAEviter: ["climatisation sans ombrage", "mauvais drainage"], scoreEcologique: 80, justification: "Le climat favorise l'architecture ventilée et ombragée.", tags: ["tropical", "pilotis", "ombre"], relatedIds: ["bresil-modernisme"] },
    { id: "eco-canada", pays: "Canada", region: "Québec / Ontario / Vancouver", climat: "Froid continental à océanique", temperature: "Froide", humidite: "Variable", risques: "Neige, gel, pluie côtière", materiauxRecommandes: ["bois", "CLT", "cellulose", "triple vitrage"], systemesConstructifs: ["ossature bois", "CLT", "enveloppe très étanche"], strategiesPassives: ["compacité", "apports solaires", "sas"], isolationConseillee: "Très forte, pare-air continu", ventilationConseillee: "Double flux", toitureConseillee: "Toiture neige très isolée", erreursAEviter: ["condensation interstitielle", "faible étanchéité"], scoreEcologique: 85, justification: "Le bois et l'enveloppe performante sont cohérents avec le climat.", tags: ["froid", "CLT", "enveloppe"], relatedIds: ["canada-envelope"] },
    { id: "eco-etats-unis", pays: "États-Unis", region: "Californie / Nord-Est / Sud", climat: "Très varié", temperature: "Variable", humidite: "Variable", risques: "Feu, cyclone, séisme, chaleur", materiauxRecommandes: ["bois", "acier", "béton bas-carbone", "isolants biosourcés"], systemesConstructifs: ["light frame", "parasismique", "résistant feu selon zone"], strategiesPassives: ["zonage climatique", "ombrage", "résilience"], isolationConseillee: "Selon zone climatique", ventilationConseillee: "Mécanique ou naturelle selon climat", toitureConseillee: "Réfléchissante, résistante vent/feu", erreursAEviter: ["copier une solution d'un État à l'autre", "ignorer le risque feu"], scoreEcologique: 74, justification: "Le pays exige une stratégie locale, pas un standard unique.", tags: ["risques", "light-frame", "résilience"], relatedIds: ["usa-light-frame"] },
    { id: "eco-kenya", pays: "Kenya", region: "Nairobi / Mombasa", climat: "Tropical d'altitude à humide", temperature: "Chaude modérée", humidite: "Variable", risques: "Pluies intenses, chaleur", materiauxRecommandes: ["terre", "pierre locale", "bois", "métal léger"], systemesConstructifs: ["double toiture", "murs ventilés", "matériaux locaux"], strategiesPassives: ["ventilation", "ombrage", "toiture ventilée"], isolationConseillee: "Toiture prioritaire", ventilationConseillee: "Naturelle permanente", toitureConseillee: "Débordante et ventilée", erreursAEviter: ["tôle non ventilée", "faible protection solaire"], scoreEcologique: 86, justification: "Les ressources locales et la ventilation passive sont efficaces.", tags: ["local", "ventilation", "toiture"], relatedIds: ["kenya-climat-social"] },
    { id: "eco-afrique-du-sud", pays: "Afrique du Sud", region: "Le Cap / Johannesburg", climat: "Semi-aride à méditerranéen", temperature: "Chaude", humidite: "Variable", risques: "Sécheresse, feu, vent", materiauxRecommandes: ["brique", "terre", "bois protégé", "acier"], systemesConstructifs: ["murs inertiels", "ombrage", "collecte eau"], strategiesPassives: ["ombre", "inertie", "gestion eau"], isolationConseillee: "Toiture et façades exposées", ventilationConseillee: "Traversante protégée", toitureConseillee: "Claire, isolée, récupération eau", erreursAEviter: ["surfaces noires exposées", "absence de stratégie eau"], scoreEcologique: 78, justification: "L'eau et la protection solaire doivent guider le projet.", tags: ["sécheresse", "eau", "ombre"], relatedIds: ["afrique-du-sud-hybride"] },
    { id: "eco-indonesie", pays: "Indonésie", region: "Bali / Java", climat: "Tropical humide", temperature: "Chaude", humidite: "Très élevée", risques: "Séisme, mousson, humidité", materiauxRecommandes: ["bambou", "bois", "terre stabilisée", "pierre"], systemesConstructifs: ["pilotis", "toiture très ventilée", "structures légères"], strategiesPassives: ["ventilation permanente", "débord", "surélévation"], isolationConseillee: "Toiture légère protégée", ventilationConseillee: "Naturelle permanente", toitureConseillee: "Très débordante et respirante", erreursAEviter: ["matériaux piégeant l'humidité", "structure lourde non ductile"], scoreEcologique: 87, justification: "La légèreté ventilée répond au climat humide et aux séismes.", tags: ["bambou", "humide", "pilotis"], relatedIds: ["bambou-tropical"] },
    { id: "eco-australie", pays: "Australie", region: "Sydney / Melbourne / intérieur", climat: "Chaud sec à tempéré", temperature: "Chaude", humidite: "Faible à moyenne", risques: "Feu, chaleur, sécheresse", materiauxRecommandes: ["bois protégé", "acier", "terre", "isolants résistants feu"], systemesConstructifs: ["maison légère ventilée", "véranda", "détails anti-feu"], strategiesPassives: ["ombrage", "ventilation", "protection incendie"], isolationConseillee: "Toiture prioritaire + déphasage", ventilationConseillee: "Traversante contrôlée", toitureConseillee: "Claire, ventilée, résistante feu", erreursAEviter: ["végétation combustible collée au bâti", "toiture sombre"], scoreEcologique: 76, justification: "La résilience feu-chaleur conditionne les choix écologiques.", tags: ["feu", "ombre", "sécheresse"], relatedIds: ["australie-bushfire"] },
    { id: "eco-allemagne", pays: "Allemagne", region: "Berlin / Freiburg / Bavière", climat: "Tempéré froid", temperature: "Froide à tempérée", humidite: "Moyenne", risques: "Canicule croissante, pluie", materiauxRecommandes: ["bois", "brique", "isolants biosourcés", "réemploi"], systemesConstructifs: ["Passivhaus", "préfabrication bois", "rénovation énergétique"], strategiesPassives: ["compacité", "orientation", "protection solaire"], isolationConseillee: "Très forte isolation", ventilationConseillee: "Double flux", toitureConseillee: "Isolée, solaire ou végétalisée", erreursAEviter: ["performance sans confort d'été", "systèmes trop complexes"], scoreEcologique: 84, justification: "La culture de l'enveloppe performante est un levier fort.", tags: ["passif", "bois", "énergie"], relatedIds: ["allemagne-passivhaus"] },
    { id: "eco-pays-bas", pays: "Pays-Bas", region: "Amsterdam / Rotterdam / polders", climat: "Océanique humide", temperature: "Tempérée", humidite: "Élevée", risques: "Inondation, vent, sol humide", materiauxRecommandes: ["bois", "brique", "acier galvanisé", "réemploi"], systemesConstructifs: ["fondations adaptées", "surélévation", "façades légères"], strategiesPassives: ["gestion eau", "compacité", "ventilation contrôlée"], isolationConseillee: "Forte et résistante humidité", ventilationConseillee: "Contrôlée", toitureConseillee: "Toiture pluie, rétention ou solaire", erreursAEviter: ["ignorer le niveau d'eau", "détails sensibles à la corrosion"], scoreEcologique: 81, justification: "La gestion de l'eau est indissociable du choix constructif.", tags: ["eau", "polder", "humidité"], relatedIds: ["pays-bas-pilotis"] }
  ].map(item => ({
    ...item,
    matériauxRecommandés: item.materiauxRecommandes,
    stratégiesPassives: item.strategiesPassives,
    isolationConseillée: item.isolationConseillee,
    ventilationConseillée: item.ventilationConseillee,
    toitureConseillée: item.toitureConseillee,
    erreursÀÉviter: item.erreursAEviter
  }));

  const _ecoState = { selectedId: DATA_ECOLOGY[0]?.id || null, compareId: "" };

  function _renderEcologieDetail(item, label = "Pays actif") {
    if (!item) return renderEmptyState("Aucune recommandation", "Sélectionnez un pays pour afficher les stratégies.");
    return `
      <article class="tm-eco-detail">
        <p class="tm-tech-kicker">${_esc(label)}</p>
        <h3>${_esc(item.pays)}</h3>
        <p class="tm-tech-muted">${_esc(item.region)} · ${_esc(item.climat)} · ${_esc(item.risques)}</p>
        <div class="tm-eco-score"><span style="width:${Math.max(0, Math.min(100, item.scoreEcologique))}%"></span></div>
        <strong class="tm-eco-score-label">Score écologique pédagogique : ${_esc(item.scoreEcologique)}/100</strong>
        <div class="tm-eco-columns">
          <div><span>Matériaux</span>${renderTagList(item.materiauxRecommandes)}</div>
          <div><span>Systèmes</span>${renderTagList(item.systemesConstructifs)}</div>
          <div><span>Stratégies passives</span>${renderTagList(item.strategiesPassives)}</div>
          <div><span>Erreurs à éviter</span>${renderTagList(item.erreursAEviter)}</div>
        </div>
        <div class="tm-tech-rows">
          <div class="tm-tech-row"><span>Isolation conseillée</span><strong>${_esc(item.isolationConseillee)}</strong></div>
          <div class="tm-tech-row"><span>Ventilation conseillée</span><strong>${_esc(item.ventilationConseillee)}</strong></div>
          <div class="tm-tech-row"><span>Toiture conseillée</span><strong>${_esc(item.toitureConseillee)}</strong></div>
        </div>
        <p class="tm-tech-lesson">${_esc(item.justification)}</p>
      </article>
    `;
  }

  function initEcologie() {
    const root = document.getElementById("ecologie-layout");
    if (!root) return;

    const selected = DATA_ECOLOGY.find(item => item.id === _ecoState.selectedId) || DATA_ECOLOGY[0];
    const compared = DATA_ECOLOGY.find(item => item.id === _ecoState.compareId);

    root.innerHTML = `
      <div class="tm-eco tm-shell tm-reveal">
        <section class="tm-editorial-panel tm-eco-hero">
          <div>
            <p class="tm-tech-kicker">Écologie V1</p>
            <h3>Choisir une stratégie selon climat, ressources et risques.</h3>
            <p class="tm-tech-muted">Ces recommandations sont pédagogiques et doivent être adaptées à chaque projet réel.</p>
          </div>
          <div class="tm-eco-selectors">
            <label class="field">
              <span>Pays</span>
              <select data-eco-select="primary">
                ${DATA_ECOLOGY.map(item => `<option value="${_esc(item.id)}" ${item.id === selected?.id ? "selected" : ""}>${_esc(item.pays)}</option>`).join("")}
              </select>
            </label>
            <label class="field">
              <span>Comparer avec</span>
              <select data-eco-select="compare">
                <option value="">Aucun</option>
                ${DATA_ECOLOGY.map(item => `<option value="${_esc(item.id)}" ${item.id === compared?.id ? "selected" : ""}>${_esc(item.pays)}</option>`).join("")}
              </select>
            </label>
          </div>
        </section>
        <div class="tm-eco-layout">
          ${_renderEcologieDetail(selected, "Pays actif")}
          ${compared ? _renderEcologieDetail(compared, "Comparaison") : `
            <article class="tm-eco-detail tm-eco-note">
              <p class="tm-tech-kicker">Lecture</p>
              <h3>Comparer sans complexifier.</h3>
              <p class="tm-tech-muted">Choisissez un second pays pour comparer les matériaux, systèmes, stratégies passives et erreurs à éviter.</p>
            </article>
          `}
        </div>
      </div>
    `;

    if (root.dataset.ecologieBound === "true") return;
    root.dataset.ecologieBound = "true";
    root.addEventListener("change", e => {
      const select = e.target.closest("[data-eco-select]");
      if (!select) return;
      if (select.dataset.ecoSelect === "primary") _ecoState.selectedId = select.value;
      if (select.dataset.ecoSelect === "compare") _ecoState.compareId = select.value;
      initEcologie();
    });
  }

  (function hookEcologie() {
    const mod = document.getElementById("module-ecologie");
    if (!mod) return;
    new MutationObserver(() => {
      if (mod.classList.contains("is-active")) initEcologie();
    }).observe(mod, { attributes: true, attributeFilter: ["class"] });
    if (mod.classList.contains("is-active")) initEcologie();
  })();

  /* ── Auth/Firestore helpers partagés ────────────────────────── */
  const ADMIN_EMAIL = "teomarchi@teomarchi.com";
  window.TEOMARCHI_AUTH_STATE = window.TEOMARCHI_AUTH_STATE || {
    user: null,
    isAdmin: false,
    isPremium: false
  };

  function getFirestoreDb() {
    try {
      if (typeof firebase === "undefined" || typeof firebase.firestore !== "function") return null;
      return firebase.firestore();
    } catch {
      return null;
    }
  }

  function getFirebaseUser() {
    try {
      return window.TEOMARCHI_AUTH_STATE?.user || firebase.auth?.().currentUser || null;
    } catch {
      return window.TEOMARCHI_AUTH_STATE?.user || null;
    }
  }

  function isTeomarchiAdmin(user = getFirebaseUser()) {
    return String(user?.email || "").toLowerCase() === ADMIN_EMAIL;
  }

  function serverTimestamp() {
    try { return firebase.firestore.FieldValue.serverTimestamp(); }
    catch { return new Date().toISOString(); }
  }

  function incrementBy(value) {
    try { return firebase.firestore.FieldValue.increment(value); }
    catch { return value; }
  }

  function openLoginPrompt() {
    try { window.TEOMARCHI_OPEN_LOGIN?.(); } catch {}
    const modal = document.querySelector("#login-modal");
    if (modal) modal.classList.add("is-open");
  }

  function notifyUser(message) {
    if (typeof pushNotification === "function") pushNotification(message);
    else console.log(message);
  }

  let _journalierCloudTimer = null;

  function setSaveStatus(message, state = "idle") {
    const el = document.getElementById("journalier-save-status");
    if (!el) return;
    el.textContent = message;
    el.dataset.saveState = state;
  }

  function saveJournalierCloud(state) {
    const user = getFirebaseUser();
    const db = getFirestoreDb();
    if (!user || !db) {
      setSaveStatus("Mode local — Firestore indisponible ou utilisateur non connecté", "local");
      return Promise.resolve(false);
    }

    if (_journalierCloudTimer) clearTimeout(_journalierCloudTimer);
    setSaveStatus("Sauvegarde cloud en attente…", "saving");

    return new Promise(resolve => {
      _journalierCloudTimer = setTimeout(async () => {
        try {
          await db.collection("users").doc(user.uid).collection("journalier").doc("state").set({
            ...state,
            updatedAt: serverTimestamp()
          }, { merge: true });
          setSaveStatus("Sauvegarde cloud effectuée", "saved");
          resolve(true);
        } catch (err) {
          console.warn("Journalier Firestore indisponible :", err);
          setSaveStatus("Mode local — Firestore indisponible", "local");
          resolve(false);
        }
      }, 450);
    });
  }

  function closeLogoutConfirm() {
    const modal = document.getElementById("logout-confirm-modal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function openLogoutConfirm() {
    let modal = document.getElementById("logout-confirm-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "logout-confirm-modal";
      modal.className = "modal-overlay";
      modal.setAttribute("aria-hidden", "true");
      modal.innerHTML = `
        <div class="modal tm-logout-modal" role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title">
          <p class="eyebrow">Session</p>
          <h2 class="modal__title" id="logout-confirm-title">Êtes-vous sûr de vouloir vous déconnecter ?</h2>
          <p class="muted">Votre session Firebase sera fermée. Les données locales restent conservées sur cet appareil.</p>
          <div class="tm-logout-actions">
            <button class="text-btn" type="button" data-logout-cancel>Annuler</button>
            <button class="text-btn text-btn--primary" type="button" data-logout-confirm>Déconnexion</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  async function confirmLogout() {
    try {
      const auth = (typeof firebase !== "undefined" && typeof firebase.auth === "function")
        ? firebase.auth()
        : null;
      if (auth?.currentUser) await auth.signOut();
      if (typeof TEOMARCHI_APP !== "undefined") TEOMARCHI_APP.session.clear();
      notifyUser("Déconnecté.");
    } catch (err) {
      console.error("Erreur déconnexion :", err);
      notifyUser("Déconnexion impossible pour le moment.");
    } finally {
      closeLogoutConfirm();
    }
  }

  document.addEventListener("click", e => {
    const cancel = e.target.closest("[data-logout-cancel]");
    const confirm = e.target.closest("[data-logout-confirm]");
    if (!cancel && !confirm) return;
    e.preventDefault();
    if (cancel) closeLogoutConfirm();
    if (confirm) confirmLogout();
  });

  document.addEventListener("click", e => {
    const btn = e.target.closest("#session-btn, #profil-session-btn");
    if (!btn || !getFirebaseUser()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    openLogoutConfirm();
  }, true);

  function formatFirestoreDate(value) {
    try {
      const date = value?.toDate ? value.toDate() : (value ? new Date(value) : null);
      if (!date || Number.isNaN(date.getTime())) return "à l'instant";
      return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
    } catch {
      return "à l'instant";
    }
  }

  function compactUserName(user) {
    if (!user) return "";
    return user.displayName || String(user.email || "").split("@")[0] || "Utilisateur TEOMARCHI";
  }

  document.addEventListener("click", e => {
    if (!e.target.closest("[data-open-login]")) return;
    e.preventDefault();
    openLoginPrompt();
  });

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
      .tm-profile-editor {
        display: grid;
        grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr);
        gap: 1.2rem;
        align-items: start;
      }
      .tm-profile-card {
        display: grid;
        gap: 1rem;
        padding: 1.4rem;
        border: var(--border);
        border-radius: var(--r-xl);
        background: var(--surface);
        min-width: 0;
      }
      .tm-profile-form {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: .8rem;
      }
      .tm-profile-field,
      .tm-feed-field {
        display: grid;
        gap: .34rem;
        min-width: 0;
      }
      .tm-profile-field--full,
      .tm-feed-field--full { grid-column: 1 / -1; }
      .tm-profile-field label,
      .tm-feed-field label {
        color: var(--muted);
        font-size: .58rem;
        letter-spacing: .13em;
        text-transform: uppercase;
      }
      .tm-profile-field input,
      .tm-profile-field select,
      .tm-profile-field textarea,
      .tm-feed-field input,
      .tm-feed-field textarea {
        width: 100%;
        border: var(--border);
        border-radius: var(--r-sm);
        background: color-mix(in srgb, var(--surface-2) 70%, transparent);
        color: var(--ink);
        font: inherit;
        font-size: .82rem;
        padding: .72rem .82rem;
        resize: vertical;
        min-width: 0;
      }
      .tm-profile-field textarea,
      .tm-feed-field textarea { min-height: 92px; }
      .tm-profile-field input:focus,
      .tm-profile-field select:focus,
      .tm-profile-field textarea:focus,
      .tm-feed-field input:focus,
      .tm-feed-field textarea:focus {
        outline: none;
        border-color: rgba(201,169,110,.48);
      }
      .tm-profile-empty {
        padding: 2rem;
        border: var(--border-gold);
        border-radius: var(--r-xl);
        background: radial-gradient(ellipse at 0% 100%, rgba(201,169,110,.07), transparent 60%), var(--surface);
        text-align: center;
      }
      @media (max-width: 900px) {
        .tm-profile-editor,
        .tm-profile-form { grid-template-columns: 1fr; }
      }
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

  let _profileUnsubscribe = null;

  function profileFallback(user, data = {}) {
    return {
      displayName: data.displayName || user.displayName || compactUserName(user),
      bio: data.bio || "",
      schoolOrAgency: data.schoolOrAgency || "",
      level: data.level || "",
      city: data.city || "",
      specialties: Array.isArray(data.specialties) ? data.specialties.join(", ") : (data.specialties || ""),
      avatarUrl: data.avatarUrl || user.photoURL || "",
      portfolioUrl: data.portfolioUrl || "",
      role: data.role || (isTeomarchiAdmin(user) ? "admin" : "free"),
      status: data.status || "active"
    };
  }

  function renderProfileEditor(root, user, profile = {}) {
    if (!root || !user) return;
    const p = profileFallback(user, profile);
    const stats = _profileStats();
    const avatar = p.avatarUrl
      ? `<img src="${_esc(p.avatarUrl)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
      : _esc(p.displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "T");

    root.innerHTML = `
      <div class="tm-profile-editor">
        <aside class="tm-profile-card">
          <div class="tm-profil-hero" style="padding:0;border:0;background:transparent">
            <div class="tm-profil-avatar" aria-hidden="true">${avatar}</div>
            <div>
              <p style="margin:0 0 .22rem;text-transform:uppercase;letter-spacing:.17em;
                        font-size:.58rem;font-weight:500;color:var(--gold)">Profil Firebase</p>
              <h3 style="font-family:var(--serif);font-size:2rem;font-weight:300;
                         line-height:1.04;color:var(--ink);margin:0 0 .38rem">${_esc(p.displayName)}</h3>
              <p style="margin:0;color:var(--muted);font-size:.78rem;line-height:1.55">${_esc(user.email || "")}</p>
            </div>
          </div>
          <div class="tm-profil-stats">
            ${stats.map(s => `
              <div class="tm-profil-stat">
                <span class="tm-profil-stat__val">${_esc(s.val)}</span>
                <span class="tm-profil-stat__lbl">${_esc(s.lbl)}</span>
              </div>
            `).join("")}
          </div>
          <div style="display:grid;gap:.5rem">
            <span class="badge">${_esc(p.role)}</span>
            <span class="badge">${_esc(p.status)}</span>
          </div>
        </aside>

        <form class="tm-profile-card tm-profile-form" id="profile-editor-form">
          <div class="tm-profile-field">
            <label for="profile-displayName">Nom affiché</label>
            <input id="profile-displayName" name="displayName" maxlength="80" value="${_esc(p.displayName)}" autocomplete="name">
          </div>
          <div class="tm-profile-field">
            <label for="profile-level">Niveau</label>
            <select id="profile-level" name="level">
              <option value="">Non renseigné</option>
              ${["L1","L2","L3","M1","M2","architecte","enseignant","agence"].map(level =>
                `<option value="${level}" ${p.level === level ? "selected" : ""}>${level}</option>`
              ).join("")}
            </select>
          </div>
          <div class="tm-profile-field tm-profile-field--full">
            <label for="profile-bio">Bio courte</label>
            <textarea id="profile-bio" name="bio" maxlength="240">${_esc(p.bio)}</textarea>
          </div>
          <div class="tm-profile-field">
            <label for="profile-schoolOrAgency">École / agence</label>
            <input id="profile-schoolOrAgency" name="schoolOrAgency" maxlength="120" value="${_esc(p.schoolOrAgency)}">
          </div>
          <div class="tm-profile-field">
            <label for="profile-city">Ville</label>
            <input id="profile-city" name="city" maxlength="80" value="${_esc(p.city)}">
          </div>
          <div class="tm-profile-field tm-profile-field--full">
            <label for="profile-specialties">Spécialités</label>
            <input id="profile-specialties" name="specialties" maxlength="160" value="${_esc(p.specialties)}" placeholder="bois, logement, réhabilitation">
          </div>
          <div class="tm-profile-field">
            <label for="profile-avatarUrl">Photo de profil</label>
            <input id="profile-avatarUrl" name="avatarUrl" type="url" value="${_esc(p.avatarUrl)}" placeholder="https://...">
          </div>
          <div class="tm-profile-field">
            <label for="profile-avatar-file">Importer une photo</label>
            <div class="tm-profile-avatar-preview" data-profile-avatar-preview>${avatar}</div>
            <input id="profile-avatar-file" name="avatarFile" type="file" accept="image/png,image/jpeg,image/webp">
          </div>
          <div class="tm-profile-field">
            <label for="profile-portfolioUrl">Portfolio</label>
            <input id="profile-portfolioUrl" name="portfolioUrl" type="url" value="${_esc(p.portfolioUrl)}" placeholder="https://...">
          </div>
          <div class="tm-profile-field tm-profile-field--full">
            <button class="text-btn text-btn--primary" type="submit">Sauvegarder le profil</button>
          </div>
        </form>
      </div>
    `;
  }

  async function uploadProfileAvatar(file, user) {
    if (!file || !user) return "";
    if (!String(file.type || "").startsWith("image/")) {
      notifyUser("Format image invalide.");
      return "";
    }
    if (file.size > 2 * 1024 * 1024) {
      notifyUser("Image trop lourde : 2 Mo maximum.");
      return "";
    }

    try {
      if (typeof firebase !== "undefined" && typeof firebase.storage === "function") {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const ref = firebase.storage().ref().child(`users/${user.uid}/profile/avatar-${Date.now()}.${ext}`);
        await ref.put(file);
        const url = await ref.getDownloadURL();
        notifyUser("Avatar mis à jour.");
        return url;
      }
    } catch (err) {
      console.warn("Upload Firebase Storage indisponible :", err);
      notifyUser("Firebase Storage indisponible, aperçu local utilisé.");
    }

    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        notifyUser("Avatar mis à jour en aperçu local.");
        resolve(String(reader.result || ""));
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  }

  async function saveProfile(form) {
    const user = getFirebaseUser();
    const db = getFirestoreDb();
    if (!user) {
      openLoginPrompt();
      return;
    }
    if (!form) {
      return;
    }

    const data = new FormData(form);
    const avatarFile = form.querySelector("#profile-avatar-file")?.files?.[0] || null;
    const uploadedAvatar = avatarFile ? await uploadProfileAvatar(avatarFile, user) : "";
    const role = getUserPlan(window.TEOMARCHI_AUTH_STATE);
    const profile = {
      displayName: String(data.get("displayName") || compactUserName(user)).trim().slice(0, 80),
      bio: String(data.get("bio") || "").trim().slice(0, 240),
      schoolOrAgency: String(data.get("schoolOrAgency") || "").trim().slice(0, 120),
      level: String(data.get("level") || "").trim().slice(0, 32),
      city: String(data.get("city") || "").trim().slice(0, 80),
      specialties: String(data.get("specialties") || "")
        .split(",").map(item => item.trim()).filter(Boolean).slice(0, 12),
      avatarUrl: String(uploadedAvatar || data.get("avatarUrl") || "").trim().slice(0, 1500),
      portfolioUrl: String(data.get("portfolioUrl") || "").trim().slice(0, 500),
      email: user.email || "",
      photoURL: user.photoURL || "",
      updatedAt: serverTimestamp()
    };

    if (!db) {
      try { localStorage.setItem(`teomarchi.profile.${user.uid}`, JSON.stringify(profile)); } catch {}
      notifyUser("Profil sauvegardé en mode local.");
      return;
    }

    const ref = db.collection("users").doc(user.uid);
    const snap = await ref.get();
    await ref.set({
      ...profile,
      ...(snap.exists ? {} : { role, status: "active", createdAt: serverTimestamp() })
    }, { merge: true });
    notifyUser("Profil sauvegardé.");
  }

  function initProfileEditor() {
    const root = document.getElementById("profil-social");
    if (!root) return;
    const user = getFirebaseUser();

    if (!root.dataset.profileBound) {
      root.dataset.profileBound = "1";
      root.addEventListener("submit", async e => {
        const form = e.target.closest("#profile-editor-form");
        if (!form) return;
        e.preventDefault();
        const btn = form.querySelector("button[type='submit']");
        if (btn) btn.disabled = true;
        try { await saveProfile(form); }
        catch (err) {
          console.error("Erreur profil :", err);
          notifyUser("Erreur lors de la sauvegarde du profil.");
        } finally {
          if (btn) btn.disabled = false;
        }
      });
      root.addEventListener("change", e => {
        const input = e.target.closest("#profile-avatar-file");
        if (!input?.files?.[0]) return;
        const file = input.files[0];
        if (!String(file.type || "").startsWith("image/")) {
          notifyUser("Format image invalide.");
          input.value = "";
          return;
        }
        const preview = root.querySelector("[data-profile-avatar-preview]");
        if (!preview) return;
        const reader = new FileReader();
        reader.onload = () => {
          preview.innerHTML = `<img src="${_esc(String(reader.result || ""))}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
        };
        reader.readAsDataURL(file);
      });
    }

    if (_profileUnsubscribe) {
      try { _profileUnsubscribe(); } catch {}
      _profileUnsubscribe = null;
    }

    if (!user) {
      root.innerHTML = `
        <div class="tm-profile-empty">
          <p style="margin:0 0 .28rem;text-transform:uppercase;letter-spacing:.16em;font-size:.58rem;color:var(--gold)">Profil</p>
          <h3 style="font-family:var(--serif);font-size:2rem;font-weight:300;margin:0 0 .7rem;color:var(--ink)">Connectez-vous pour compléter votre profil</h3>
          <p style="margin:0 auto 1.2rem;max-width:44ch;color:var(--muted);font-size:.82rem;line-height:1.65">
            Vos publications du Feed utiliseront uniquement les informations de votre compte Firebase et de votre profil Firestore.
          </p>
          <button class="text-btn text-btn--primary" type="button" data-open-login>Connexion</button>
        </div>
      `;
      return;
    }

    renderProfileEditor(root, user, {});
    const db = getFirestoreDb();
    if (!db) return;
    _profileUnsubscribe = db.collection("users").doc(user.uid).onSnapshot(doc => {
      renderProfileEditor(root, user, doc.exists ? doc.data() : {});
    }, err => {
      console.error("Erreur profil Firestore :", err);
      renderProfileEditor(root, user, {});
    });
  }

  /* ── initProfil : compatibilité avec l'ancien hook ───────────── */
  function initProfil() {
    initProfileEditor();
  }

  /* ── Données : plans tarifaires ──────────────────────────────── */
  const DATA_PRICING = [
    {
      id: "gratuit", nom: "Gratuit", prix: "0", periode: "", featured: false,
      desc: "L'essentiel pour démarrer un projet et explorer la plateforme.",
      cta: "Commencer",
      features: [
        { ok: true,  text: "Lecture Atlas, Chronos, Panthéon" },
        { ok: true,  text: "Normes & villes de base"          },
        { ok: true,  text: "Écologie pédagogique"             },
        { ok: false, text: "Sauvegarde cloud"                 },
        { ok: false, text: "IA TEOMARCHI complète"            },
        { ok: false, text: "Journalier complet"               },
        { ok: false, text: "Publication Showroom"             },
        { ok: false, text: "Analytics agence"                 }
      ]
    },
    {
      id: "studio", nom: "Studio", prix: "29", periode: "/ mois", featured: true,
      desc: "La suite complète pour l'étudiant en atelier ou l'architecte solo.",
      cta: "Choisir Studio",
      features: [
        { ok: true, text: "Tout le plan Free"                 },
        { ok: true, text: "Outils avancés"                    },
        { ok: true, text: "Journalier complet"                },
        { ok: true, text: "IA TEOMARCHI"                      },
        { ok: true, text: "Sauvegarde cloud"                  },
        { ok: true, text: "Feed avancé"                       },
        { ok: false, text: "Publication sponsor Showroom"     },
        { ok: false, text: "Analytics agence"                 }
      ]
    },
    {
      id: "agence", nom: "Agence", prix: "89", periode: "/ mois", featured: false,
      desc: "Pour les ateliers collectifs, équipes et structures pédagogiques.",
      cta: "Contacter l'équipe",
      features: [
        { ok: true, text: "Tout le plan Studio"              },
        { ok: true, text: "Publication Showroom"             },
        { ok: true, text: "Publication sponsor"              },
        { ok: true, text: "Multi-projets"                    },
        { ok: true, text: "Analytics agence"                 },
        { ok: true, text: "Visibilité agence"                },
        { ok: true, text: "Support prioritaire"              },
        { ok: true, text: "Espace partenaires"               }
      ]
    }
  ];

  const _svgOk = `<svg class="tm-plan__feature-icon" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

  const _svgNo = `<svg class="tm-plan__feature-icon" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
    aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  const SHOWROOM_GROUPS = [
    {
      id: "mobilier",
      title: "Mobilier",
      subtitle: "Objets, usages, assises, systèmes et pièces d'habitat.",
      description: "Une bibliothèque visuelle pour préparer produits, designers, fabricants et sponsors autour du mobilier architectural.",
      categories: ["salon", "chambre", "cuisine", "salle de bain", "bureau", "extérieur", "mobilier urbain", "mobilier minimaliste", "mobilier contemporain", "mobilier expérimental"],
      slots: ["produits", "designers", "fabricants", "sponsors"]
    },
    {
      id: "materiaux",
      title: "Matériaux",
      subtitle: "Textures, performances, usages et fournisseurs.",
      description: "Chaque matériau pourra accueillir caractéristiques techniques, usages, textures, projets associés, fournisseurs et liens externes.",
      categories: ["béton", "bois", "acier", "pierre", "verre", "aluminium", "matériaux recyclés", "matériaux biosourcés", "composites", "terre crue"],
      slots: ["caractéristiques", "textures", "projets associés", "fournisseurs"]
    },
    {
      id: "agences",
      title: "Agences & Studios",
      subtitle: "Pratiques professionnelles et bureaux créatifs.",
      description: "Espace premium pour architecture, urbanisme, architecture intérieure, design produit, paysage, scénographie et architecture expérimentale.",
      categories: ["agences d'architecture", "urbanisme", "architecture intérieure", "design produit", "paysage", "scénographie", "architecture expérimentale"],
      slots: ["pages dédiées", "projets", "liens externes", "contenus sponsorisés"]
    },
    {
      id: "createurs",
      title: "Jeunes créateurs / designers",
      subtitle: "Étudiants, jeunes studios et pratiques émergentes.",
      description: "Une section plus artistique pour accueillir portfolios, rendus, maquettes, concepts, concours et projets expérimentaux.",
      categories: ["étudiants", "jeunes designers", "créateurs émergents", "projets expérimentaux", "portfolios", "rendus", "maquettes", "concepts", "concours"],
      slots: ["portfolios", "rendus", "maquettes", "concours"]
    }
  ];

  const SHOWROOM_SPONSORS = [
    { name: "Logiciels BIM", kind: "Outils numériques", text: "Promouvoir des workflows, plugins, moteurs de rendu et services de conception." },
    { name: "Fabricants de mobilier", kind: "Objets & pièces", text: "Présenter collections, dimensions, matériaux et usages dans une galerie non intrusive." },
    { name: "Fournisseurs matériaux", kind: "Matière & technique", text: "Associer fiches, textures, performances, fournisseurs et projets inspirants." },
    { name: "Écoles d'architecture", kind: "Formation", text: "Valoriser concours, studios, ateliers, recherches et jeunes créateurs." }
  ];

  function injectShowroomCSS() {
    if (document.getElementById("tm-showroom-css")) return;
    const s = document.createElement("style");
    s.id = "tm-showroom-css";
    s.textContent = `
      .tm-showroom { display:grid; gap:1.45rem; min-width:0; }
      .tm-showroom-gallery { display:grid; gap:1.2rem; }
      .tm-showroom-material-plaque {
        background:
          linear-gradient(135deg, rgba(168,173,178,.08), transparent 38%),
          linear-gradient(90deg, rgba(201,169,110,.06), transparent 60%),
          var(--surface);
      }
      .tm-showroom-material-plaque h3 {
        font-family:var(--serif); font-size:2rem; font-weight:300;
        line-height:1.05; color:var(--ink);
      }
      .tm-showroom-material-plaque p:last-child {
        color:var(--muted); max-width:68ch;
      }
      .tm-showroom-hero {
        min-height:320px; display:grid; grid-template-columns:minmax(0,1.05fr) minmax(280px,.95fr);
        gap:1.4rem; align-items:end; padding:2rem;
        border:var(--border-gold); border-radius:var(--r-xl);
        background:linear-gradient(120deg, rgba(201,169,110,.11), transparent 38%),
                   radial-gradient(ellipse at 88% 12%, rgba(245,245,241,.045), transparent 44%),
                   var(--surface);
        overflow:hidden; position:relative;
      }
      .tm-showroom-hero::before {
        content:""; position:absolute; inset:0; pointer-events:none;
        background-image:linear-gradient(rgba(245,245,241,.032) .5px, transparent .5px),
                         linear-gradient(90deg, rgba(245,245,241,.032) .5px, transparent .5px);
        background-size:64px 64px;
      }
      .tm-showroom-hero > * { position:relative; z-index:1; }
      .tm-showroom-title {
        font-family:var(--serif); font-size:clamp(2.5rem,7vw,5.6rem);
        font-weight:300; line-height:.92; color:var(--ink); max-width:10ch;
      }
      .tm-showroom-lede { color:var(--muted); font-size:.88rem; line-height:1.75; max-width:66ch; }
      .tm-showroom-access { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; }
      .tm-showroom-access-card,
      .tm-showroom-section,
      .tm-showroom-sponsor,
      .tm-showroom-category {
        border:var(--border); border-radius:var(--r-md);
        background:color-mix(in srgb,var(--surface) 88%,transparent);
        min-width:0;
      }
      .tm-showroom-access-card { display:grid; gap:.58rem; padding:1.2rem; }
      .tm-showroom-section { padding:1.25rem; display:grid; gap:1rem; }
      .tm-showroom-section-head {
        display:flex; justify-content:space-between; gap:1rem; align-items:end; flex-wrap:wrap;
      }
      .tm-showroom-section h3,
      .tm-showroom-access-card h3,
      .tm-showroom-sponsor h4 {
        font-family:var(--serif); font-size:1.65rem; font-weight:300; color:var(--ink); line-height:1.05;
      }
      .tm-showroom-section p,
      .tm-showroom-access-card p,
      .tm-showroom-sponsor p { color:var(--muted); font-size:.76rem; line-height:1.6; }
      .tm-showroom-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:.9rem; }
      .tm-showroom-category { overflow:hidden; display:grid; align-content:start; }
      .tm-show-cover {
        height:138px; border-bottom:var(--border);
        background:linear-gradient(135deg, color-mix(in srgb, var(--cover, #C9A96E) 42%, transparent), transparent 54%),
                   repeating-linear-gradient(90deg, rgba(245,245,241,.045) 0 1px, transparent 1px 28px),
                   #0b0b09;
      }
      .tm-showroom-category-body { display:grid; gap:.72rem; padding:1rem; }
      .tm-showroom-slots,
      .tm-showroom-tags { display:flex; gap:.38rem; flex-wrap:wrap; }
      .tm-showroom-tag,
      .tm-showroom-slot {
        display:inline-flex; align-items:center; min-height:24px; padding:.18rem .52rem;
        border:var(--border); border-radius:999px; color:var(--muted);
        font-size:.54rem; letter-spacing:.09em; text-transform:uppercase;
      }
      .tm-showroom-slot { color:var(--gold); border-color:rgba(201,169,110,.25); background:rgba(201,169,110,.06); }
      .tm-showroom-sponsors { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:.9rem; }
      .tm-showroom-sponsor { display:grid; gap:.65rem; padding:1rem; }
      @media (max-width:900px) { .tm-showroom-hero { grid-template-columns:1fr; padding:1.35rem; } }
    `;
    document.head.appendChild(s);
  }

  function renderShowroomPricing() {
    return `
      <section class="tm-showroom-section" id="showroom-premium">
        <div class="tm-showroom-section-head">
          <div>
            <p class="landing-kicker">Offres premium</p>
            <h3>Publication & visibilité</h3>
          </div>
          <p>visiteur gratuit = consultation limitée · premium = publication et visibilité</p>
        </div>
        <div class="tm-pricing-grid">
          ${DATA_PRICING.filter(plan => plan.id !== "gratuit").map(plan => `
            <article class="tm-plan ${plan.featured ? "tm-plan--studio" : ""}">
              ${plan.featured ? `<span class="tm-plan__badge">Studio premium</span>` : `<span class="tm-plan__badge">Agence</span>`}
              <h4 class="tm-plan__name">${_esc(plan.nom)}</h4>
              <div class="tm-plan__price">
                <span class="tm-plan__currency" aria-hidden="true">€</span>
                <span class="tm-plan__amount">${_esc(plan.prix)}</span>
                <span class="tm-plan__period">${_esc(plan.periode)}</span>
              </div>
              <p style="font-size:.80rem;color:var(--muted);line-height:1.55;margin:0">${_esc(plan.desc)}</p>
              <div class="tm-plan__divider"></div>
              <ul class="tm-plan__features" role="list">
                ${plan.features.slice(0, 6).map(f => `
                  <li class="tm-plan__feature ${f.ok ? "" : "tm-plan__feature--off"}">
                    ${f.ok ? _svgOk : _svgNo}
                    <span>${f.text}</span>
                  </li>
                `).join("")}
              </ul>
              <button
                ${plan.id === "studio" ? 'id="checkout-btn"' : ""}
                type="button"
                class="tm-plan__cta tm-plan__cta--checkout"
                data-checkout-plan="${plan.id}">
                ${_esc(plan.cta)}
              </button>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function handleShowroomPublish() {
    const user = getFirebaseUser();
    if (!user) {
      openLoginPrompt();
      return;
    }
    if (!canAccessFeature("showroom:publish", window.TEOMARCHI_AUTH_STATE)) {
      const premium = document.getElementById("showroom-premium");
      premium?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (premium && !premium.querySelector("[data-upgrade-feature='showroom:publish']")) {
        premium.insertAdjacentHTML("beforeend", renderUpgradeGate("showroom:publish", "agency"));
      }
      notifyUser("Publication Showroom réservée au plan Agency.");
      return;
    }
    notifyUser("Espace publication Showroom prêt pour la prochaine phase.");
  }

  /* ── initShowroom : galerie marketplace premium ─────────────── */
  function initShowroom() {
    const root = document.getElementById("showroom-grid");
    if (!root) return;
    if (root.dataset.loaded === "showroom") return;
    root.dataset.loaded = "showroom";
    injectShowroomCSS();

    root.className     = "";
    root.style.cssText = "";

    root.innerHTML = `
      <div class="tm-showroom tm-showroom-gallery tm-shell tm-reveal">
        <section class="tm-editorial-panel tm-showroom-material-plaque">
          <p class="tm-tech-kicker">Galerie architecturale premium</p>
          <h3>Matériaux, créateurs, agences et partenaires.</h3>
          <p>Une place architecturale haut de gamme, préparée pour les portfolios, produits, sponsors et futures pages dédiées.</p>
        </section>
        <section class="tm-showroom-hero">
          <div>
            <p class="landing-kicker">Galerie architecturale intelligente</p>
            <h3 class="tm-showroom-title">Showroom premium</h3>
          </div>
          <div style="display:grid;gap:1rem">
            <p class="tm-showroom-lede">
              Une place architecturale dédiée aux meubles, matériaux, agences, designers,
              créateurs, studios, sponsors et produits liés à l'architecture, à l'habitat
              et à la conception spatiale.
            </p>
            <div style="display:flex;gap:.62rem;flex-wrap:wrap">
              <button type="button" class="text-btn text-btn--primary" data-showroom-publish>Publier dans le Showroom</button>
              <button type="button" class="text-btn" data-nav="feed">Voir la communauté</button>
            </div>
          </div>
        </section>

        <section class="tm-showroom-access">
          <article class="tm-showroom-access-card">
            <p class="landing-kicker">Accès gratuit</p>
            <h3>Consultation limitée</h3>
            <p>Les visiteurs gratuits découvrent la galerie, les catégories et les premiers espaces partenaires.</p>
          </article>
          <article class="tm-showroom-access-card">
            <p class="landing-kicker">Premium</p>
            <h3>Publication et visibilité</h3>
            <p>Les comptes Studio et Agence préparent la publication, les pages dédiées et les mises en avant sponsorisées.</p>
          </article>
          <article class="tm-showroom-access-card">
            <p class="landing-kicker">Sponsor</p>
            <h3>Présence non intrusive</h3>
            <p>Les marques apparaissent comme une galerie partenaire haut de gamme, pas comme de la publicité agressive.</p>
          </article>
        </section>

        ${SHOWROOM_GROUPS.map((group, index) => `
          <section class="tm-showroom-section">
            <div class="tm-showroom-section-head">
              <div>
                <p class="landing-kicker">${_esc(group.subtitle)}</p>
                <h3>${_esc(group.title)}</h3>
              </div>
              <p>${_esc(group.description)}</p>
            </div>
            <div class="tm-showroom-grid">
              ${group.categories.map((cat, i) => `
                <article class="tm-showroom-category">
                  <div class="tm-show-cover" style="--cover:${["#C9A96E","#8C8F86","#B7B0A1","#A9A37A"][index % 4]}"></div>
                  <div class="tm-showroom-category-body">
                    <p class="landing-kicker">${String(i + 1).padStart(2, "0")}</p>
                    <h4 style="font-family:var(--serif);font-size:1.45rem;font-weight:300;color:var(--ink);margin:0">${_esc(cat)}</h4>
                    <p style="color:var(--muted);font-size:.74rem;line-height:1.6;margin:0">Carte premium prête pour futurs produits, créateurs et partenaires.</p>
                    <div class="tm-showroom-slots">
                      ${group.slots.map(slot => `<span class="tm-showroom-slot">${_esc(slot)}</span>`).join("")}
                    </div>
                  </div>
                </article>
              `).join("")}
            </div>
          </section>
        `).join("")}

        <section class="tm-showroom-section">
          <div class="tm-showroom-section-head">
            <div>
              <p class="landing-kicker">Sponsors & partenaires</p>
              <h3>Galerie partenaire haut de gamme</h3>
            </div>
            <button type="button" class="text-btn" data-showroom-publish>Proposer une marque</button>
          </div>
          <div class="tm-showroom-sponsors">
            ${SHOWROOM_SPONSORS.map(sponsor => `
              <article class="tm-showroom-sponsor">
                <p class="landing-kicker">${_esc(sponsor.kind)}</p>
                <h4>${_esc(sponsor.name)}</h4>
                <p>${_esc(sponsor.text)}</p>
                <button type="button" class="text-btn" data-showroom-publish>Préparer l'espace</button>
              </article>
            `).join("")}
          </div>
        </section>

        ${renderShowroomPricing()}
      </div>
    `;

    if (!root.dataset.showroomBound) {
      root.dataset.showroomBound = "1";
      root.addEventListener("click", e => {
        if (!e.target.closest("[data-showroom-publish]")) return;
        e.preventDefault();
        handleShowroomPublish();
      });
    }
  }

  function initPremium() {
    initShowroom();
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
      if (mod.classList.contains("is-active")) initShowroom();
    }).observe(mod, { attributes: true, attributeFilter: ["class"] });
    if (mod.classList.contains("is-active")) initShowroom();
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
        opacity: 0; visibility: hidden; pointer-events: none;
        transition: opacity .26s ease, visibility .26s ease;
      }
      .tm-lb-overlay.is-open { opacity: 1; visibility: visible; pointer-events: auto; }
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
    return;
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

  /* ── Feed social Firestore ──────────────────────────────────── */
  const FEED_RULES = [
    "Interdiction de publier un projet qui ne vous appartient pas.",
    "Obligation de créditer les collaborateurs, enseignants, agences ou sources.",
    "Interdiction de copier, reprendre ou republier un projet sans autorisation.",
    "Interdiction d’usurper l’identité d’un étudiant, architecte ou agence.",
    "Interdiction de harcèlement, insultes, propos discriminatoires ou humiliants.",
    "Interdiction de publier des documents confidentiels d’agence, de client ou d’école.",
    "Tout contenu signalé peut être masqué pendant vérification.",
    "TEOMARCHI peut suspendre ou supprimer un compte en cas d’abus."
  ];

  let _feedUnsubscribe = null;
  let _feedPosts = [];

  function injectFeedCSS() {
    if (document.getElementById("tm-feed-social-css")) return;
    const s = document.createElement("style");
    s.id = "tm-feed-social-css";
    s.textContent = `
      .tm-feed { display:grid; grid-template-columns:minmax(0,.72fr) minmax(0,1.28fr); gap:1.2rem; min-width:0; }
      .tm-feed--connected { grid-template-columns:minmax(240px,.32fr) minmax(0,1.68fr); }
      .tm-feed--connected .tm-feed-timeline { min-height:calc(100dvh - 150px); }
      .tm-feed-wall { align-items:start; }
      .tm-feed-editorial { margin-bottom:1rem; }
      .tm-feed-editorial h3 {
        font-family:var(--serif); font-size:1.8rem; font-weight:300;
        line-height:1.05; color:var(--ink);
      }
      .tm-feed-editorial p:last-child {
        color:var(--muted); font-size:.78rem; line-height:1.6;
      }
      .tm-feed-panel,
      .tm-feed-post {
        display:grid; gap:1rem; padding:1.2rem;
        border:var(--border); border-radius:var(--r-xl);
        background:var(--surface); min-width:0;
      }
      .tm-feed-composer { display:grid; gap:.8rem; }
      .tm-feed-cert { display:flex; align-items:flex-start; gap:.55rem; color:var(--ink-2); font-size:.74rem; line-height:1.45; }
      .tm-feed-cert input { margin-top:.18rem; accent-color:var(--gold); }
      .tm-feed-rules { display:grid; gap:.5rem; padding-left:1rem; color:var(--muted); font-size:.68rem; line-height:1.55; }
      .tm-feed-rules li::marker { color:var(--gold); }
      .tm-feed-timeline { display:grid; gap:1rem; min-width:0; }
      .tm-feed-author { display:flex; gap:.72rem; align-items:center; min-width:0; }
      .tm-feed-avatar {
        width:42px; height:42px; border-radius:50%; display:grid; place-items:center; flex-shrink:0;
        border:0.5px solid rgba(201,169,110,.42); background:rgba(201,169,110,.10);
        color:var(--gold); font-size:.72rem; letter-spacing:.05em; overflow:hidden;
      }
      .tm-feed-avatar img { width:100%; height:100%; object-fit:cover; }
      .tm-feed-author strong { display:block; color:var(--ink); font-size:.86rem; font-weight:500; }
      .tm-feed-author span { display:block; color:var(--muted); font-size:.68rem; }
      .tm-feed-text { color:var(--ink-2); font-size:.86rem; line-height:1.65; white-space:pre-wrap; overflow-wrap:anywhere; }
      .tm-feed-images { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:.6rem; }
      .tm-feed-images img { width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:var(--r-md); border:var(--border); background:var(--surface-2); }
      .tm-feed-actions { display:flex; gap:.48rem; flex-wrap:wrap; padding-top:.8rem; border-top:var(--border); }
      .tm-feed-btn:disabled { opacity:.5; cursor:not-allowed; }
      .tm-feed-comments { display:grid; gap:.6rem; }
      .tm-feed-comment-form { display:flex; gap:.55rem; align-items:center; min-width:0; }
      .tm-feed-comment-form input { flex:1; min-width:0; border:var(--border); border-radius:var(--r-pill); background:var(--surface-2); color:var(--ink); padding:.55rem .8rem; }
      .tm-feed-empty { padding:2.2rem; text-align:center; border:var(--border); border-radius:var(--r-xl); color:var(--muted); background:color-mix(in srgb,var(--surface) 78%,transparent); }
      @media (max-width:900px) { .tm-feed { grid-template-columns:1fr; } }
    `;
    document.head.appendChild(s);
  }

  function renderFeedComposer() {
    const user = getFirebaseUser();
    if (!user) {
      return `
        <div class="tm-feed-panel">
          <p style="margin:0;text-transform:uppercase;letter-spacing:.16em;font-size:.58rem;color:var(--gold)">Publication</p>
          <h3 style="margin:0;font-family:var(--serif);font-size:1.8rem;font-weight:300;color:var(--ink)">Connectez-vous pour publier</h3>
          <p style="margin:0;color:var(--muted);font-size:.82rem;line-height:1.6">
            Vous pouvez lire le Feed public, mais la publication, les likes, commentaires et signalements nécessitent une session Firebase.
          </p>
          <button class="text-btn text-btn--primary" type="button" data-open-login>Connexion</button>
          <div>
            <p style="margin:0 0 .62rem;text-transform:uppercase;letter-spacing:.16em;font-size:.58rem;color:var(--gold)">Règles anti-plagiat</p>
            <ol class="tm-feed-rules">
              ${FEED_RULES.map(rule => `<li>${_esc(rule)}</li>`).join("")}
            </ol>
          </div>
        </div>
      `;
    }

    return `
      <div class="tm-feed-panel">
        <form class="tm-feed-composer" id="feed-composer-form">
          <div>
            <p style="margin:0 0 .22rem;text-transform:uppercase;letter-spacing:.16em;font-size:.58rem;color:var(--gold)">Composer</p>
            <h3 style="margin:0;font-family:var(--serif);font-size:1.8rem;font-weight:300;color:var(--ink)">Publier un rendu</h3>
          </div>
          <div class="tm-feed-field tm-feed-field--full">
            <label for="feed-post-text">Texte court</label>
            <textarea id="feed-post-text" name="text" maxlength="560" placeholder="Partagez une idée, un rendu, une coupe, une intention constructive..."></textarea>
          </div>
          <div class="tm-feed-field tm-feed-field--full">
            <label for="feed-image-urls">Images de projet</label>
            <input id="feed-image-urls" name="imageUrls" placeholder="URLs séparées par des virgules ou des retours ligne">
            <button class="tm-feed-btn" type="button" data-feed-image-focus>Ajouter une image</button>
          </div>
          <label class="tm-feed-cert">
            <input id="feed-certify" data-feed-certify type="checkbox" name="certify">
            <span>Je certifie être l’auteur de ce contenu ou disposer des droits nécessaires.</span>
          </label>
          <button class="text-btn text-btn--primary" id="feed-submit-btn" type="submit" disabled>Publier</button>
        </form>
        <div>
          <p style="margin:0 0 .62rem;text-transform:uppercase;letter-spacing:.16em;font-size:.58rem;color:var(--gold)">Règles anti-plagiat</p>
          <ol class="tm-feed-rules">
            ${FEED_RULES.map(rule => `<li>${_esc(rule)}</li>`).join("")}
          </ol>
        </div>
      </div>
    `;
  }

  function renderPost(post) {
    const user = getFirebaseUser();
    const isOwner = user?.uid && user.uid === post.authorId;
    const canModerate = isTeomarchiAdmin(user);
    const avatar = post.authorAvatar
      ? `<img src="${_esc(post.authorAvatar)}" alt="">`
      : _esc(String(post.authorName || "T").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase());
    const images = Array.isArray(post.imageUrls) ? post.imageUrls.filter(Boolean).slice(0, 4) : [];
    const statusBadge = post.status === "hidden" ? `<span class="badge">Masqué</span>` : "";

    return `
      <article class="tm-feed-post" data-post-id="${_esc(post.id)}">
        <header class="tm-feed-author">
          <div class="tm-feed-avatar" aria-hidden="true">${avatar}</div>
          <div style="min-width:0;flex:1">
            <strong>${_esc(post.authorName || "Utilisateur TEOMARCHI")}</strong>
            <span>${formatFirestoreDate(post.createdAt)} · ${_esc(post.plagiarismStatus || "clear")}</span>
          </div>
          ${statusBadge}
        </header>
        <div class="tm-feed-text">${_esc(post.text || "")}</div>
        ${images.length ? `
          <div class="tm-feed-images">
            ${images.map(url => `<img src="${_esc(url)}" alt="Image de projet publiée sur TEOMARCHI" loading="lazy">`).join("")}
          </div>
        ` : ""}
        <div class="tm-feed-actions" aria-label="Actions de publication">
          <button class="tm-feed-btn" type="button" data-feed-like="${_esc(post.id)}">Like · ${Number(post.likeCount || 0)}</button>
          <button class="tm-feed-btn" type="button" data-feed-repost="${_esc(post.id)}">Republier · ${Number(post.repostCount || 0)}</button>
          <button class="tm-feed-btn" type="button" data-feed-report="${_esc(post.id)}">Signaler · ${Number(post.reportCount || 0)}</button>
          ${(isOwner || canModerate) ? `<button class="tm-feed-btn" type="button" data-feed-delete="${_esc(post.id)}">Supprimer</button>` : ""}
        </div>
        <form class="tm-feed-comments tm-feed-comment-form" data-feed-comment-form="${_esc(post.id)}">
          <input name="comment" maxlength="240" placeholder="Commenter ce rendu">
          <button class="tm-feed-btn" type="submit">Commenter · ${Number(post.commentCount || 0)}</button>
        </form>
      </article>
    `;
  }

  function renderFeedTimeline(posts) {
    const timeline = document.getElementById("feed-timeline");
    if (!timeline) return;
    if (!posts.length) {
      timeline.innerHTML = `
        <div class="tm-feed-empty">
          <p style="font-family:var(--serif);font-size:1.9rem;font-weight:300;margin:0 0 .4rem;color:var(--ink)">Aucun rendu publié</p>
          <p style="margin:0;color:var(--muted);font-size:.82rem">Le Feed est vide pour le moment.</p>
        </div>
      `;
      return;
    }
    timeline.innerHTML = posts.map(renderPost).join("");
  }

  function subscribeToFeed() {
    const db = getFirestoreDb();
    const timeline = document.getElementById("feed-timeline");
    if (!timeline) return;
    if (_feedUnsubscribe) {
      try { _feedUnsubscribe(); } catch {}
      _feedUnsubscribe = null;
    }
    if (!db) {
      timeline.innerHTML = `<div class="tm-feed-empty">Firestore indisponible. Le Feed temps réel ne peut pas être chargé.</div>`;
      return;
    }

    _feedUnsubscribe = db.collection("posts")
      .orderBy("createdAt", "desc")
      .limit(50)
      .onSnapshot(snapshot => {
        const canModerate = isTeomarchiAdmin();
        _feedPosts = [];
        snapshot.forEach(doc => {
          const data = { id: doc.id, ...doc.data() };
          if (data.status === "deleted") return;
          if (data.status === "hidden" && !canModerate) return;
          _feedPosts.push(data);
        });
        renderFeedTimeline(_feedPosts);
      }, err => {
        console.error("Erreur Feed Firestore :", err);
        timeline.innerHTML = `<div class="tm-feed-empty">Erreur de chargement du Feed.</div>`;
      });
  }

  async function resolveFeedProfile(user) {
    const db = getFirestoreDb();
    const fallback = {
      authorId: user.uid,
      authorName: compactUserName(user),
      authorAvatar: user.photoURL || ""
    };
    if (!db) return fallback;
    try {
      const doc = await db.collection("users").doc(user.uid).get();
      const data = doc.exists ? doc.data() : {};
      return {
        authorId: user.uid,
        authorName: data.displayName || fallback.authorName,
        authorAvatar: data.avatarUrl || fallback.authorAvatar
      };
    } catch {
      return fallback;
    }
  }

  async function createPost(form) {
    const user = getFirebaseUser();
    const db = getFirestoreDb();
    if (!user) { openLoginPrompt(); return; }
    if (!db || !form) { notifyUser("Firestore indisponible."); return; }

    const data = new FormData(form);
    const text = String(data.get("text") || "").trim();
    const certify = data.get("certify") === "on";
    const imageUrls = String(data.get("imageUrls") || "")
      .split(/[\n,]+/).map(url => url.trim()).filter(Boolean).slice(0, 4);

    if (!certify) { notifyUser("Certification anti-plagiat obligatoire."); return; }
    if (text.length < 2) { notifyUser("Ajoutez un texte avant de publier."); return; }
    if (text.length > 560) { notifyUser("Texte limité à 560 caractères."); return; }

    const author = await resolveFeedProfile(user);
    await db.collection("posts").add({
      ...author,
      text,
      imageUrls,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likeCount: 0,
      commentCount: 0,
      repostCount: 0,
      reportCount: 0,
      status: "active",
      plagiarismStatus: "clear"
    });
    form.reset();
    const btn = form.querySelector("#feed-submit-btn");
    if (btn) btn.disabled = true;
    notifyUser("Publication envoyée.");
  }

  async function toggleLike(postId) {
    const user = getFirebaseUser();
    const db = getFirestoreDb();
    if (!user) { openLoginPrompt(); return; }
    if (!db || !postId) return;
    const postRef = db.collection("posts").doc(postId);
    const likeRef = postRef.collection("likes").doc(user.uid);
    await db.runTransaction(async tx => {
      const like = await tx.get(likeRef);
      if (like.exists) {
        tx.delete(likeRef);
        tx.update(postRef, { likeCount: incrementBy(-1), updatedAt: serverTimestamp() });
      } else {
        tx.set(likeRef, { userId: user.uid, createdAt: serverTimestamp() });
        tx.update(postRef, { likeCount: incrementBy(1), updatedAt: serverTimestamp() });
      }
    });
  }

  async function addComment(postId, text) {
    const user = getFirebaseUser();
    const db = getFirestoreDb();
    if (!user) { openLoginPrompt(); return; }
    if (!db || !postId) return;
    const clean = String(text || "").trim().slice(0, 240);
    if (!clean) return;
    const author = await resolveFeedProfile(user);
    const postRef = db.collection("posts").doc(postId);
    await postRef.collection("comments").add({
      authorId: author.authorId,
      authorName: author.authorName,
      authorAvatar: author.authorAvatar,
      text: clean,
      createdAt: serverTimestamp(),
      status: "active"
    });
    await postRef.update({ commentCount: incrementBy(1), updatedAt: serverTimestamp() });
  }

  async function repostPost(postId) {
    const user = getFirebaseUser();
    const db = getFirestoreDb();
    if (!user) { openLoginPrompt(); return; }
    if (!db || !postId) return;
    const postRef = db.collection("posts").doc(postId);
    const repostRef = postRef.collection("reposts").doc(user.uid);
    await db.runTransaction(async tx => {
      const repost = await tx.get(repostRef);
      if (repost.exists) return;
      tx.set(repostRef, { userId: user.uid, createdAt: serverTimestamp() });
      tx.update(postRef, { repostCount: incrementBy(1), updatedAt: serverTimestamp() });
    });
    notifyUser("Publication repartagée.");
  }

  async function reportPost(postId) {
    const user = getFirebaseUser();
    const db = getFirestoreDb();
    if (!user) { openLoginPrompt(); return; }
    if (!db || !postId) return;
    await db.collection("reports").add({
      postId,
      reporterId: user.uid,
      reporterEmail: user.email || "",
      reason: "plagiarism_or_abuse",
      status: "open",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await db.collection("posts").doc(postId).update({
      reportCount: incrementBy(1),
      plagiarismStatus: "reported",
      updatedAt: serverTimestamp()
    });
    notifyUser("Signalement transmis à la modération.");
  }

  async function deleteOwnPost(postId) {
    const user = getFirebaseUser();
    const db = getFirestoreDb();
    if (!user) { openLoginPrompt(); return; }
    if (!db || !postId) return;
    const post = _feedPosts.find(item => item.id === postId);
    if (!post || (post.authorId !== user.uid && !isTeomarchiAdmin(user))) return;
    await db.collection("posts").doc(postId).update({
      status: "deleted",
      updatedAt: serverTimestamp()
    });
    notifyUser("Publication supprimée.");
  }

  function bindFeedEvents(root) {
    if (!root || root.dataset.feedBound) return;
    root.dataset.feedBound = "1";

    root.addEventListener("change", e => {
      if (!e.target.matches("[data-feed-certify]")) return;
      const form = e.target.closest("#feed-composer-form");
      const btn = form?.querySelector("#feed-submit-btn");
      if (btn) btn.disabled = !e.target.checked;
    });

    root.addEventListener("submit", async e => {
      const composer = e.target.closest("#feed-composer-form");
      const commentForm = e.target.closest("[data-feed-comment-form]");
      if (!composer && !commentForm) return;
      e.preventDefault();
      try {
        if (composer) await createPost(composer);
        if (commentForm) {
          await addComment(commentForm.dataset.feedCommentForm, commentForm.elements.comment?.value);
          commentForm.reset();
        }
      } catch (err) {
        console.error("Erreur Feed :", err);
        notifyUser("Action impossible pour le moment.");
      }
    });

    root.addEventListener("click", async e => {
      const imageFocus = e.target.closest("[data-feed-image-focus]");
      const like = e.target.closest("[data-feed-like]");
      const repost = e.target.closest("[data-feed-repost]");
      const report = e.target.closest("[data-feed-report]");
      const del = e.target.closest("[data-feed-delete]");
      if (!imageFocus && !like && !repost && !report && !del) return;
      e.preventDefault();
      if (imageFocus) {
        root.querySelector("#feed-image-urls")?.focus();
        return;
      }
      try {
        if (like) await toggleLike(like.dataset.feedLike);
        if (repost) await repostPost(repost.dataset.feedRepost);
        if (report) await reportPost(report.dataset.feedReport);
        if (del) await deleteOwnPost(del.dataset.feedDelete);
      } catch (err) {
        console.error("Erreur action Feed :", err);
        notifyUser("Action impossible pour le moment.");
      }
    });
  }

  function initFeed() {
    const root = document.getElementById("feed-wall");
    if (!root) return;
    injectFeedCSS();
    root.innerHTML = `
      <div class="tm-feed tm-feed-wall ${getFirebaseUser() ? "tm-feed--connected" : "tm-feed--visitor"} tm-shell tm-reveal">
        <aside>
          <section class="tm-feed-editorial tm-editorial-panel">
            <p class="tm-tech-kicker">Mur d’évolution architecturale</p>
            <h3>Partager l’avancement réel du projet.</h3>
            <p>Plans, maquettes, rendus, croquis, essais de matière et décisions constructives.</p>
          </section>
          ${renderFeedComposer()}
        </aside>
        <section class="tm-feed-timeline" id="feed-timeline" aria-live="polite">
          <div class="tm-feed-empty">Chargement du Feed…</div>
        </section>
      </div>
    `;
    bindFeedEvents(root);
    subscribeToFeed();
  }

  (function hookFeed() {
    const mod = document.getElementById("module-feed");
    if (!mod) return;
    new MutationObserver(() => {
      if (mod.classList.contains("is-active")) initFeed();
      else if (_feedUnsubscribe) {
        try { _feedUnsubscribe(); } catch {}
        _feedUnsubscribe = null;
      }
    }).observe(mod, { attributes: true, attributeFilter: ["class"] });
    if (mod.classList.contains("is-active")) initFeed();
  })();

  /* ── Modération Admin Firestore ─────────────────────────────── */
  let _adminUnsubscribers = [];

  function injectAdminModerationCSS() {
    if (document.getElementById("tm-admin-css")) return;
    const s = document.createElement("style");
    s.id = "tm-admin-css";
    s.textContent = `
      .tm-adm { display:grid; gap:1.2rem; min-width:0; }
      .tm-adm-kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:1rem; }
      .tm-adm-kpi {
        background:var(--surface); border:var(--border); border-radius:var(--r-md);
        padding:1.1rem 1.2rem; display:grid; gap:.28rem; min-width:0;
      }
      .tm-adm-kpi__val {
        font-family:var(--serif); font-size:2.1rem; font-weight:300; color:var(--gold); line-height:1;
        overflow-wrap:anywhere;
      }
      .tm-adm-kpi__lbl { font-size:.62rem; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); }
      .tm-adm-section {
        background:var(--surface); border:var(--border); border-radius:var(--r-xl);
        padding:1.2rem; min-width:0; overflow-x:auto;
      }
      .tm-adm-section h3 {
        font-family:var(--serif); font-size:1.45rem; font-weight:300; color:var(--ink);
        margin:0 0 1rem; padding-bottom:.72rem; border-bottom:var(--border);
      }
      .tm-adm-table { width:100%; border-collapse:collapse; min-width:720px; }
      .tm-adm-table th, .tm-adm-table td {
        text-align:left; padding:.55rem .6rem; font-size:.72rem; border-bottom:var(--border);
        vertical-align:top;
      }
      .tm-adm-table th { color:var(--muted); font-weight:500; letter-spacing:.1em; text-transform:uppercase; }
      .tm-adm-table td { color:var(--ink); }
      .tm-adm-badge {
        display:inline-block; padding:.18rem .55rem; border-radius:99px; font-size:.58rem;
        font-weight:600; letter-spacing:.1em; text-transform:uppercase;
        background:rgba(201,169,110,.10); color:var(--gold); border:0.5px solid rgba(201,169,110,.28);
      }
      .tm-adm-actions { display:flex; gap:.5rem; flex-wrap:wrap; }
      .tm-adm-btn {
        padding:.45rem .78rem; border-radius:var(--r-sm); font-size:.68rem; font-weight:500;
        cursor:pointer; border:0.5px solid rgba(201,169,110,.38);
        background:rgba(201,169,110,.08); color:var(--gold); transition:background .15s;
      }
      .tm-adm-btn:hover { background:rgba(201,169,110,.18); }
      .tm-adm-btn--danger { border-color:rgba(220,80,80,.38); background:rgba(220,80,80,.08); color:#dc8080; }
      .tm-adm-btn--danger:hover { background:rgba(220,80,80,.18); }
      .tm-feed-empty {
        padding:1.2rem; border:var(--border); border-radius:var(--r-md);
        color:var(--muted); background:color-mix(in srgb,var(--surface-2) 55%,transparent);
      }
    `;
    document.head.appendChild(s);
  }

  function clearAdminSubscriptions() {
    _adminUnsubscribers.forEach(unsub => {
      try { unsub(); } catch {}
    });
    _adminUnsubscribers = [];
  }

  function renderAdminUsers(target, users) {
    if (!target) return;
    target.innerHTML = users.length ? `
      <table class="tm-adm-table">
        <thead><tr><th>Utilisateur</th><th>Profil</th><th>Statut</th><th>Action</th></tr></thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td>${_esc(u.displayName || u.email || u.id)}</td>
              <td>${_esc([u.level, u.schoolOrAgency, u.city].filter(Boolean).join(" · ") || "—")}</td>
              <td><span class="tm-adm-badge">${_esc(u.status || "active")}</span></td>
              <td>
                <button class="tm-adm-btn tm-adm-btn--danger" type="button" data-admin-suspend-user="${_esc(u.id)}">
                  Suspendre
                </button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    ` : `<p class="tm-feed-empty">Aucun utilisateur</p>`;
  }

  function renderAdminReports(target, reports) {
    if (!target) return;
    target.innerHTML = reports.length ? `
      <table class="tm-adm-table">
        <thead><tr><th>Post</th><th>Signalé par</th><th>Motif</th><th>Statut</th><th>Actions</th></tr></thead>
        <tbody>
          ${reports.map(r => `
            <tr>
              <td>${_esc(r.postId || "—")}</td>
              <td>${_esc(r.reporterEmail || r.reporterId || "—")}</td>
              <td>${_esc(r.reason || "plagiarism_or_abuse")}</td>
              <td><span class="tm-adm-badge">${_esc(r.status || "open")}</span></td>
              <td>
                <div class="tm-adm-actions">
                  <button class="tm-adm-btn" type="button" data-admin-hide-post="${_esc(r.postId || "")}">Masquer</button>
                  <button class="tm-adm-btn tm-adm-btn--danger" type="button" data-admin-delete-post="${_esc(r.postId || "")}">Supprimer</button>
                  <button class="tm-adm-btn" type="button" data-admin-resolve-report="${_esc(r.id)}">Traité</button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    ` : `<p class="tm-feed-empty">Aucun signalement</p>`;
  }

  function renderAdminReportedPosts(target, posts) {
    if (!target) return;
    target.innerHTML = posts.length ? `
      <table class="tm-adm-table">
        <thead><tr><th>Auteur</th><th>Contenu</th><th>Signalements</th><th>Plagiat</th><th>Actions</th></tr></thead>
        <tbody>
          ${posts.map(p => `
            <tr>
              <td>${_esc(p.authorName || p.authorId || "—")}</td>
              <td>${_esc(String(p.text || "").slice(0, 90))}</td>
              <td>${Number(p.reportCount || 0)}</td>
              <td><span class="tm-adm-badge">${_esc(p.plagiarismStatus || "clear")}</span></td>
              <td>
                <div class="tm-adm-actions">
                  <button class="tm-adm-btn" type="button" data-admin-hide-post="${_esc(p.id)}">Masquer</button>
                  <button class="tm-adm-btn tm-adm-btn--danger" type="button" data-admin-delete-post="${_esc(p.id)}">Supprimer</button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    ` : `<p class="tm-feed-empty">Aucun contenu signalé</p>`;
  }

  function bindModerationEvents(root) {
    if (!root || root.dataset.adminBound) return;
    root.dataset.adminBound = "1";
    root.addEventListener("click", async e => {
      const hide = e.target.closest("[data-admin-hide-post]");
      const del = e.target.closest("[data-admin-delete-post]");
      const suspend = e.target.closest("[data-admin-suspend-user]");
      const resolve = e.target.closest("[data-admin-resolve-report]");
      if (!hide && !del && !suspend && !resolve) return;
      const db = getFirestoreDb();
      const user = getFirebaseUser();
      if (!db || !isTeomarchiAdmin(user)) return;
      e.preventDefault();
      try {
        if (hide?.dataset.adminHidePost) {
          await db.collection("posts").doc(hide.dataset.adminHidePost).update({
            status: "hidden",
            plagiarismStatus: "under_review",
            moderatedBy: user.uid,
            updatedAt: serverTimestamp()
          });
        }
        if (del?.dataset.adminDeletePost) {
          await db.collection("posts").doc(del.dataset.adminDeletePost).update({
            status: "deleted",
            moderatedBy: user.uid,
            updatedAt: serverTimestamp()
          });
        }
        if (suspend?.dataset.adminSuspendUser) {
          await db.collection("users").doc(suspend.dataset.adminSuspendUser).set({
            status: "suspended",
            suspendedBy: user.uid,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
        if (resolve?.dataset.adminResolveReport) {
          await db.collection("reports").doc(resolve.dataset.adminResolveReport).update({
            status: "resolved",
            resolvedBy: user.uid,
            resolvedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        notifyUser("Action de modération enregistrée.");
      } catch (err) {
        console.error("Erreur modération :", err);
        notifyUser("Action admin impossible.");
      }
    });
  }

  function initModerationPanel(root = document.getElementById("admin-layout"), user = getFirebaseUser()) {
    if (!root) return;
    injectAdminModerationCSS();
    clearAdminSubscriptions();
    bindModerationEvents(root);

    if (!isTeomarchiAdmin(user)) {
      root.innerHTML = `<p class="tm-feed-empty">Accès réservé à la modération TEOMARCHI.</p>`;
      return;
    }

    const db = getFirestoreDb();
    if (!db) {
      root.innerHTML = `<p class="tm-feed-empty">Firestore indisponible.</p>`;
      return;
    }

    /* Sécurité :
       Ce panneau front prépare l'UX admin, mais l'autorité réelle doit être
       imposée par Firestore Rules et Cloud Functions. Ne jamais exposer de clé
       admin Firebase, service account, webhook secret ou token privé côté client. */
    root.innerHTML = `
      <div class="tm-adm">
        <div class="tm-adm-kpis">
          <div class="tm-adm-kpi"><span class="tm-adm-kpi__val" id="adm-users-count">0</span><span class="tm-adm-kpi__lbl">Utilisateurs</span></div>
          <div class="tm-adm-kpi"><span class="tm-adm-kpi__val" id="adm-reports-count">0</span><span class="tm-adm-kpi__lbl">Signalements</span></div>
          <div class="tm-adm-kpi"><span class="tm-adm-kpi__val" id="adm-posts-count">0</span><span class="tm-adm-kpi__lbl">Posts à vérifier</span></div>
          <div class="tm-adm-kpi"><span class="tm-adm-kpi__val">Rules</span><span class="tm-adm-kpi__lbl">Droits serveur requis</span></div>
        </div>
        <section class="tm-adm-section">
          <h3>Posts signalés / plagiat</h3>
          <div id="admin-reported-posts"><p class="tm-feed-empty">Chargement…</p></div>
        </section>
        <section class="tm-adm-section">
          <h3>Acquisition organique</h3>
          <div class="tm-acquisition-grid">
            ${ACQUISITION_PLAYBOOK.map(item => `
              <article class="tm-acquisition-card">
                <p class="eyebrow">${escapeHTML(item.channel)}</p>
                <strong>${escapeHTML(item.cadence)}</strong>
                <span>${escapeHTML(item.action)}</span>
              </article>
            `).join("")}
          </div>
        </section>
        <section class="tm-adm-section">
          <h3>Signalements</h3>
          <div id="admin-reports"><p class="tm-feed-empty">Chargement…</p></div>
        </section>
        <section class="tm-adm-section">
          <h3>Utilisateurs</h3>
          <div id="admin-users"><p class="tm-feed-empty">Chargement…</p></div>
        </section>
      </div>
    `;

    const usersUnsub = db.collection("users").limit(100).onSnapshot(snap => {
      const users = [];
      snap.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
      const kpi = document.getElementById("adm-users-count");
      if (kpi) kpi.textContent = String(users.length);
      renderAdminUsers(document.getElementById("admin-users"), users);
    }, err => {
      console.error("Erreur admin users :", err);
      const box = document.getElementById("admin-users");
      if (box) box.innerHTML = `<p class="tm-feed-empty">Impossible de charger les utilisateurs.</p>`;
    });

    const reportsUnsub = db.collection("reports").orderBy("createdAt", "desc").limit(80).onSnapshot(snap => {
      const reports = [];
      snap.forEach(doc => reports.push({ id: doc.id, ...doc.data() }));
      const kpi = document.getElementById("adm-reports-count");
      if (kpi) kpi.textContent = String(reports.length);
      renderAdminReports(document.getElementById("admin-reports"), reports);
    }, err => {
      console.error("Erreur admin reports :", err);
      const box = document.getElementById("admin-reports");
      if (box) box.innerHTML = `<p class="tm-feed-empty">Impossible de charger les signalements.</p>`;
    });

    const postsUnsub = db.collection("posts").where("reportCount", ">", 0).orderBy("reportCount", "desc").limit(80).onSnapshot(snap => {
      const posts = [];
      snap.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
      const kpi = document.getElementById("adm-posts-count");
      if (kpi) kpi.textContent = String(posts.length);
      renderAdminReportedPosts(document.getElementById("admin-reported-posts"), posts);
    }, err => {
      console.error("Erreur admin posts :", err);
      const box = document.getElementById("admin-reported-posts");
      if (box) box.innerHTML = `<p class="tm-feed-empty">Impossible de charger les posts signalés.</p>`;
    });

    _adminUnsubscribers.push(usersUnsub, reportsUnsub, postsUnsub);
  }

  document.addEventListener("teomarchi:auth-changed", () => {
    if (document.getElementById("module-feed")?.classList.contains("is-active")) initFeed();
    if (document.getElementById("module-profil")?.classList.contains("is-active")) initProfileEditor();
    if (document.getElementById("module-admin")?.classList.contains("is-active")) initModerationPanel();
  });

  /* ── Export PDF / DWG Simulator ─────────────────────────────── */
  function initExport() {
    return;
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
  setTimeout(() => pushNotification("TEOMARCHI — 11 modules actifs"), 1400);

(function initTeomarchiAuth() {

    const FIREBASE_CONFIG = window.TEOMARCHI_CONFIG.firebase;
    const STRIPE_PUBLIC_KEY = window.TEOMARCHI_CONFIG.stripe.publishableKey;
    const STRIPE_PAYMENT_LINKS = window.TEOMARCHI_CONFIG.stripe.paymentLinks;

    /* Modules nécessitant une connexion. Outils reste consultable librement. */
    const GATED = new Set([]);

    /* ── État ───────────────────────────────────────────────────── */
    let _auth        = null;
    let _user        = null;
    let _isPremium   = false;
    let _userPlan    = "free";
    let _returnMod   = null;
    let _activeTab   = "login";

    const _ready = () =>
      typeof firebase !== "undefined" &&
      FIREBASE_CONFIG.apiKey !== "VOTRE_API_KEY";

    /*
      Checklist Firebase Auth:
      - Ajouter le domaine personnalisé dans Firebase Authorized Domains.
      - Ajouter aussi le domaine Vercel temporaire si utilisé.
      - Vérifier que Google Provider est activé dans Firebase Console.
      - Vérifier que l'email de support OAuth est configuré.
    */

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
          opacity:0;visibility:hidden;pointer-events:none;
          transition:opacity .28s ease,visibility .28s ease;
        }
        .tm-auth-ov.is-open{opacity:1;visibility:visible;pointer-events:auto;}
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
          <button class="tm-auth-x" id="tm-ax" type="button" aria-label="Fermer">×</button>
          <div class="tm-auth-head">
            <h2>TEOMARCHI</h2>
            <p>Plateforme d'intelligence architecturale</p>
          </div>
          <div class="tm-auth-tabs">
            <button class="tm-auth-tab is-on" type="button" data-t="login">Connexion</button>
            <button class="tm-auth-tab" type="button" data-t="signup">Inscription</button>
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
          <button class="tm-auth-btn" id="tm-as" type="button">Se connecter</button>
          <div class="tm-auth-sep">ou</div>
          <button class="tm-auth-google" id="tm-ag" type="button">
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
      document.querySelectorAll("#checkout-btn, [data-checkout-plan], [data-plan='studio'], [data-plan='agence']").forEach(btn => {
        btn.disabled = isBusy;
        btn.classList.toggle("is-loading", isBusy);
        btn.setAttribute("aria-busy", String(isBusy));
      });
    }

    function getStripePaymentLink(planId, user) {
      const safePlan = planId === "agence" ? "agence" : "studio";
      const base = STRIPE_PAYMENT_LINKS[safePlan] || STRIPE_PAYMENT_LINKS.studio;
      if (!base) throw new Error("Lien Stripe indisponible.");
      if (!user?.uid) return base;
      const separator = base.includes("?") ? "&" : "?";
      return `${base}${separator}client_reference_id=${encodeURIComponent(user.uid)}`;
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
            pushNotification("Connecte-toi pour continuer vers l’abonnement.");
          }
          return;
        }

        window.location.assign(getStripePaymentLink(planId, user));
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
    window.getStripePaymentLink = getStripePaymentLink;

    /* ── Handlers ───────────────────────────────────────────────── */
    const _ERR = {
      "auth/invalid-email":            "E-mail invalide.",
      "auth/user-not-found":           "Aucun compte avec cet e-mail.",
      "auth/wrong-password":           "Mot de passe incorrect.",
      "auth/invalid-credential":       "E-mail ou mot de passe incorrect.",
      "auth/email-already-in-use":     "Cet e-mail est déjà utilisé.",
      "auth/weak-password":            "Mot de passe trop court (min. 6 caractères).",
      "auth/popup-closed-by-user":     "Connexion Google annulée. Tu peux relancer la connexion.",
      "auth/popup-blocked":            "Popup bloquée par le navigateur — autorise les popups pour ce site.",
      "auth/cancelled-popup-request":  "Connexion annulée.",
      "auth/network-request-failed":   "Erreur réseau — vérifie ta connexion.",
      "auth/too-many-requests":        "Trop de tentatives. Attends quelques minutes.",
      "auth/user-disabled":            "Ce compte a été désactivé.",
      "auth/operation-not-allowed":    "Méthode de connexion non activée dans Firebase Console.",
      "auth/unauthorized-domain":      "Domaine non autorisé dans Firebase. Ajouter ce domaine dans Firebase Console > Authentication > Settings > Authorized domains.",
      "auth/internal-error":           "Erreur interne Firebase. Vérifie la configuration OAuth puis réessaie.",
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

    function _msg(error, fallback = "Erreur inattendue. Réessaie.") {
      return _ERR[error?.code] || error?.message || fallback;
    }

    async function _google() {
      if (!_ready() || !_auth || !firebase?.auth?.GoogleAuthProvider) {
        _err("Firebase Auth indisponible. Vérifie la configuration Firebase.");
        return;
      }
      const btn = document.getElementById("tm-ag");
      if (btn) btn.disabled = true;
      _err("");
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters?.({ prompt: "select_account" });
        await _auth.signInWithPopup(provider);
        _hide();
        if (typeof pushNotification === "function") pushNotification("Bienvenue sur TEOMARCHI");
      } catch(e) {
        const message = _msg(e, "Erreur Google. Réessaie.");
        _err(message);
        console.warn("TEOMARCHI Google login:", e?.code || e);
        if (typeof pushNotification === "function") pushNotification(message);
      } finally {
        if (btn) btn.disabled = false;
      }
    }

    /* ── Vérifier isPremium depuis Firestore ────────────────────── */
    async function _checkPremium(user) {
      _isPremium = false;
      _userPlan = "free";
      if (!user) return;
      if (user.email === ADMIN_EMAIL) {
        _userPlan = "admin";
        _isPremium = true;
        return;
      }
      try {
        const doc = await firebase.firestore()
          .collection("users").doc(user.uid).get();
        const data = doc.exists ? doc.data() : {};
        _userPlan = getUserPlan({
          user,
          role: data.role,
          plan: data.plan,
          isPremium: data.isPremium === true || data.premium === true
        });
        _isPremium = ["studio", "agency", "moderator", "admin"].includes(_userPlan);
      } catch (_) { /* offline ou règles — pas bloquant */ }
    }

    /* ── Sync UI après changement d'état ────────────────────────── */
    function _syncUI(user) {
      const lbl = document.getElementById("session-label");
      if (lbl) lbl.textContent = user
        ? (user.displayName || user.email.split("@")[0])
        : "Session";

      /* ── Panneau Admin : visible uniquement pour le fondateur ─── */
      const adminTab     = document.getElementById("tab-admin");
      const adminDashBtn = document.getElementById("btn-admin-dash");
      const isAdmin      = user?.email === ADMIN_EMAIL;
      const plan         = isAdmin ? "admin" : (_userPlan || "free");
      document.body.classList.toggle("is-authenticated", !!user);
      document.body.classList.toggle("is-admin", !!isAdmin);
      document.body.dataset.userPlan = user ? plan : "free";
      window.TEOMARCHI_AUTH_STATE = { user: user || null, isAdmin, isPremium: _isPremium, plan, role: plan };
      document.dispatchEvent(new CustomEvent("teomarchi:auth-changed", {
        detail: window.TEOMARCHI_AUTH_STATE
      }));
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
          role:        isAdmin ? "Admin" : PLAN_LABELS[plan] || "Free",
          grade:       isAdmin ? "★★" : (_isPremium ? "★" : "M"),
          connectedAt: new Date().toISOString()
        });
        else TEOMARCHI_APP.session.clear();
      }
    }

    /* ── Panneau Admin ──────────────────────────────────────────── */
    async function _initAdmin() {
      const root = document.getElementById("admin-layout");
      if (!root) return;
      initModerationPanel(root, _user);
      return;
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
      window.auth = _auth;
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
      handleCheckout(btn.dataset.checkoutPlan || "studio");
    }, true);

    /* ── Stripe — intercepte les boutons de plan ───────────────────── */
    document.addEventListener("click", e => {
      const btn = e.target.closest("[data-plan='studio'], [data-plan='agence']");
      if (!btn) return;
      e.preventDefault();
      handleCheckout(btn.dataset.plan || "studio");
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
