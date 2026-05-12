const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const read = (path) => fs.readFileSync(path, "utf8");

test("index delegates CSS and application JavaScript to external files", () => {
  const html = read("index.html");

  assert.match(html, /<link\s+rel="stylesheet"\s+href="style\.css"\s*\/?>/);
  assert.match(html, /<script\s+src="app\.js"\s+defer><\/script>/);
  assert.doesNotMatch(html, /<style[\s>]/);
});

test("closed overlays cannot intercept clicks", () => {
  const css = read("style.css");

  assert.match(css, /\.sidebar-overlay[\s\S]*pointer-events:\s*none/);
  assert.match(css, /\.sidebar-overlay\.is-open[\s\S]*pointer-events:\s*auto/);
  assert.match(css, /\.modal-overlay[\s\S]*visibility:\s*hidden/);
  assert.match(css, /\.modal-overlay\.is-open[\s\S]*visibility:\s*visible/);
  assert.match(css, /\.sliding-panel[\s\S]*pointer-events:\s*none/);
  assert.match(css, /\.sliding-panel\.is-open[\s\S]*pointer-events:\s*auto/);
});

test("SPA routing and UI actions are handled by delegated click listeners", () => {
  const js = read("app.js");

  assert.match(js, /document\.addEventListener\("click"[\s\S]*closest\("\[data-nav\]"\)/);
  assert.match(js, /function\s+navigateTo\s*\(/);
  assert.match(js, /\.module/);
  assert.match(js, /hero[\s\S]*moduleId\s*===\s*"atlas"/);
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

test("public client config is isolated and documents secret boundaries", () => {
  const js = read("app.js");

  assert.match(js, /window\.TEOMARCHI_CONFIG\s*=/);
  assert.match(js, /firebase:\s*{/);
  assert.match(js, /stripe:\s*{/);
  assert.match(js, /Firebase apiKey côté client n'est pas un secret/);
  assert.match(js, /ne jamais mettre sk_live|ne jamais mettre sk_test/);
  assert.match(js, /Authorized Domains|Firestore Rules|Cloud Function/);
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
