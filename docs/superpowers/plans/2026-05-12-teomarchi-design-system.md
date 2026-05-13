# TEOMARCHI Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a premium architectural design system and distinct visual identities for Atlas, Chronos, Panthéon, Journalier, Feed, and Showroom while preserving the current Vanilla JS SPA behavior.

**Architecture:** Keep `index.html`, `style.css`, and `app.js` as the central architecture. Add global design-system tokens/components in CSS, then layer module-specific visual systems through lightweight classes and renderer wrappers. Preserve existing data, navigation, Firebase Auth, Firestore, Stripe Payment Links, overlays, and delegated events.

**Tech Stack:** Vanilla HTML, CSS, JavaScript, Firebase compat Auth/Firestore, Stripe Payment Links, Node test runner.

---

## File Structure

- Modify: `style.css`
  - Add global design-system tokens, component primitives, motion rules, module identity layers, and responsive rules.
- Modify: `app.js`
  - Add lightweight module shell classes and semantic visual hooks to the existing renderers without changing data flow.
  - Keep `renderTechnicalCards`, `initAtlas`, `initChronos`, `initPantheon`, `initJournalier`, `initFeed`, and `initShowroom` compatible.
- Modify: `index.html`
  - Only update static module headers if needed for semantic class hooks.
- Modify: `tests/spa-architecture.test.js`
  - Add static tests for design-system tokens, module identity classes, and SPA safety.
- Modify: `tests/stripe-checkout.test.js`
  - Keep existing Stripe stability tests unchanged unless class changes affect plan cards.

---

## Task 1: Global Design System Layer

**Files:**
- Modify: `style.css`
- Test: `tests/spa-architecture.test.js`

- [ ] **Step 1: Add failing tests for design-system tokens**

Append this test to `tests/spa-architecture.test.js`:

```js
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
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
node --test tests/spa-architecture.test.js
```

Expected: FAIL because the new design-system primitives do not exist yet.

- [ ] **Step 3: Add the global CSS primitives**

Add near the existing `:root` token block in `style.css`:

```css
:root {
  --concrete: #6F716C;
  --architectural-beige: #D7C6A3;
  --steel: #A8ADB2;
  --steel-dim: rgba(168, 173, 178, 0.16);
  --module-surface: linear-gradient(135deg, rgba(245,245,241,0.035), transparent 42%), var(--surface);
  --motion-soft: 220ms cubic-bezier(.2,.8,.2,1);
  --motion-slow: 420ms cubic-bezier(.2,.8,.2,1);
}
```

Add below the existing utility section:

```css
.tm-shell {
  position: relative;
  display: grid;
  gap: var(--sp-lg);
  min-width: 0;
}

.tm-editorial-panel,
.tm-architectural-card {
  position: relative;
  border: var(--border);
  border-radius: var(--r-lg);
  background: var(--module-surface);
  overflow: hidden;
}

.tm-editorial-panel {
  padding: var(--sp-lg);
}

.tm-architectural-card {
  padding: var(--sp-md);
  transition: transform var(--motion-soft), border-color var(--motion-soft), background var(--motion-soft);
}

.tm-architectural-card:hover {
  transform: translateY(-2px);
  border-color: rgba(201,169,110,0.34);
}

.tm-technical-badge {
  display: inline-flex;
  align-items: center;
  width: max-content;
  min-height: 24px;
  padding: 0.12rem 0.55rem;
  border: var(--border-gold);
  border-radius: var(--r-pill);
  background: var(--gold-glow);
  color: var(--gold);
  font-size: 0.56rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.tm-reveal {
  animation: tmReveal var(--motion-slow) both;
}

@keyframes tmReveal {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .tm-reveal {
    animation: none;
  }
}
```

- [ ] **Step 4: Run the test and verify pass**

Run:

```bash
node --test tests/spa-architecture.test.js
```

Expected: PASS for the new design-system test.

---

## Task 2: Technical Modules Visual Shells

**Files:**
- Modify: `app.js`
- Modify: `style.css`
- Test: `tests/spa-architecture.test.js`

- [ ] **Step 1: Add failing tests for Atlas, Chronos, and Panthéon identities**

Append this test to `tests/spa-architecture.test.js`:

```js
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
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
node --test tests/spa-architecture.test.js
```

Expected: FAIL because the identity classes are not present.

- [ ] **Step 3: Extend `renderTechnicalCards` with module shell classes**

In `app.js`, update the `container.innerHTML` wrapper inside `renderTechnicalCards` from:

```js
<div class="tm-tech" data-tech-shell="${_esc(id)}">
```

to:

```js
<div class="tm-tech tm-tech--${_esc(id)} tm-${_esc(id)} tm-shell tm-reveal" data-tech-shell="${_esc(id)}">
```

Add an optional visual header immediately inside the wrapper:

```js
${options.visualIntro ? options.visualIntro() : ""}
```

- [ ] **Step 4: Add module visual intros**

In `app.js`, add these functions before `_atlasOptions`:

```js
const _atlasVisualIntro = () => `
  <section class="tm-editorial-panel tm-atlas-map" aria-label="Projection architecturale mondiale">
    <div>
      <p class="tm-tech-kicker">Projection constructive</p>
      <h3>Cartographier les climats, les matières et les systèmes.</h3>
      <p class="tm-tech-muted">Une lecture géographique des logiques bâties : inertie, portée, matière, climat et transmission contemporaine.</p>
    </div>
    <div class="tm-atlas-orbit" aria-hidden="true"></div>
  </section>
`;

const _chronosVisualIntro = () => `
  <section class="tm-editorial-panel tm-chronos-spine" aria-label="Ligne du temps constructive">
    <p class="tm-tech-kicker">Frise matière-époque</p>
    <div class="tm-chronos-line" aria-hidden="true"></div>
  </section>
`;

const _pantheonVisualIntro = () => `
  <section class="tm-editorial-panel tm-pantheon-gallery" aria-label="Galerie des doctrines">
    <p class="tm-tech-kicker">Archive vivante</p>
    <h3>Doctrines, matières et héritages.</h3>
  </section>
`;
```

Then add the matching properties:

```js
visualIntro: _atlasVisualIntro
visualIntro: _chronosVisualIntro
visualIntro: _pantheonVisualIntro
```

inside `_atlasOptions`, `_chronosOptions`, and `_pantheonOptions`.

- [ ] **Step 5: Add CSS identities**

Add to `style.css`:

```css
.tm-atlas-map {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 280px);
  gap: var(--sp-lg);
  align-items: center;
  background:
    radial-gradient(circle at 72% 42%, rgba(201,169,110,0.12), transparent 28%),
    repeating-linear-gradient(0deg, rgba(245,245,241,0.028) 0 1px, transparent 1px 22px),
    var(--module-surface);
}

.tm-atlas-orbit {
  aspect-ratio: 1;
  border: 0.5px solid rgba(201,169,110,0.36);
  border-radius: 50%;
  background:
    radial-gradient(circle, transparent 42%, rgba(201,169,110,0.08) 43% 44%, transparent 45%),
    linear-gradient(90deg, transparent 49%, rgba(245,245,241,0.12) 50%, transparent 51%);
}

.tm-chronos-spine {
  display: grid;
  gap: var(--sp-md);
}

.tm-chronos-line {
  height: 2px;
  background: linear-gradient(90deg, var(--gold), var(--steel), var(--architectural-beige));
}

.tm-pantheon-gallery {
  display: grid;
  gap: var(--sp-sm);
  background:
    linear-gradient(90deg, rgba(245,245,241,0.05), transparent 28%),
    var(--module-surface);
}

.tm-pantheon .tm-tech-card {
  min-height: 320px;
}

@media (max-width: 800px) {
  .tm-atlas-map {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
node --test tests/spa-architecture.test.js tests/stripe-checkout.test.js
```

Expected: PASS.

---

## Task 3: Journalier Atelier Identity

**Files:**
- Modify: `app.js`
- Modify: `style.css`
- Test: `tests/spa-architecture.test.js`

- [ ] **Step 1: Add failing test for Journalier atelier identity**

Append this test:

```js
test("Journalier exposes an architectural atelier visual identity", () => {
  const js = read("app.js");

  [
    "tm-journalier-workbench",
    "tm-journalier-timeline",
    "tm-journalier-progress-central"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
node --test tests/spa-architecture.test.js
```

Expected: FAIL.

- [ ] **Step 3: Add Journalier shell classes**

In `initJournalier()` in `app.js`, update the root wrapper from:

```js
<div class="tm-journalier" aria-label="Centre de gestion Journalier">
```

to:

```js
<div class="tm-journalier tm-journalier-workbench tm-shell tm-reveal" aria-label="Centre de gestion Journalier">
```

Update the progress block wrapper in `_renderDashboard()` so `id="journalier-progress"` includes:

```html
class="tm-journalier-progress-central"
```

Add a timeline strip inside the dashboard:

```html
<div class="tm-journalier-timeline" aria-hidden="true">
  <span></span><span></span><span></span><span></span>
</div>
```

- [ ] **Step 4: Add Journalier CSS**

Add to the injected Journalier CSS in `app.js`:

```css
.tm-journalier-workbench {
  background:
    linear-gradient(90deg, rgba(245,245,241,.025) 1px, transparent 1px),
    linear-gradient(rgba(245,245,241,.02) 1px, transparent 1px);
  background-size: 42px 42px;
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
```

- [ ] **Step 5: Run tests**

Run:

```bash
node --test tests/spa-architecture.test.js tests/stripe-checkout.test.js
```

Expected: PASS.

---

## Task 4: Feed Evolution Wall Identity

**Files:**
- Modify: `app.js`
- Test: `tests/spa-architecture.test.js`

- [ ] **Step 1: Add failing test for Feed identity**

Append:

```js
test("Feed exposes an architectural evolution wall identity", () => {
  const js = read("app.js");

  [
    "tm-feed-wall",
    "tm-feed-editorial",
    "Mur d’évolution architecturale"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
node --test tests/spa-architecture.test.js
```

Expected: FAIL.

- [ ] **Step 3: Update Feed wrapper**

In `initFeed()` in `app.js`, update:

```js
<div class="tm-feed">
```

to:

```js
<div class="tm-feed tm-feed-wall tm-shell tm-reveal">
```

Add an editorial panel before the composer:

```html
<section class="tm-feed-editorial tm-editorial-panel">
  <p class="tm-tech-kicker">Mur d’évolution architecturale</p>
  <h3>Publier des étapes, pas du bruit.</h3>
  <p>Plans, maquettes, rendus, croquis, essais de matière et progression de projet.</p>
</section>
```

- [ ] **Step 4: Add Feed CSS**

Add to `injectFeedCSS()`:

```css
.tm-feed-wall {
  align-items:start;
}
.tm-feed-editorial {
  margin-bottom:1rem;
}
.tm-feed-editorial h3 {
  font-family:var(--serif);
  font-size:1.8rem;
  font-weight:300;
  line-height:1.05;
  color:var(--ink);
}
.tm-feed-editorial p:last-child {
  color:var(--muted);
  font-size:.78rem;
  line-height:1.6;
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
node --test tests/spa-architecture.test.js tests/stripe-checkout.test.js
```

Expected: PASS.

---

## Task 5: Showroom Premium Gallery Reinforcement

**Files:**
- Modify: `app.js`
- Test: `tests/spa-architecture.test.js`

- [ ] **Step 1: Add failing test for Showroom gallery identity**

Append:

```js
test("Showroom exposes a premium architectural gallery identity", () => {
  const js = read("app.js");

  [
    "tm-showroom-gallery",
    "tm-showroom-material-plaque",
    "Galerie architecturale premium"
  ].forEach(token => assert.match(js, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))));
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
node --test tests/spa-architecture.test.js
```

Expected: FAIL.

- [ ] **Step 3: Update Showroom markup**

In `initShowroom()` in `app.js`, ensure the top wrapper includes:

```html
class="tm-showroom tm-showroom-gallery tm-shell tm-reveal"
```

Add a top editorial panel:

```html
<section class="tm-editorial-panel tm-showroom-material-plaque">
  <p class="tm-tech-kicker">Galerie architecturale premium</p>
  <h3>Matériaux, créateurs, agences et partenaires.</h3>
  <p>Une place architecturale haut de gamme, préparée pour les portfolios, produits, sponsors et futures pages dédiées.</p>
</section>
```

- [ ] **Step 4: Add Showroom CSS**

Add to the Showroom CSS injection:

```css
.tm-showroom-gallery {
  display:grid;
  gap:1.2rem;
}
.tm-showroom-material-plaque {
  background:
    linear-gradient(135deg, rgba(168,173,178,.08), transparent 38%),
    linear-gradient(90deg, rgba(201,169,110,.06), transparent 60%),
    var(--surface);
}
.tm-showroom-material-plaque h3 {
  font-family:var(--serif);
  font-size:2rem;
  font-weight:300;
  line-height:1.05;
  color:var(--ink);
}
.tm-showroom-material-plaque p:last-child {
  color:var(--muted);
  max-width:68ch;
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
node --test tests/spa-architecture.test.js tests/stripe-checkout.test.js
```

Expected: PASS.

---

## Task 6: Responsive and Stability Verification

**Files:**
- Modify: `tests/spa-architecture.test.js`
- Verify: `app.js`, `style.css`, `index.html`

- [ ] **Step 1: Add safety tests for overlays and navigation after visual work**

Ensure these assertions remain present in `tests/spa-architecture.test.js`:

```js
assert.match(css, /\.sidebar-overlay[\s\S]*pointer-events:\s*none/);
assert.match(css, /\.sidebar-overlay\.is-open[\s\S]*pointer-events:\s*auto/);
assert.match(css, /\.modal-overlay[\s\S]*visibility:\s*hidden/);
assert.match(css, /\.modal-overlay\.is-open[\s\S]*visibility:\s*visible/);
assert.match(js, /document\.addEventListener\("click"[\s\S]*closest\("\[data-nav\]"\)/);
```

- [ ] **Step 2: Run syntax and test verification**

Run:

```bash
node --check app.js
node --test
```

Expected:

```text
tests pass
```

- [ ] **Step 3: Run local static server smoke test**

Run:

```bash
python3 -m http.server 4176
```

In another terminal:

```bash
curl -I http://127.0.0.1:4176/
```

Expected:

```text
HTTP/1.0 200 OK
```

Stop the server after verification.

---

## Self-Review

- Spec coverage: global design system, Atlas, Chronos, Panthéon, Journalier, Feed, Showroom, performance, responsive, and SPA stability are covered.
- Completion scan: every implementation step names concrete files, code snippets, and commands.
- Type consistency: all planned classes use the `tm-*` namespace and attach to existing functions/modules.
- Scope: implementation stays in `style.css`, `app.js`, and tests. `index.html` remains optional and should only be edited if semantic static hooks are needed.
