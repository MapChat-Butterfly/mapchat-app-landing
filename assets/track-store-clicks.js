/*
 * Store-link click tracking for mapchat.social.
 *
 * Logs one row to Supabase (public.store_link_clicks) each time a visitor taps
 * an App Store / Google Play link, so we can count real install intent and
 * split it iOS vs Android. Pairs with the waitlist data to compute visits ->
 * clicks -> signups.
 *
 * First-party + cookieless: reuses the SAME public Supabase "publishable" key as
 * the waitlist form. Row-Level Security allows INSERT only with this key — it can
 * never read, change, or delete data. No personal data is captured: just which
 * store, which area of the page (cta/footer), and the page path.
 *
 * Reliable: the store links open in a new tab (target="_blank"), so this page
 * stays alive and the insert completes; `keepalive` is added as a backstop in
 * case a link is ever made same-tab. Navigation is never blocked or delayed.
 */
(function () {
  var ENDPOINT = 'https://sfxhzmniyfvrmprjzmsj.supabase.co/rest/v1/store_link_clicks';
  // Same public publishable key the waitlist uses (see the WAITLIST_KEY note in index.html).
  var KEY = 'sb_publishable_A0eaeoNBE4Fqpd-ngVOPgg_RnUS770_';
  // sessionStorage key holding the first-touch campaign tags for this visit.
  var UTM_KEY = 'mc_utm';

  function storeOf(href) {
    if (!href) return null;
    if (href.indexOf('apps.apple.com') !== -1) return 'ios';
    if (href.indexOf('play.google.com') !== -1) return 'android';
    return null;
  }

  function placementOf(el) {
    if (el.closest('[class*="cta"]')) return 'cta';
    if (el.closest('[class*="foot"]')) return 'footer';
    return null;
  }

  // --- UTM (campaign attribution) ---------------------------------------------
  // Read utm_source/medium/campaign from a URLSearchParams. Returns the trio with
  // null for any that are absent, or null when NONE are present.
  function utmFromParams(params) {
    // Treat a present-but-empty param (?utm_source=) the same as absent → null, so
    // empty tags are never stored or transmitted (clean null analytics) and an
    // empty first touch doesn't lock out a later genuinely-tagged page view.
    var source = params.get('utm_source') || null;
    var medium = params.get('utm_medium') || null;
    var campaign = params.get('utm_campaign') || null;
    if (source === null && medium === null && campaign === null) return null;
    return { source: source, medium: medium, campaign: campaign };
  }

  // Each utm column is capped at 100 chars in the database; cap client-side too so
  // a junk/over-long tag can never make the whole click-log insert fail.
  function cap100(v) {
    if (v == null || v === '') return null;
    return String(v).slice(0, 100);
  }

  // First-touch capture: the FIRST campaign-tagged page view of the session wins,
  // so the original source survives later in-site navigation. sessionStorage (not
  // cookies) keeps the site consent-banner-free.
  function captureUtmOnLoad() {
    try {
      if (sessionStorage.getItem(UTM_KEY)) return; // never overwrite the first touch
      var utm = utmFromParams(new URLSearchParams(location.search));
      if (utm) sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    } catch (err) {
      /* storage blocked (private mode etc.) — degrade silently */
    }
  }

  // Resolve the campaign tags for an insert: prefer the stored first touch, fall
  // back to the live URL. Always returns the 3 utm_* keys (null when unknown).
  function readUtm() {
    var utm = null;
    try {
      var raw = sessionStorage.getItem(UTM_KEY);
      if (raw) utm = JSON.parse(raw);
    } catch (err) {
      /* fall through to the live URL */
    }
    if (!utm) utm = utmFromParams(new URLSearchParams(location.search)) || {};
    return {
      utm_source: cap100(utm.source),
      utm_medium: cap100(utm.medium),
      utm_campaign: cap100(utm.campaign),
    };
  }

  captureUtmOnLoad();

  document.addEventListener(
    'click',
    function (e) {
      var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!link) return;
      var store = storeOf(link.getAttribute('href'));
      if (!store) return;

      var utm = readUtm();
      try {
        fetch(ENDPOINT, {
          method: 'POST',
          keepalive: true,
          headers: { apikey: KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({
            store: store,
            placement: placementOf(link),
            page: location.pathname,
            utm_source: utm.utm_source,
            utm_medium: utm.utm_medium,
            utm_campaign: utm.utm_campaign,
          }),
        }).catch(function () {});
      } catch (err) {
        /* never block the trip to the store on a logging error */
      }
    },
    true
  );
})();
