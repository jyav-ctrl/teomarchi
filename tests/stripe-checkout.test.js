const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const read = (path) => fs.readFileSync(path, "utf8");

test("index loads Stripe.js for Checkout", () => {
  const html = read("index.html");

  assert.match(html, /<script\s+src="https:\/\/js\.stripe\.com\/v3\/"><\/script>/);
});

test("premium checkout exposes a styled checkout button", () => {
  const js = read("app.js");

  assert.match(js, /id="checkout-btn"/);
  assert.match(js, /data-checkout-plan="\$\{plan\.id\}"/);
  assert.match(js, /class="tm-plan__cta/);
});

test("handleCheckout gates Stripe behind Firebase auth", () => {
  const js = read("app.js");

  assert.match(js, /async function handleCheckout\s*\(/);
  assert.match(js, /auth\.onAuthStateChanged/);
  assert.match(js, /#login-modal/);
  assert.match(js, /redirectToCheckout/);
  assert.match(js, /try\s*{/);
  assert.match(js, /catch\s*\(/);
  assert.match(js, /window\.handleCheckout\s*=\s*handleCheckout/);
});

test("checkout clicks are delegated and resilient", () => {
  const js = read("app.js");

  assert.match(js, /document\.addEventListener\("click"[\s\S]*#checkout-btn/);
  assert.match(js, /isCheckoutPending/);
  assert.match(js, /finally\s*{/);
});

test("client code does not expose private payment or platform secrets", () => {
  const js = read("app.js");
  const html = read("index.html");
  const deploy = read(".github/workflows/deploy.yml");

  [js, html, deploy].forEach(source => {
    assert.doesNotMatch(source, /sk_live_[A-Za-z0-9]+/);
    assert.doesNotMatch(source, /sk_test_[A-Za-z0-9]+/);
    assert.doesNotMatch(source, /whsec_[A-Za-z0-9]+/);
    assert.doesNotMatch(source, /ghp_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+/);
    assert.doesNotMatch(source, /-----BEGIN PRIVATE KEY-----/);
  });

  assert.match(js, /TEOMARCHI_CONFIG\.stripe\.publishableKey/);
  assert.match(js, /TEOMARCHI_CONFIG\.firebase/);
});
