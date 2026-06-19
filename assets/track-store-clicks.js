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

  document.addEventListener(
    'click',
    function (e) {
      var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!link) return;
      var store = storeOf(link.getAttribute('href'));
      if (!store) return;

      try {
        fetch(ENDPOINT, {
          method: 'POST',
          keepalive: true,
          headers: { apikey: KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({ store: store, placement: placementOf(link), page: location.pathname }),
        }).catch(function () {});
      } catch (err) {
        /* never block the trip to the store on a logging error */
      }
    },
    true
  );
})();
