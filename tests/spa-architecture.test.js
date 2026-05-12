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
