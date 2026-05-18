const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const read = (path) => fs.readFileSync(path, "utf8");

test("index delegates CSS and application JavaScript to external files", () => {
  const html = read("index.html");

  assert.match(html, /<link\s+rel="stylesheet"\s+href="style\.css(?:\?[^"]+)?"\s*\/?>/);
  assert.match(html, /<script\s+src="app\.js(?:\?[^"]+)?"\s+defer><\/script>/);
  assert.doesNotMatch(html, /<style[\s>]/);
});

test("closed overlays cannot intercept clicks", () => {
  const css = read("style.css");
  const js = read("app.js");

  assert.match(css, /\.sidebar-overlay[\s\S]*pointer-events:\s*none/);
  assert.match(css, /\.sidebar-overlay\.is-open[\s\S]*pointer-events:\s*auto/);
  assert.match(css, /\.modal-overlay[\s\S]*visibility:\s*hidden/);
  assert.match(css, /\.modal-overlay\.is-open[\s\S]*visibility:\s*visible/);
  assert.match(css, /\.sliding-panel[\s\S]*pointer-events:\s*none/);
  assert.match(css, /\.sliding-panel\.is-open[\s\S]*pointer-events:\s*auto/);
  assert.match(js, /\.tm-auth-ov[\s\S]*visibility:\s*hidden[\s\S]*pointer-events:\s*none/);
  assert.match(js, /\.tm-auth-ov\.is-open[\s\S]*visibility:\s*visible[\s\S]*pointer-events:\s*auto/);
  assert.match(js, /\.tm-lb-overlay[\s\S]*visibility:\s*hidden[\s\S]*pointer-events:\s*none/);
  assert.match(js, /\.tm-lb-overlay\.is-open[\s\S]*visibility:\s*visible[\s\S]*pointer-events:\s*auto/);
});

test("TEOMARCHI exposes premium architectural design-system primitives", () => {
  const css = read("style.css");

  [
    "--concrete",
    "--architectural-beige",
    "--steel",
    "--motion-soft",
    "--module-surface",
    ".tm-shell",
    ".tm-editorial-panel",
    ".tm-architectural-card",
    ".tm-technical-badge",
    ".tm-reveal"
  ].forEach(token => assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});

test("Atlas Chronos and Pantheon expose distinct architectural module identities", () => {
  const js = read("app.js");
  const css = read("style.css");

  [
    "tm-atlas",
    "tm-chronos",
    "tm-pantheon",
    "tm-atlas-map",
    "tm-chronos-spine",
    "tm-pantheon-gallery"
  ].forEach(token => {
    assert.match(js + css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });
});

test("topbar keeps navigation out and gives global search a wider layout", () => {
  const html = read("index.html");
  const css = read("style.css");

  assert.doesNotMatch(html, /class="top-modules"/);
  assert.match(css, /\.navbar[\s\S]*grid-template-columns:\s*auto\s+minmax\(320px,\s*min\(46vw,\s*620px\)\)\s+minmax\(0,\s*1fr\)\s+auto/);
  assert.match(css, /\.search[\s\S]*width:\s*100%/);
  assert.match(css, /\.nav-tools[\s\S]*justify-self:\s*end/);
  assert.match(css, /\.nav-tools[\s\S]*margin-left:\s*auto/);
});

test("Atlas exposes a complete architectural world-exploration experience", () => {
  const js = read("app.js");
  const css = read("style.css");

  [
    "tm-atlas-hero",
    "tm-atlas-globe",
    "tm-atlas-grid-systems",
    "Atlas architectural",
    "key: \"continent\"",
    "lieu",
    "Aucun système constructif"
  ].forEach(token => assert.match(js + css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});

test("Chronos exposes an interactive matter-era timeline and comparison flow", () => {
  const js = read("app.js");
  const css = read("style.css");

  [
    "tm-chronos-timeline",
    "tm-chronos-era-scale",
    "tm-chronos-detail",
    "data-chronos-period",
    "data-chronos-compare",
    "tm-tech-compare",
    "pierre",
    "bois",
    "béton",
    "acier",
    "verre",
    "biosourcé"
  ].forEach(token => assert.match(js + css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")));
  assert.doesNotMatch(js + css, /tm-chronos-arrow/);
  assert.doesNotMatch(css, /\.tm-chronos-period-card::before/);
});

test("Pantheon exposes a museum archive with movements, figures, and influences", () => {
  const js = read("app.js");
  const css = read("style.css");

  [
    "tm-pantheon-archive",
    "tm-pantheon-movement-nav",
    "tm-pantheon-figure-grid",
    "data-pantheon-figure",
    "influences",
    "courantsLies",
    "Vitruve",
    "Brunelleschi",
    "Palladio",
    "Viollet-le-Duc",
    "Gaudí",
    "Frank Lloyd Wright",
    "Le Corbusier",
    "Mies van der Rohe",
    "Alvar Aalto",
    "Louis Kahn",
    "Lina Bo Bardi",
    "Oscar Niemeyer",
    "Tadao Ando",
    "Renzo Piano",
    "Richard Rogers",
    "Norman Foster",
    "Zaha Hadid",
    "Rem Koolhaas",
    "Lacaton & Vassal",
    "Kengo Kuma",
    "Francis Kéré"
  ].forEach(token => assert.match(js + css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});

test("technical modules share lightweight reusable rendering helpers", () => {
  const js = read("app.js");

  [
    "function normalizeSearch",
    "function normalizeText",
    "function filterBySearch",
    "function renderEmptyState",
    "function renderTagList",
    "function getUniqueValues",
    "function renderFilterChips",
    "function renderDetailPanel"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});

test("technical search preserves keyboard focus after filtering", () => {
  const js = read("app.js");

  assert.match(js, /function\s+restoreTechnicalSearchFocus\s*\(/);
  assert.match(js, /setSelectionRange\(cursor,\s*cursor\)/);
  assert.match(js, /document\.activeElement\.matches\("\[data-tech-search\]"\)/);
});

test("outils norms use theme variables instead of fixed dark surfaces", () => {
  const js = read("app.js");

  assert.match(js, /\.tm-normes-cats[\s\S]*background:\s*var\(--surface\)/);
  assert.match(js, /\.tm-normes-item[\s\S]*background:\s*var\(--surface-2\)/);
  assert.match(js, /\.tm-normes-nom[\s\S]*color:\s*var\(--ink\)/);
  assert.doesNotMatch(js, /\.tm-normes-cats[\s\S]{0,220}background:\s*#0C0C0A/);
  assert.doesNotMatch(js, /\.tm-normes-item[\s\S]{0,220}background:\s*#0C0C0A/);
});

test("expanded architectural datasets are present and structured", () => {
  const js = read("app.js");

  [
    "DATA_ATLAS_EXPANDED",
    "DATA_CHRONOS_EXPANDED",
    "DATA_PANTHEON_EXPANDED",
    "DATA_TOOLS_DIMENSIONS",
    "DATA_ECOLOGY",
    "materiauDominant",
    "risqueNaturel",
    "leconArchitecturale",
    "periodeHistorique",
    "innovationTechnique",
    "exemplesArchitecturaux",
    "architectesLies",
    "philosophie",
    "scoreEcologique",
    "Ces recommandations sont pédagogiques"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});

test("ecologie module is registered in the SPA", () => {
  const html = read("index.html");
  const js = read("app.js");

  assert.match(html, /id="tab-ecologie"[\s\S]*data-nav="ecologie"[\s\S]*aria-controls="module-ecologie"/);
  assert.match(html, /id="module-ecologie"[\s\S]*data-module="ecologie"/);
  assert.match(html, /id="ecologie-layout"/);
  assert.match(js, /id:\s*"ecologie"/);
  assert.match(js, /function\s+initEcologie\s*\(/);
  assert.match(js, /document\.getElementById\("ecologie-layout"\)/);
});

test("etudes module exposes Belgium and France study pathways", () => {
  const html = read("index.html");
  const js = read("app.js");

  assert.match(html, /id="module-etudes"[\s\S]*data-module="etudes"/);
  assert.match(html, /id="etudes-layout"/);
  assert.match(js, /const\s+DATA_ETUDES_FILIERES\s*=/);
  assert.match(js, /const\s+DATA_ETUDES_ECOLES\s*=/);
  assert.match(js, /function\s+initEtudes\s*\(/);
  assert.match(js, /document\.getElementById\("etudes-layout"\)/);

  [
    "Belgique",
    "France",
    "Architecture",
    "Architecture d’intérieur",
    "Urbanisme",
    "Paysage",
    "Design d’espace",
    "Design mobilier",
    "Scénographie",
    "Patrimoine / restauration",
    "Ingénierie construction",
    "BIM / modélisation",
    "Architecture durable / écoconstruction",
    "Bruxelles",
    "Liège",
    "Mons",
    "Tournai",
    "Gand",
    "Anvers",
    "Louvain-la-Neuve",
    "Paris",
    "Lyon",
    "Marseille",
    "Nantes",
    "Lille",
    "Bordeaux",
    "Strasbourg",
    "Grenoble",
    "Toulouse",
    "Montpellier"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));

  [
    "data-study-search",
    "data-study-country",
    "data-study-sector",
    "data-study-city",
    "data-study-card",
    "data-study-school",
    "officialUrl",
    "à vérifier",
    "Aucune filière"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});

test("fiches module is replaced by Normes & Villes", () => {
  const html = read("index.html");
  const js = read("app.js");

  assert.match(html, /id="module-fiches"[\s\S]*data-module="fiches"/);
  assert.match(html, /id="fiches-layout"/);
  assert.match(html, /Normes & Villes|Normoth[eè]que urbaine/);
  assert.doesNotMatch(html, /Cahier de détails constructifs|Détails toiture|Fiches techniques/);
  assert.match(js, /const\s+DATA_CITY_STANDARDS\s*=/);
  assert.match(js, /function\s+initFiches\s*\(/);
  assert.match(js, /document\.getElementById\("fiches-layout"\)/);

  [
    "Belgique",
    "France",
    "Suisse",
    "Bruxelles",
    "Liège",
    "Namur",
    "Mons",
    "Charleroi",
    "Tournai",
    "Louvain-la-Neuve",
    "Gand",
    "Anvers",
    "Bruges",
    "Paris",
    "Lyon",
    "Marseille",
    "Lille",
    "Bordeaux",
    "Nantes",
    "Strasbourg",
    "Toulouse",
    "Montpellier",
    "Grenoble",
    "Rennes",
    "Nice",
    "Genève",
    "Lausanne",
    "Fribourg",
    "Neuchâtel",
    "Sion",
    "Zurich",
    "Bâle",
    "Berne",
    "densitéUrbaine",
    "hauteurIndicative",
    "reculIndicatif",
    "stationnement",
    "accessibilité",
    "espacesVerts",
    "normesFeu",
    "acoustique",
    "énergie",
    "toiture",
    "façade",
    "matériauxCourants",
    "documentsOfficiels",
    "liensUtiles"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")));

  [
    "data-city-search",
    "data-city-country",
    "data-city-zone",
    "data-city-card",
    "data-city-country-card",
    "data-city-more",
    "data-external-url",
    "Ces données sont indicatives et pédagogiques",
    "source officielle",
    "indicatif",
    "à vérifier"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});

test("etudes and city standards render progressively without stacking listeners", () => {
  const js = read("app.js");

  assert.match(js, /ETUDES_PAGE_SIZE/);
  assert.match(js, /CITY_PAGE_SIZE/);
  assert.match(js, /slice\(0,\s*_studyState\.visible\)/);
  assert.match(js, /slice\(0,\s*_cityState\.visible\)/);
  assert.match(js, /dataset\.etudesBound/);
  assert.match(js, /dataset\.fichesBound/);
  assert.match(js, /data-study-more/);
  assert.match(js, /data-city-more/);
});

test("expanded datasets cover required scope without deep technical fiches", () => {
  const js = read("app.js");

  [
    "Belgique",
    "France",
    "Pays-Bas",
    "Suisse",
    "Italie",
    "Espagne",
    "Maroc",
    "Égypte",
    "Japon",
    "Chine",
    "Inde",
    "Brésil",
    "Mexique",
    "États-Unis",
    "Canada",
    "Norvège",
    "Suède",
    "Finlande",
    "Allemagne",
    "Royaume-Uni",
    "Grèce",
    "Turquie",
    "Kenya",
    "Afrique du Sud",
    "Indonésie",
    "Australie"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));

  [
    "Restaurant / café",
    "Hôtel",
    "Bibliothèque / espace d’étude",
    "Atelier / espace créatif",
    "Escaliers",
    "Portes & fenêtres"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});

test("Journalier exposes an architectural atelier visual identity", () => {
  const js = read("app.js");

  [
    "tm-journalier-workbench",
    "tm-journalier-timeline",
    "tm-journalier-progress-central"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});

test("Feed exposes an architectural evolution wall identity", () => {
  const js = read("app.js");

  [
    "tm-feed-wall",
    "tm-feed-editorial",
    "Mur d’évolution architecturale"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});

test("Showroom exposes a premium architectural gallery identity", () => {
  const js = read("app.js");

  [
    "tm-showroom-gallery",
    "tm-showroom-material-plaque",
    "Galerie architecturale premium"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});

test("empty public modules can show demo previews without overriding real user data", () => {
  const js = read("app.js");

  assert.match(js, /function\s+renderDemoFeedTimeline\s*\(/);
  assert.match(js, /function\s+renderDemoJournalierPreview\s*\(/);
  assert.match(js, /function\s+renderDemoShowroomPreview\s*\(/);
  assert.match(js, /function\s+renderDemoProfilePreview\s*\(/);
  assert.match(js, /getFirebaseUser/);
  assert.match(js, /shouldShowDemoContent\("feed"\)/);
  assert.match(js, /renderFeedPosts/);
  assert.match(js, /renderDemoFeedTimeline/);
});

test("SPA routing and UI actions are handled by delegated click listeners", () => {
  const js = read("app.js");

  assert.match(js, /document\.addEventListener\("click"[\s\S]*closest\("\[data-nav\]"\)/);
  assert.match(js, /function\s+navigateTo\s*\(/);
  assert.match(js, /\.module/);
  assert.match(js, /moduleId\s*=\s*"accueil"/);
  assert.match(js, /localStorage/);
  assert.match(js, /data-legal-open/);
});

test("legal documents are available inside the SPA shell", () => {
  const html = read("index.html");

  assert.match(html, /id="legal-slider"/);
  assert.match(html, /class="sliding-panel"/);
  assert.match(html, /id="mentions"/);
  assert.match(html, /id="cgv"/);
  assert.match(html, /id="privacy"/);
});

test("navigation targets existing unique SPA modules", () => {
  const html = read("index.html");

  const modules = [...html.matchAll(/data-module="([^"]+)"/g)].map(match => match[1]);
  const navTargets = [...html.matchAll(/data-nav="([^"]+)"/g)].map(match => match[1]);
  const uniqueModules = new Set(modules);

  assert.equal(uniqueModules.size, modules.length);
  for (const target of navTargets) {
    assert.ok(uniqueModules.has(target), `data-nav="${target}" has no matching module`);
  }
});

test("landing is its own accueil module and atlas stays independent", () => {
  const html = read("index.html");
  const js = read("app.js");

  assert.match(html, /id="module-accueil"[\s\S]*data-module="accueil"/);
  assert.match(html, /id="tab-accueil"[\s\S]*data-nav="accueil"/);
  assert.match(html, /id="module-accueil"[\s\S]*id="hero"[\s\S]*id="landing-sections"[\s\S]*<\/section>/);
  assert.match(html, /id="module-atlas"[\s\S]*data-module="atlas"[\s\S]*id="atlas-grid"/);
  assert.doesNotMatch(html, /<section class="module is-active" id="module-atlas"/);
  assert.match(js, /id:\s*"accueil"/);
  assert.doesNotMatch(js, /hero[\s\S]*moduleId\s*===\s*"atlas"/);
  assert.doesNotMatch(js, /landing[\s\S]*moduleId\s*===\s*"atlas"/);
});

test("atelier module has been consolidated into journalier", () => {
  const html = read("index.html");
  const js = read("app.js");

  assert.doesNotMatch(html, /data-nav="atelier"/);
  assert.doesNotMatch(html, /id="tab-atelier"/);
  assert.doesNotMatch(html, /id="module-atelier"/);
  assert.doesNotMatch(html, /data-module="atelier"/);
  assert.match(html, /id="module-journalier"[\s\S]*aria-labelledby="tab-journalier"[\s\S]*data-module="journalier"/);
  assert.match(html, /data-nav="journalier"[\s\S]*aria-controls="module-journalier"/);

  assert.doesNotMatch(js, /id:\s*"atelier"/);
  assert.doesNotMatch(js, /module-atelier/);
  assert.doesNotMatch(js, /atelier-layout|atelier-progress|atelier-todo-list/);
  assert.match(js, /function\s+initJournalier\s*\(/);
  assert.match(js, /document\.getElementById\("journalier-layout"\)/);
});

test("outils owns the scale calculator and room-based norms", () => {
  const js = read("app.js");

  assert.match(js, /function\s+initOutils\s*\(/);
  assert.match(js, /document\.getElementById\("outils-layout"\)/);
  assert.match(js, /tools-scale-real/);
  assert.match(js, /tools-scale-unit/);
  assert.match(js, /tools-scale-plan/);
  assert.match(js, /tools-scale-btn/);
  assert.match(js, /tools-scale-result/);
  assert.doesNotMatch(js, /id="sc-real"|id="sc-plan"|id="sc-btn"/);

  [
    "Salon",
    "Chambre",
    "Cuisine",
    "Salle de bain",
    "WC",
    "Bureau",
    "Garage",
    "Jardin / Terrasse",
    "Circulations",
    "Accessibilité PMR"
  ].forEach(category => assert.match(js, new RegExp(category.replace("/", "\\/"))));
});

test("journalier exposes project state and safe fallbacks", () => {
  const js = read("app.js");

  assert.match(js, /teomarchi\.journalier/);
  assert.match(js, /activeProjectType/);
  assert.match(js, /personnel/);
  assert.match(js, /cours/);
  assert.match(js, /travail/);
  assert.match(js, /JOURNALIER_EMPTY_PROJECT/);
  assert.match(js, /hookJournalier/);
});

test("journalier starts empty and does not inject fake project content", () => {
  const js = read("app.js");

  assert.doesNotMatch(js, /Ville poreuse bas-carbone/);
  assert.doesNotMatch(js, /Mission professionnelle/);
  assert.doesNotMatch(js, /Plans 1\/100|Coupes|Façades|Récit de jury/);
  assert.match(js, /tasks:\s*\[\]/);
  assert.match(js, /deadlines:\s*\[\]/);
});

test("journalier exposes a stable productivity dashboard structure", () => {
  const js = read("app.js");

  [
    "journalier-dashboard",
    "journalier-calendar",
    "journalier-deadlines",
    "journalier-checklist",
    "journalier-analytics",
    "journalier-projects",
    "data-journalier-action"
  ].forEach(token => assert.match(js, new RegExp(token)));
});

test("journalier project schema supports planning metadata", () => {
  const js = read("app.js");

  [
    "color",
    "tag",
    "deadline",
    "notes",
    "status",
    "priority",
    "subtasks",
    "progress"
  ].forEach(field => assert.match(js, new RegExp(field)));
});

test("journalier layout avoids common click and overflow blockers", () => {
  const js = read("app.js");

  assert.match(js, /\.tm-journalier[\s\S]*min-width:\s*0/);
  assert.match(js, /\.tm-journalier[\s\S]*overflow-x:\s*hidden/);
  assert.match(js, /\.tm-journalier button[\s\S]*pointer-events:\s*auto/);
  assert.match(js, /\.tm-journalier button[\s\S]*touch-action:\s*manipulation/);
  assert.doesNotMatch(js, /tm-journalier-list[\s\S]{0,160}max-height:\s*460px/);
});

test("demo user data is disabled by default and never creates a fake local session", () => {
  const js = read("app.js");

  assert.match(js, /const\s+ENABLE_DEMO_DATA\s*=\s*false/);
  assert.match(js, /const\s+DATA_FEED\s*=\s*ENABLE_DEMO_DATA\s*\?/);
  assert.match(js, /const\s+DATA_CONTACTS\s*=\s*ENABLE_DEMO_DATA\s*\?/);
  assert.doesNotMatch(js, /store\.set\(STORAGE\.session,\s*{\s*name:\s*"Jonathan YAV"/);
  assert.doesNotMatch(js, /TEOMARCHI_APP\.session\.set\(\s*{\s*name:\s*"Jonathan YAV"/);
  assert.match(js, /Aucune conversation/);
  assert.match(js, /Aucun rendu publié|Bientôt disponible/);
});

test("demo content is clearly marked and does not create fake user sessions", () => {
  const js = read("app.js");

  [
    "DATA_DEMO_FEED",
    "DATA_DEMO_PROJECT",
    "DATA_DEMO_SHOWROOM",
    "DATA_DEMO_PROFILE",
    "renderDemoBadge",
    "getDemoContent",
    "shouldShowDemoContent"
  ].forEach(token => {
    assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });

  assert.match(js, /isDemo:\s*true/);
  assert.match(js, /Démo/);
  assert.doesNotMatch(js, /(?:localStorage\.setItem|store\.set)\((?:STORAGE\.session|"teomarchi\.session")[\s\S]{0,240}DATA_DEMO/);
  assert.doesNotMatch(js, /DATA_DEMO[\s\S]{0,240}(?:localStorage\.setItem|store\.set)\((?:STORAGE\.session|"teomarchi\.session")/);
  assert.doesNotMatch(js, /TEOMARCHI_APP\.session\.set\(\{[\s\S]{0,320}DATA_DEMO/);
  assert.doesNotMatch(js, /DATA_DEMO[\s\S]{0,320}TEOMARCHI_APP\.session\.set\(\{/);
  assert.doesNotMatch(js, /authorId:\s*"demo-user"/);
});

test("public client config is isolated and documents secret boundaries", () => {
  const js = read("app.js");

  assert.match(js, /window\.TEOMARCHI_CONFIG\s*=/);
  assert.match(js, /firebase:\s*{/);
  assert.match(js, /stripe:\s*{/);
  assert.match(js, /Firebase apiKey côté client n'est pas un secret/);
  assert.match(js, /ne jamais mettre sk_live|ne jamais mettre sk_test/);
  assert.match(js, /Authorized Domains|Firestore Rules|Cloud Function/);
});

test("google login is guarded and reports actionable Firebase auth errors", () => {
  const js = read("app.js");

  assert.match(js, /if\s*\(!firebase\.apps\.length\)\s*firebase\.initializeApp\(FIREBASE_CONFIG\)/);
  assert.match(js, /firebase\.auth\(\)/);
  assert.match(js, /const\s+provider\s*=\s*new firebase\.auth\.GoogleAuthProvider\(\)/);
  assert.match(js, /signInWithPopup\(provider\)/);
  assert.match(js, /Domaine non autorisé dans Firebase\. Ajouter ce domaine dans Firebase Console > Authentication > Settings > Authorized domains\./);

  [
    "auth/unauthorized-domain",
    "auth/popup-blocked",
    "auth/popup-closed-by-user",
    "auth/network-request-failed",
    "auth/internal-error"
  ].forEach(code => assert.match(js, new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));

  [
    "Ajouter le domaine personnalisé",
    "Ajouter aussi le domaine Vercel temporaire",
    "Google Provider est activé",
    "email de support OAuth"
  ].forEach(note => assert.match(js, new RegExp(note)));
});

test("capturing payment listeners do not suppress unrelated SPA clicks", () => {
  const js = read("app.js");

  assert.doesNotMatch(js, /#checkout-btn[\s\S]{0,260}stopImmediatePropagation/);
  assert.doesNotMatch(js, /\[data-plan='studio'\][\s\S]{0,260}stopImmediatePropagation/);
  assert.match(js, /closest\("\[data-nav\]"\)/);
});

test("atlas chronos and pantheon use enriched technical datasets and generic renderer", () => {
  const js = read("app.js");

  assert.match(js, /function\s+renderTechnicalCards\s*\(/);
  assert.match(js, /function\s+initAtlas\s*\(/);
  assert.match(js, /function\s+initChronos\s*\(/);
  assert.match(js, /function\s+initPantheon\s*\(/);

  [
    "systemeConstructif",
    "matiere",
    "portee",
    "inertie",
    "technique",
    "lecon",
    "consequenceSpatiale",
    "apportTechnique",
    "leconProjet"
  ].forEach(field => assert.match(js, new RegExp(field)));

  [
    "data-tech-filter",
    "data-tech-search",
    "data-tech-card",
    "data-tech-detail",
    "data-chronos-compare",
    "tm-tech-compare"
  ].forEach(token => assert.match(js, new RegExp(token)));
});

test("home page explains TEOMARCHI identity and exposes clear CTAs", () => {
  const html = read("index.html");
  const js = read("app.js");

  assert.match(html, /TEOMARCHI est une plateforme d’intelligence architecturale créée par Jonathan YAV/);
  assert.match(html, /Un monde meilleur commence par un habitat mieux pensé/);
  assert.match(html, /Penser mieux l’habitat, construire mieux le monde/);
  assert.match(html, /data-nav="atlas"[\s\S]*Explorer l’Atlas/);
  assert.match(html, /data-open-login[\s\S]*Créer un compte/);
  assert.match(html, /Pourquoi TEOMARCHI/);
  assert.match(html, /créée par Jonathan YAV/i);
  assert.match(html, /Bibliothèque architecturale, outils de conception/);
  assert.match(html, /Collaboration|Sponsors|Communauté/);
  assert.match(js, /function\s+initLandingSections\s*\(/);
  assert.match(js, /landing-modules-grid/);
  assert.match(js, /landing-proof-grid/);
  assert.match(js, /Trois exemples concrets avant de créer un compte/);
  assert.match(js, /Belgique[\s\S]*Brique[\s\S]*humidité[\s\S]*isolation continue/i);
  assert.match(js, /landing-premium-grid/);
});

test("landing exposes onboarding actions and start checklist", () => {
  const js = read("app.js");
  const css = read("style.css");

  assert.match(js, /function\s+initOnboarding\s*\(/);
  assert.match(js, /function\s+renderOnboardingWelcome\s*\(/);
  assert.match(js, /function\s+renderStartChecklist\s*\(/);
  assert.match(js, /Démarrer avec TEOMARCHI/);
  assert.match(js, /Lancer la visite guidée/);
  assert.match(js, /Voir une démo/);
  assert.match(js, /data-onboarding-start/);
  assert.match(js, /data-demo-open/);
  assert.match(css, /\.tm-onboarding/);
  assert.match(css, /\.tm-start-checklist/);
});

test("showroom is a premium scalable architectural marketplace shell", () => {
  const html = read("index.html");
  const js = read("app.js");

  assert.match(html, /Showroom architectural/);
  assert.match(js, /function\s+initShowroom\s*\(/);
  assert.match(js, /SHOWROOM_GROUPS/);
  assert.match(js, /SHOWROOM_SPONSORS/);
  assert.match(js, /data-showroom-publish/);
  assert.match(js, /visiteur gratuit|consultation limitée/i);
  assert.match(js, /premium[\s\S]*publication[\s\S]*visibilité/i);

  [
    "Mobilier",
    "Matériaux",
    "Agences & Studios",
    "Jeunes créateurs / designers",
    "Sponsors & partenaires",
    "mobilier urbain",
    "mobilier expérimental",
    "matériaux biosourcés",
    "terre crue",
    "architecture expérimentale",
    "logiciels BIM"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")));

  assert.match(js, /id="checkout-btn"/);
  assert.match(js, /data-checkout-plan="\$\{plan\.id\}"/);
});

test("feed uses Firestore realtime social primitives without fake posts", () => {
  const js = read("app.js");

  [
    "initFeed",
    "renderFeedComposer",
    "renderPost",
    "bindFeedEvents",
    "subscribeToFeed",
    "createPost",
    "toggleLike",
    "addComment",
    "repostPost",
    "reportPost"
  ].forEach(fn => assert.match(js, new RegExp(`function\\s+${fn}\\s*\\(`)));

  assert.match(js, /\.collection\("posts"\)/);
  assert.match(js, /\.onSnapshot\(/);
  assert.match(js, /serverTimestamp\(\)/);
  assert.match(js, /\.collection\("likes"\)/);
  assert.match(js, /\.collection\("comments"\)/);
  assert.match(js, /\.collection\("reposts"\)/);
  assert.match(js, /\.collection\("reports"\)/);
  assert.match(js, /status:\s*"active"/);
  assert.match(js, /plagiarismStatus:\s*"clear"/);
  assert.match(js, /Je certifie être l’auteur de ce contenu ou disposer des droits nécessaires/);
  assert.match(js, /Aucun rendu publié/);
});

test("feed initializes safely when opened directly from the URL hash", () => {
  const js = read("app.js");

  assert.match(js, /document\.dispatchEvent\(new CustomEvent\("teomarchi:navigate"/);
  assert.match(js, /moduleId === "feed"[\s\S]{0,220}initFeed\(\)/);
  assert.match(js, /function\s+renderFeedPendingState\s*\(/);
  assert.match(js, /data-feed-pending="true"/);
  assert.doesNotMatch(js, /<div class="tm-feed-empty">Chargement du Feed/);
});

test("journalier and showroom initialize safely when opened directly from the URL hash", () => {
  const js = read("app.js");

  assert.match(js, /moduleId === "journalier"[\s\S]{0,260}initJournalier\(\)/);
  assert.match(js, /moduleId === "showroom"[\s\S]{0,260}initShowroom\(\)/);
  assert.match(js, /document\.getElementById\("module-journalier"\)\?\.classList\.contains\("is-active"\)/);
  assert.match(js, /document\.getElementById\("module-showroom"\)\?\.classList\.contains\("is-active"\)/);
});

test("profile editor persists real Firebase profile data in Firestore", () => {
  const js = read("app.js");

  assert.match(js, /function\s+initProfileEditor\s*\(/);
  assert.match(js, /function\s+saveProfile\s*\(/);
  assert.match(js, /\.collection\("users"\)\.doc\(user\.uid\)/);

  [
    "displayName",
    "bio",
    "schoolOrAgency",
    "level",
    "city",
    "specialties",
    "avatarUrl",
    "portfolioUrl",
    "role",
    "status"
  ].forEach(field => assert.match(js, new RegExp(field)));
});

test("admin moderation is prepared for reported posts and suspended accounts", () => {
  const js = read("app.js");

  assert.match(js, /function\s+initModerationPanel\s*\(/);
  assert.match(js, /teomarchi@teomarchi\.com/);
  assert.match(js, /data-admin-hide-post/);
  assert.match(js, /data-admin-delete-post/);
  assert.match(js, /data-admin-suspend-user/);
  assert.match(js, /data-admin-resolve-report/);
  assert.match(js, /status:\s*"hidden"/);
  assert.match(js, /status:\s*"deleted"/);
  assert.match(js, /status:\s*"suspended"/);
  assert.match(js, /Firestore Rules|Cloud Functions/);
});

test("recommended Firestore rules protect social data and moderation", () => {
  const rules = read("firestore.rules");

  assert.match(rules, /match \/posts\/\{postId\}/);
  assert.match(rules, /match \/likes\/\{userId\}/);
  assert.match(rules, /match \/comments\/\{commentId\}/);
  assert.match(rules, /match \/reposts\/\{userId\}/);
  assert.match(rules, /match \/reports\/\{reportId\}/);
  assert.match(rules, /match \/users\/\{userId\}/);
  assert.match(rules, /isModerator\(\)|isAdmin\(\)/);
  assert.match(rules, /request\.auth\.uid == resource\.data\.authorId|request\.auth\.uid == userId/);
});

test("Firebase and Stripe security boundaries are explicit", () => {
  const js = read("app.js");
  const rules = read("firestore.rules");

  assert.match(js, /TEOMARCHI_ROLES/);
  assert.match(js, /USER_STATUS/);
  assert.match(js, /teomarchi@teomarchi\.com/);
  assert.match(js, /ne jamais mettre sk_live/);
  assert.match(js, /webhook secret|service account/);
  assert.doesNotMatch(js, /sk_live_[A-Za-z0-9]/);
  assert.doesNotMatch(js, /sk_test_[A-Za-z0-9]/);
  assert.doesNotMatch(js, /whsec_[A-Za-z0-9]/);

  ["user", "premium", "agency", "moderator", "admin", "active", "suspended", "deleted"].forEach(token => {
    assert.match(js + rules, new RegExp(token));
  });

  assert.match(rules, /match \/securityLogs\/\{logId\}/);
  assert.match(rules, /request\.resource\.data\.keys\(\)\.hasOnly\(\[\s*"userId"/);
  assert.match(rules, /allow read,\s*update,\s*delete:\s*if isModerator\(\)/);
});

test("Contact Sponsors module and sponsor deck are exposed in the SPA", () => {
  const html = read("index.html");
  const js = read("app.js");

  assert.match(html, /id="tab-contact"[\s\S]*data-nav="contact"[\s\S]*aria-controls="module-contact"/);
  assert.match(html, /id="module-contact"[\s\S]*data-module="contact"/);
  assert.match(html, /id="contact-layout"/);
  assert.match(js, /id:\s*"contact"/);
  assert.match(js, /function\s+initContactSponsors\s*\(/);
  assert.match(js, /SPONSOR_DECK_SECTIONS/);

  [
    "Contact & Sponsors",
    "Proposer un partenariat",
    "Contacter TEOMARCHI",
    "Devenir sponsor",
    "sponsoring showroom",
    "sponsoring module",
    "soutien développement",
    "licences logicielles",
    "matériel",
    "collaborations écoles/agences",
    "TEOMARCHI en une phrase",
    "audience",
    "offres sponsor",
    "contact"
  ].forEach(token => assert.match(js + html, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")));
});

test("TEOMARCHI AI panel is visible, guarded and architecture-scoped", () => {
  const html = read("index.html");
  const js = read("app.js");

  assert.match(html, /id="ai-panel-btn"[\s\S]*data-ai-open/);
  [
    "AI_NAME_CANDIDATES",
    "Lithia",
    "initTeomarchiAI",
    "openAIPanel",
    "closeAIPanel",
    "renderAIIntro",
    "handleAIMessage",
    "getLocalArchitectureAnswer",
    "sanitizeAIInput",
    "guardAIResponseDomain"
  ].forEach(token => assert.match(js, new RegExp(token)));

  [
    "Quel matériau pour un climat humide ?",
    "Comment améliorer l’inertie thermique ?",
    "Quelle toiture pour la Belgique ?",
    "Quel système constructif bas-carbone ?",
    "Aide-moi à organiser mon projet.",
    "L’IA TEOMARCHI fournit une aide pédagogique",
    "ne pas entrer d’informations confidentielles"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));

  assert.match(js, /demande de secrets|code source|prompt injection/);
  assert.match(js, /securityLogs/);
  assert.match(js, /\/teo-admin/);
  assert.match(js, /email\s*===\s*ADMIN_EMAIL|userEmail\s*===\s*ADMIN_EMAIL/);
});

test("mobile layout has explicit anti-overflow and panel safeguards", () => {
  const css = read("style.css");
  const js = read("app.js");

  assert.match(css, /html,\s*body[\s\S]*overflow-x:\s*hidden/);
  assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*\.navbar/);
  assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*\.search-wrap/);
  assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*\.module/);
  assert.match(css, /@media\s*\(max-width:\s*720px\)[\s\S]*\.text-btn/);
  assert.match(js, /\.tm-ai-panel[\s\S]*pointer-events:\s*none/);
  assert.match(js, /\.tm-ai-panel\.is-open[\s\S]*pointer-events:\s*auto/);
});

test("SaaS roles, plans and upgrade gates are product-ready", () => {
  const js = read("app.js");
  const rules = read("firestore.rules");

  ["free", "studio", "agency", "moderator", "admin"].forEach(token => {
    assert.match(js + rules, new RegExp(token));
  });

  assert.match(js, /const\s+PLAN_ACCESS\s*=/);
  assert.match(js, /function\s+getUserPlan\s*\(/);
  assert.match(js, /function\s+canAccessFeature\s*\(/);
  assert.match(js, /function\s+renderUpgradeGate\s*\(/);
  assert.match(js, /data-upgrade-plan/);
  assert.match(js, /admin[\s\S]{0,160}(bypass|contourne|accès à tous les modules)/i);
  assert.doesNotMatch(js, /TEOMARCHI_ROLES\s*=\s*Object\.freeze\(\["user",\s*"premium"/);
});

test("auth UX hides signup when connected and confirms logout", () => {
  const js = read("app.js");
  const css = read("style.css");

  assert.match(js, /function\s+openLogoutConfirm\s*\(/);
  assert.match(js, /function\s+confirmLogout\s*\(/);
  assert.match(js, /Êtes-vous sûr de vouloir vous déconnecter/);
  assert.match(js, /data-logout-confirm/);
  assert.match(js, /data-logout-cancel/);
  assert.match(js, /document\.body\.classList\.toggle\("is-authenticated",\s*!!user\)/);
  assert.match(css, /body\.is-authenticated[\s\S]*\[data-open-login\][\s\S]*display:\s*none/);
});

test("profile supports avatar upload with preview and Firebase Storage fallback", () => {
  const html = read("index.html");
  const js = read("app.js");

  assert.match(html, /firebase-storage-compat\.js/);
  assert.match(js, /function\s+uploadProfileAvatar\s*\(/);
  assert.match(js, /id="profile-avatar-file"/);
  assert.match(js, /data-profile-avatar-preview/);
  assert.match(js, /firebase\.storage\(\)/);
  assert.match(js, /Avatar mis à jour|Photo de profil sauvegardée/);
});

test("legal copy and landing shell do not expose raw placeholders or empty preparation labels", () => {
  const html = read("index.html");

  assert.doesNotMatch(html, /\[(VOTRE|ADRESSE|NUM[ÉE]RO|SIRET|EI \/ SASU|NOM DE L'H[ÉE]BERGEUR|URL DE L'H[ÉE]BERGEUR)/i);
  assert.doesNotMatch(html, /À compléter avant mise en production/i);
  assert.doesNotMatch(html, /contenu en préparation/i);
  assert.doesNotMatch(html, /Produits partenaires prescriptibles — contenu en préparation/i);
  assert.doesNotMatch(html, /données chargées dynamiquement|contenu en chargement|flux Firestore|Plateforme en développement actif/i);
  assert.doesNotMatch(html, /localStorage/);
});

test("journalier persistence is prepared for Firestore with local fallback and visible save status", () => {
  const js = read("app.js");

  assert.match(js, /function\s+saveJournalierCloud\s*\(/);
  assert.match(js, /function\s+setSaveStatus\s*\(/);
  assert.match(js, /id="journalier-save-status"/);
  assert.match(js, /collection\("users"\)\.doc\(user\.uid\)\.collection\("journalier"\)/);
  assert.match(js, /Sauvegarde navigateur|Sauvegarde cloud|cloud indisponible/);
});

test("admin exposes a simple organic acquisition playbook", () => {
  const js = read("app.js");

  assert.match(js, /ACQUISITION_PLAYBOOK/);
  [
    "LinkedIn",
    "Reddit / Discord",
    "Partenariats écoles",
    "Instagram/TikTok",
    "La Cambre",
    "ENSAV",
    "ENSA Paris"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});

test("landing section titles use wide editorial layout and no decorative status mark", () => {
  const js = read("app.js");
  const css = read("style.css");

  assert.match(js, /landing-band--modules/);
  assert.match(js, /landing-band__head/);
  assert.match(js, /landing-title landing-title--wide/);
  assert.match(js, /Plateforme évolutive, ouverte aux collaborations sélectives\./);
  assert.doesNotMatch(js, /landing-status__mark/);
  assert.match(css, /\.landing-title--wide[\s\S]*max-width:\s*min\(100%,\s*34ch\)/);
  assert.match(css, /\.landing-band--modules[\s\S]*text-align:\s*center/);
});

test("Chronos and Pantheon controls have optimized module-specific layouts", () => {
  const js = read("app.js");
  const css = read("style.css");

  assert.match(js, /tm-chronos-track/);
  assert.match(js, /data-chronos-era/);
  assert.match(js, /tm-chronos-spine__stats/);
  assert.match(js, /controlsClass:\s*"tm-tech-controls--pantheon"/);
  assert.match(js, /options\.controlsClass/);
  assert.match(css, /\.tm-tech-controls--pantheon[\s\S]*grid-template-columns/);
});

test("Feed prioritizes timeline space for connected users and uses clearer editorial copy", () => {
  const js = read("app.js");

  assert.match(js, /tm-feed--connected/);
  assert.match(js, /Partager l’avancement réel du projet\./);
  assert.doesNotMatch(js, /Publier des étapes, pas du bruit\./);
  assert.match(js, /\.tm-feed--connected[\s\S]*grid-template-columns:\s*minmax\(240px,\s*\.32fr\)\s+minmax\(0,\s*1\.68fr\)/);
});

test("Contact module uses TEOMARCHI contact details instead of placeholders", () => {
  const js = read("app.js");

  assert.match(js, /Contacter TEOMARCHI/);
  assert.doesNotMatch(js, /Contacter Jonathan Yav/);
  assert.match(js, /@teomarchi\.co/);
  assert.match(js, /En attente de création/);
  assert.match(js, /teomarchi\.com/);
  assert.doesNotMatch(js, /Placeholder officiel à connecter|Placeholder domaine TEOMARCHI/);
});
