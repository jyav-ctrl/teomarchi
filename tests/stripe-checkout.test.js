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
