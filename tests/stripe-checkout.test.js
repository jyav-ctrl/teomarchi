const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

const read = (path) => fs.readFileSync(path, "utf8");
const STUDIO_LINK = "https://buy.stripe.com/3cIbIUegv65P7j6d8w1RC06";
const AGENCE_LINK = "https://buy.stripe.com/5kQ28ka0f3XHeLy7Oc1RC05";
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
  assert.match(js, /getStripePaymentLink\(planId,\s*user\)/);
  assert.match(js, /try\s*{/);
  assert.match(js, /catch\s*\(/);
  assert.match(js, /window\.handleCheckout\s*=\s*handleCheckout/);
});

test("checkout uses final Stripe payment links and appends client reference safely", () => {
  const js = read("app.js");

  assert.match(js, new RegExp(escapeRegExp(STUDIO_LINK)));
  assert.match(js, new RegExp(escapeRegExp(AGENCE_LINK)));
  assert.match(js, /function\s+getStripePaymentLink\s*\(\s*planId,\s*user\s*\)/);
  assert.match(js, /client_reference_id/);
  assert.match(js, /base\.includes\("\?"\)\s*\?\s*"&"\s*:\s*"\?"/);
  assert.match(js, /window\.location\.assign\(getStripePaymentLink\(planId,\s*user\)\)/);
});

test("checkout avoids placeholder Price IDs and invalid Checkout sessions", () => {
  const js = read("app.js");

  assert.doesNotMatch(js, /id_de_ton_produit_stripe/);
  assert.doesNotMatch(js, /id_de_ton_produit_stripe_agence/);
  assert.doesNotMatch(js, /lineItems:\s*\[\{\s*price:\s*priceId/);
});

test("checkout clicks are delegated and resilient", () => {
  const js = read("app.js");

  assert.match(js, /document\.addEventListener\("click"[\s\S]*#checkout-btn/);
  assert.match(js, /isCheckoutPending/);
  assert.match(js, /finally\s*{/);
  assert.match(js, /Connecte-toi pour continuer vers l’abonnement/);
  assert.doesNotMatch(js, /#checkout-btn[\s\S]{0,260}stopImmediatePropagation/);
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
