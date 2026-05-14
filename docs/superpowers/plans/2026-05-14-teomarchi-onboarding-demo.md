# TEOMARCHI Onboarding Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a credible first-use onboarding and clearly labeled demo content so visitors understand TEOMARCHI before creating an account.

**Architecture:** Keep the existing Vanilla JS SPA structure. Add onboarding state and demo datasets inside `app.js`, render lightweight UI through existing module render functions, and preserve the separation between demo content and Firebase user data.

**Tech Stack:** Vanilla JavaScript, HTML, CSS, Firebase compat SDK, existing Node test suite with `node:test`.

---

## File Structure

- Modify: `tests/spa-architecture.test.js`
  - Adds acceptance tests for onboarding, demo content, anti-fake-session behavior, and visible demo badges.
- Modify: `app.js`
  - Adds onboarding state helpers, demo datasets, demo rendering helpers, event handlers, and module integration.
- Modify: `style.css`
  - Adds the onboarding panel, checklist, demo badge, and demo cards styling.
- No new framework, package, Firebase collection, or service worker is introduced in this sprint.

## Task 1: Add Failing Tests For Onboarding And Demo Content

**Files:**
- Modify: `tests/spa-architecture.test.js`

- [ ] **Step 1: Add tests describing the public onboarding**

Append this test near the existing landing tests:

```js
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
```

- [ ] **Step 2: Add tests enforcing honest demo data**

Append this test near the existing demo-user test:

```js
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
  assert.doesNotMatch(js, /localStorage\.setItem\("teomarchi\.session"[\s\S]{0,160}DATA_DEMO/);
  assert.doesNotMatch(js, /authorId:\s*"demo-user"/);
});
```

- [ ] **Step 3: Add tests for module empty-state demos**

Append this test near the Feed and Showroom tests:

```js
test("empty public modules can show demo previews without overriding real user data", () => {
  const js = read("app.js");

  assert.match(js, /function\s+renderDemoFeedTimeline\s*\(/);
  assert.match(js, /function\s+renderDemoJournalierPreview\s*\(/);
  assert.match(js, /function\s+renderDemoShowroomPreview\s*\(/);
  assert.match(js, /function\s+renderDemoProfilePreview\s*\(/);
  assert.match(js, /getFirebaseUser\(\)\s*\?\s*"real"\s*:\s*"demo"/);
  assert.match(js, /posts\.length\s*\?\s*renderFeedPosts/);
  assert.match(js, /renderDemoFeedTimeline/);
});
```

- [ ] **Step 4: Run the tests to verify failure**

Run:

```bash
node --test tests/spa-architecture.test.js
```

Expected: FAIL because the onboarding and demo functions do not exist yet.

- [ ] **Step 5: Commit the failing tests**

```bash
git add tests/spa-architecture.test.js
git commit -m "test: define onboarding demo behavior"
```

## Task 2: Add Demo Data And Onboarding State Helpers

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add state and demo constants**

Place this block after the existing storage helper definitions near the top of `app.js`:

```js
const ONBOARDING_STORAGE_KEY = "teomarchi.onboarding";

const ONBOARDING_STEPS = Object.freeze([
  {
    id: "atlas-preview",
    title: "Explorer une entrée Atlas",
    text: "Comparer un pays, un climat, une matière et une leçon constructive.",
    nav: "atlas"
  },
  {
    id: "scale-tool",
    title: "Tester une conversion d'échelle",
    text: "Passer d'une mesure réelle à une mesure sur plan.",
    nav: "outils"
  },
  {
    id: "pantheon-preview",
    title: "Lire une fiche Panthéon",
    text: "Relier architecte, doctrine, matière et apport technique.",
    nav: "pantheon"
  },
  {
    id: "journalier-preview",
    title: "Comprendre le Journalier",
    text: "Voir comment un projet se structure en tâches, jalons et progression.",
    nav: "journalier"
  }
]);

const DATA_DEMO_FEED = Object.freeze([
  {
    id: "demo-feed-coupe-brique",
    isDemo: true,
    label: "Démo",
    authorName: "Atelier TEOMARCHI",
    text: "Étude d'une façade en brique isolée : continuité thermique, ventilation et gestion de l'humidité.",
    tags: ["brique", "isolation", "façade"],
    likeCount: 18,
    commentCount: 4,
    repostCount: 2
  },
  {
    id: "demo-feed-maquette-bois",
    isDemo: true,
    label: "Démo",
    authorName: "Atelier TEOMARCHI",
    text: "Maquette de trame bois : structure répétitive, préfabrication et réduction des chutes.",
    tags: ["bois", "trame", "bas-carbone"],
    likeCount: 23,
    commentCount: 6,
    repostCount: 3
  },
  {
    id: "demo-feed-patio",
    isDemo: true,
    label: "Démo",
    authorName: "Atelier TEOMARCHI",
    text: "Maison patio en climat chaud : inertie, ombrage, ventilation traversante et seuils protégés.",
    tags: ["patio", "climat chaud", "inertie"],
    likeCount: 15,
    commentCount: 3,
    repostCount: 1
  }
]);

const DATA_DEMO_PROJECT = Object.freeze({
  id: "demo-project-atelier",
  isDemo: true,
  label: "Démo",
  title: "Logement compact et traversant",
  progress: 42,
  tasks: ["Programme", "Références", "Plan 1/100", "Coupe constructive"],
  deadline: "Jury intermédiaire"
});

const DATA_DEMO_SHOWROOM = Object.freeze([
  {
    id: "demo-showroom-clt",
    isDemo: true,
    label: "Démo",
    title: "Panneau CLT bas-carbone",
    category: "Matériaux",
    text: "Exemple de fiche sponsorisable : usage, portée, fournisseur et projet associé."
  },
  {
    id: "demo-showroom-chaise",
    isDemo: true,
    label: "Démo",
    title: "Assise bois minimaliste",
    category: "Mobilier",
    text: "Exemple de carte produit pour designers, fabricants ou jeunes créateurs."
  }
]);

const DATA_DEMO_PROFILE = Object.freeze({
  id: "demo-profile",
  isDemo: true,
  label: "Démo",
  displayName: "Profil architectural exemple",
  bio: "Un profil TEOMARCHI peut présenter une approche, des spécialités, des logiciels et des projets.",
  specialties: ["logement", "bois", "réhabilitation"]
});
```

- [ ] **Step 2: Add onboarding state helpers**

Place this block after the constants from Step 1:

```js
function getOnboardingState() {
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      dismissed: Boolean(parsed.dismissed),
      completedSteps: Array.isArray(parsed.completedSteps) ? parsed.completedSteps : [],
      lastSeenAt: parsed.lastSeenAt || ""
    };
  } catch {
    return { dismissed: false, completedSteps: [], lastSeenAt: "" };
  }
}

function saveOnboardingState(state) {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({
      dismissed: Boolean(state.dismissed),
      completedSteps: Array.isArray(state.completedSteps) ? state.completedSteps : [],
      lastSeenAt: new Date().toISOString()
    }));
  } catch {}
}

function markOnboardingStepDone(stepId) {
  if (!stepId) return;
  const state = getOnboardingState();
  const completedSteps = Array.from(new Set([...state.completedSteps, stepId]));
  saveOnboardingState({ ...state, completedSteps });
}

function dismissOnboarding() {
  const state = getOnboardingState();
  saveOnboardingState({ ...state, dismissed: true });
}
```

- [ ] **Step 3: Add demo helper functions**

Place this block after the state helpers:

```js
function renderDemoBadge(label = "Démo") {
  return `<span class="tm-demo-badge" aria-label="Contenu de démonstration">${escapeHTML(label)}</span>`;
}

function getDemoContent(moduleId) {
  const map = {
    feed: DATA_DEMO_FEED,
    journalier: DATA_DEMO_PROJECT,
    showroom: DATA_DEMO_SHOWROOM,
    profil: DATA_DEMO_PROFILE
  };
  return map[moduleId] || null;
}

function shouldShowDemoContent(moduleId) {
  if (!moduleId) return false;
  if (getFirebaseUser()) return false;
  return Boolean(getDemoContent(moduleId));
}
```

- [ ] **Step 4: Run targeted tests**

Run:

```bash
node --test tests/spa-architecture.test.js
```

Expected: Some tests still FAIL because render functions and UI integration are not implemented yet.

- [ ] **Step 5: Commit helpers**

```bash
git add app.js
git commit -m "feat: add onboarding demo helpers"
```

## Task 3: Render Public Onboarding On The Landing

**Files:**
- Modify: `app.js`
- Modify: `style.css`

- [ ] **Step 1: Add landing render functions**

Place these functions near `initLandingSections()` in `app.js`:

```js
function renderStartChecklist() {
  const state = getOnboardingState();
  const completed = new Set(state.completedSteps);
  return `
    <div class="tm-start-checklist" aria-live="polite">
      ${ONBOARDING_STEPS.map(step => {
        const done = completed.has(step.id);
        return `
          <button class="tm-start-step ${done ? "is-complete" : ""}"
                  type="button"
                  data-onboarding-step="${escapeHTML(step.id)}"
                  data-nav="${escapeHTML(step.nav)}"
                  aria-pressed="${done ? "true" : "false"}">
            <span class="tm-start-step__mark">${done ? "✓" : ""}</span>
            <span>
              <strong>${escapeHTML(step.title)}</strong>
              <small>${escapeHTML(step.text)}</small>
            </span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderOnboardingWelcome() {
  const state = getOnboardingState();
  if (state.dismissed) return "";
  return `
    <section class="landing-band tm-onboarding" id="teomarchi-onboarding" aria-labelledby="teomarchi-onboarding-title">
      <div class="landing-band__head">
        <p class="landing-kicker">Démarrer avec TEOMARCHI</p>
        <h2 class="landing-title landing-title--wide" id="teomarchi-onboarding-title">
          Comprendre, comparer, organiser et publier un projet architectural.
        </h2>
        <p class="landing-copy">
          Cette visite montre comment utiliser les modules sans créer de faux compte et sans mélanger les exemples avec vos futures données.
        </p>
      </div>
      <div class="tm-onboarding__actions">
        <button class="text-btn text-btn--primary" type="button" data-onboarding-start>
          Lancer la visite guidée
        </button>
        <button class="text-btn" type="button" data-demo-open>
          Voir une démo
        </button>
        <button class="text-btn" type="button" data-onboarding-dismiss>
          Masquer
        </button>
      </div>
      ${renderStartChecklist()}
    </section>
  `;
}
```

- [ ] **Step 2: Insert onboarding into `initLandingSections()`**

Inside the `root.innerHTML = \`` template in `initLandingSections()`, insert this immediately after the first landing split section:

```js
${renderOnboardingWelcome()}
```

- [ ] **Step 3: Add delegated onboarding events**

Inside the main delegated `document.addEventListener("click", ...)` handler, add these branches before generic navigation fallback if one exists:

```js
const onboardingStart = e.target.closest("[data-onboarding-start]");
if (onboardingStart) {
  e.preventDefault();
  markOnboardingStepDone("atlas-preview");
  navigateTo("atlas");
  pushNotification?.("Visite guidée lancée : commencez par l'Atlas.");
  return;
}

const demoOpen = e.target.closest("[data-demo-open]");
if (demoOpen) {
  e.preventDefault();
  markOnboardingStepDone("journalier-preview");
  navigateTo("feed");
  pushNotification?.("Démo ouverte : exemples publics clairement marqués.");
  return;
}

const onboardingDismiss = e.target.closest("[data-onboarding-dismiss]");
if (onboardingDismiss) {
  e.preventDefault();
  dismissOnboarding();
  document.getElementById("teomarchi-onboarding")?.remove();
  pushNotification?.("Onboarding masqué.");
  return;
}

const onboardingStep = e.target.closest("[data-onboarding-step]");
if (onboardingStep) {
  markOnboardingStepDone(onboardingStep.dataset.onboardingStep);
}
```

- [ ] **Step 4: Add CSS for onboarding and checklist**

Add to `style.css` near landing styles:

```css
.tm-onboarding {
  padding: var(--sp-lg);
  border: var(--border-gold);
  border-radius: var(--r-xl);
  background:
    radial-gradient(ellipse at 10% 0%, rgba(201,169,110,.12), transparent 58%),
    color-mix(in srgb, var(--surface) 92%, transparent);
}

.tm-onboarding__actions {
  display: flex;
  gap: var(--sp-sm);
  flex-wrap: wrap;
  align-items: center;
}

.tm-start-checklist {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: var(--sp-sm);
}

.tm-start-step {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: .75rem;
  align-items: start;
  width: 100%;
  min-width: 0;
  padding: .95rem;
  border: var(--border);
  border-radius: var(--r-md);
  background: color-mix(in srgb, var(--surface-2) 72%, transparent);
  color: var(--ink);
  text-align: left;
  cursor: pointer;
}

.tm-start-step:hover,
.tm-start-step:focus-visible {
  border-color: rgba(201,169,110,.42);
  outline: none;
}

.tm-start-step__mark {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  border: var(--border);
  color: var(--gold);
}

.tm-start-step strong {
  display: block;
  font-size: .78rem;
  color: var(--ink);
}

.tm-start-step small {
  display: block;
  margin-top: .22rem;
  font-size: .68rem;
  line-height: 1.55;
  color: var(--muted);
}

.tm-start-step.is-complete .tm-start-step__mark {
  border-color: rgba(201,169,110,.5);
  background: rgba(201,169,110,.12);
}
```

- [ ] **Step 5: Run tests**

```bash
node --test tests/spa-architecture.test.js
```

Expected: Onboarding tests pass; demo module tests may still fail.

- [ ] **Step 6: Commit landing onboarding**

```bash
git add app.js style.css
git commit -m "feat: add public onboarding"
```

## Task 4: Render Demo Feed Without Fake Users

**Files:**
- Modify: `app.js`
- Modify: `style.css`

- [ ] **Step 1: Add Feed demo renderer**

Place this near existing Feed rendering functions:

```js
function renderDemoFeedTimeline() {
  return `
    <div class="tm-demo-feed" data-feed-source="${getFirebaseUser() ? "real" : "demo"}">
      ${DATA_DEMO_FEED.map(post => `
        <article class="tm-feed-post tm-feed-post--demo" data-demo-post="${escapeHTML(post.id)}">
          <header class="tm-feed-post__head">
            <div>
              <strong>${escapeHTML(post.authorName)}</strong>
              <span>Exemple public TEOMARCHI</span>
            </div>
            ${renderDemoBadge(post.label)}
          </header>
          <p>${escapeHTML(post.text)}</p>
          <div class="tm-feed-tags">
            ${post.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join("")}
          </div>
          <footer class="tm-feed-actions" aria-label="Actions de démonstration">
            <span>${post.likeCount} likes</span>
            <span>${post.commentCount} commentaires</span>
            <span>${post.repostCount} partages</span>
          </footer>
        </article>
      `).join("")}
    </div>
  `;
}
```

- [ ] **Step 2: Use demo feed when public timeline is empty or unavailable**

In `subscribeToFeed()`, update the no-DB branch:

```js
if (!db) {
  timeline.innerHTML = shouldShowDemoContent("feed")
    ? renderDemoFeedTimeline()
    : `<div class="tm-feed-empty">Service temps réel indisponible. Le Feed ne peut pas être chargé pour le moment.</div>`;
  return;
}
```

In the Firestore snapshot success branch, use this pattern:

```js
const posts = snapshot.docs
  .map(doc => ({ id: doc.id, ...doc.data() }))
  .filter(post => post.status !== "deleted" && (post.status !== "hidden" || isTeomarchiAdmin()));

timeline.innerHTML = posts.length
  ? renderFeedPosts(posts)
  : (shouldShowDemoContent("feed")
      ? renderDemoFeedTimeline()
      : `<div class="tm-feed-empty">Aucun rendu publié pour le moment.</div>`);
```

If the existing code renders posts inline, extract that inline mapping into:

```js
function renderFeedPosts(posts) {
  return posts.map(post => renderPost(post)).join("");
}
```

- [ ] **Step 3: Add Feed demo CSS**

Add to `style.css` near Feed styles:

```css
.tm-demo-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: .2rem .55rem;
  border: 1px solid rgba(201,169,110,.32);
  border-radius: var(--r-pill);
  color: var(--gold);
  background: rgba(201,169,110,.08);
  font-size: .56rem;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.tm-demo-feed {
  display: grid;
  gap: var(--sp-md);
}

.tm-feed-post--demo {
  border-style: dashed;
}

.tm-feed-tags {
  display: flex;
  flex-wrap: wrap;
  gap: .38rem;
}

.tm-feed-tags span {
  border: var(--border);
  border-radius: var(--r-pill);
  padding: .16rem .5rem;
  font-size: .56rem;
  color: var(--muted);
}
```

- [ ] **Step 4: Run tests**

```bash
node --test tests/spa-architecture.test.js
```

Expected: Feed demo assertions pass.

- [ ] **Step 5: Commit Feed demo**

```bash
git add app.js style.css tests/spa-architecture.test.js
git commit -m "feat: add public feed demo"
```

## Task 5: Add Demo Previews For Journalier, Showroom, And Profile

**Files:**
- Modify: `app.js`
- Modify: `style.css`

- [ ] **Step 1: Add Journalier demo preview**

Place near Journalier render helpers:

```js
function renderDemoJournalierPreview() {
  const project = DATA_DEMO_PROJECT;
  return `
    <section class="card tm-demo-preview" data-demo-preview="journalier">
      <div>
        <p class="landing-kicker">Journalier ${renderDemoBadge(project.label)}</p>
        <h3>${escapeHTML(project.title)}</h3>
        <p>Exemple de pilotage : tâches, jalon, progression et organisation d'un projet d'atelier.</p>
      </div>
      <div class="tm-demo-progress" aria-label="Progression de démonstration">
        <span style="width:${project.progress}%"></span>
      </div>
      <ul>
        ${project.tasks.map(task => `<li>${escapeHTML(task)}</li>`).join("")}
      </ul>
      <p class="muted">Jalon : ${escapeHTML(project.deadline)}</p>
      <button class="text-btn text-btn--primary" type="button" data-open-login>Créer mon propre projet</button>
    </section>
  `;
}
```

In `initJournalier()` or the earliest safe render point, use:

```js
if (shouldShowDemoContent("journalier")) {
  root.insertAdjacentHTML("afterbegin", renderDemoJournalierPreview());
}
```

Only add this if the root is not already showing a real connected project.

- [ ] **Step 2: Add Showroom demo preview**

Place near Showroom render helpers:

```js
function renderDemoShowroomPreview() {
  return `
    <section class="tm-showroom-section tm-demo-preview" data-demo-preview="showroom">
      <div class="tm-showroom-section-head">
        <div>
          <p class="landing-kicker">Showroom ${renderDemoBadge("Démo")}</p>
          <h3>Exemples de cartes sponsorisables</h3>
        </div>
        <p>Ces cartes illustrent le futur format de publication pour matériaux, mobilier et partenaires.</p>
      </div>
      <div class="tm-showroom-grid">
        ${DATA_DEMO_SHOWROOM.map(item => `
          <article class="tm-showroom-category">
            <div class="tm-show-cover"></div>
            <div class="tm-showroom-category-body">
              <p class="landing-kicker">${escapeHTML(item.category)}</p>
              <h4>${escapeHTML(item.title)}</h4>
              <p>${escapeHTML(item.text)}</p>
              ${renderDemoBadge(item.label)}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}
```

Insert this in `initShowroom()` after the hero section and before pricing:

```js
${shouldShowDemoContent("showroom") ? renderDemoShowroomPreview() : ""}
```

- [ ] **Step 3: Add Profile demo preview**

Place near profile render helpers:

```js
function renderDemoProfilePreview() {
  const profile = DATA_DEMO_PROFILE;
  return `
    <section class="tm-profile-empty tm-demo-preview" data-demo-preview="profil">
      <p style="margin:0 0 .28rem;text-transform:uppercase;letter-spacing:.16em;font-size:.58rem;color:var(--gold)">
        Profil public ${renderDemoBadge(profile.label)}
      </p>
      <h3 style="font-family:var(--serif);font-size:2rem;font-weight:300;margin:0 0 .7rem;color:var(--ink)">
        ${escapeHTML(profile.displayName)}
      </h3>
      <p style="margin:0 auto 1rem;max-width:48ch;color:var(--muted);font-size:.82rem;line-height:1.65">
        ${escapeHTML(profile.bio)}
      </p>
      <div class="tm-feed-tags">
        ${profile.specialties.map(tag => `<span>${escapeHTML(tag)}</span>`).join("")}
      </div>
      <button class="text-btn text-btn--primary" type="button" data-open-login>Créer mon profil</button>
    </section>
  `;
}
```

In `initProfileEditor()`, for no user, render this preview before the login CTA or replace the existing empty block with this demo preview plus CTA.

- [ ] **Step 4: Add demo preview CSS**

Add to `style.css`:

```css
.tm-demo-preview {
  border-style: dashed;
  border-color: rgba(201,169,110,.34);
}

.tm-demo-progress {
  height: 8px;
  overflow: hidden;
  border-radius: var(--r-pill);
  background: rgba(245,245,241,.08);
}

.tm-demo-progress span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--gold), color-mix(in srgb, var(--gold) 58%, transparent));
}
```

- [ ] **Step 5: Run tests**

```bash
node --test tests/spa-architecture.test.js
```

Expected: all SPA architecture tests pass.

- [ ] **Step 6: Commit module demo previews**

```bash
git add app.js style.css tests/spa-architecture.test.js
git commit -m "feat: add module demo previews"
```

## Task 6: Final Verification

**Files:**
- Verify: `app.js`
- Verify: `index.html`
- Verify: `style.css`
- Verify: `tests/spa-architecture.test.js`
- Verify: `tests/stripe-checkout.test.js`

- [ ] **Step 1: Run syntax check**

```bash
node --check app.js
```

Expected: no output and exit code 0.

- [ ] **Step 2: Run full tests**

```bash
node --test
```

Expected: all tests pass.

- [ ] **Step 3: Check for whitespace or patch errors**

```bash
git diff --check
```

Expected: no output and exit code 0.

- [ ] **Step 4: Run text scan for forbidden public copy**

```bash
rg -n "données chargées dynamiquement|contenu en chargement|flux Firestore|Plateforme en développement actif|À compléter avant mise en production" index.html app.js style.css
```

Expected: no matches.

- [ ] **Step 5: Browser smoke test**

Start the local server:

```bash
python3 -m http.server 4176
```

Open:

```text
http://127.0.0.1:4176/index.html#accueil
```

Verify manually:

- "Démarrer avec TEOMARCHI" is visible.
- "Lancer la visite guidée" navigates to Atlas.
- "Voir une démo" navigates to Feed and shows demo posts.
- Demo content has "Démo" badges.
- Connected-user data is not overwritten.
- No horizontal overflow on mobile width.
- No red console errors from TEOMARCHI code.

- [ ] **Step 6: Commit final verification adjustments**

If verification required small fixes:

```bash
git add app.js index.html style.css tests/spa-architecture.test.js tests/stripe-checkout.test.js
git commit -m "fix: stabilize onboarding demo sprint"
```

If no fixes were required, do not create an empty commit.
