/*
 * Cloudflare Web Analytics — loader for mapchat.social (marketing site only).
 *
 * Why a shared file: every page includes this ONE script, so the beacon token
 * lives in exactly one place (single source of truth) instead of being pasted
 * into each page's <head>. Add a new page -> include this file -> it's covered.
 *
 * Why Cloudflare Web Analytics: cookieless and privacy-first, so no cookie /
 * consent banner is required, and it stays consistent with privacy-policy.html
 * (no third-party marketing cookies). Scope is the marketing site only — the
 * mobile app and the Expo web build live in other repos and never load this file.
 *
 * ── TO ACTIVATE ─────────────────────────────────────────────────────────────
 * 1. Cloudflare dashboard -> Web Analytics -> "Add a site".
 * 2. Choose MANUAL setup (the JS-beacon option). This works on GitHub Pages
 *    WITHOUT moving mapchat.social's DNS / nameservers to Cloudflare.
 * 3. It shows a snippet containing  data-cf-beacon='{"token":"<32 hex chars>"}'.
 *    Copy ONLY that token value and paste it below as the TOKEN value (rotating
 *    it later is just editing that one line).
 *
 * Until a real token is set, the placeholder is detected and nothing loads —
 * so a half-configured beacon can never ship.
 */
(function () {
  var TOKEN = '94ec40f238c946eba32c02508fab8334';

  // Placeholder still present -> not configured yet -> do nothing.
  if (!TOKEN || TOKEN.slice(0, 2) === '__') return;

  var beacon = document.createElement('script');
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.setAttribute('data-cf-beacon', JSON.stringify({ token: TOKEN }));
  document.head.appendChild(beacon);
})();
