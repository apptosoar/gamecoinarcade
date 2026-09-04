/* analytics.js — Google Analytics 4, wired for the hash-routed SPA and for
   Google's Consent Mode v2.

   Inert until GA_MEASUREMENT_ID is filled in: with it empty this file sends
   nothing and no request leaves the page, the same contract adsense.js keeps.
   Set it to the Measurement ID from the GA4 property (Admin → Data streams →
   the web stream, the "G-…" value) and analytics goes live everywhere at once.

   Loaded from <head>, and ahead of adsense.js. That order is not cosmetic: the
   consent defaults below have to be in the dataLayer before any Google tag
   loads, or the ad tag spends its first requests assuming a consent state that
   was never given. Google's Funding Choices message — the CMP adsense.js
   loads — updates these signals itself once the visitor answers, so nothing
   here has to be wired to consent.js.

   Page views are sent by hand. index.html is a hash-routed single-page app, so
   send_page_view is off and pageView() is called on every route render from
   app.js: the default automatic page view fires once per document load, which
   would report the whole visit — home, the catalogue, every info page — as a
   single view. Routes are reported as the path they read like (#games becomes
   /games) so GA4's reports line up with the site's own navigation; GA4 drops
   the fragment from page_path otherwise and every route would collapse back
   into "/". Static pages have no hash and report their real path.

   Verifying Search Console: with this tag live, Search Console's "Google
   Analytics" verification method works with no token to paste anywhere,
   provided the same Google account owns both the GA4 property and the
   Search Console property. */
(function () {
  const GA_MEASUREMENT_ID = "G-D4EY06LM3S";   // web stream, Admin -> Data streams

  /* Countries where consent has to be asked for before storage is used. */
  const CONSENT_REQUIRED_REGIONS = [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
    "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL",
    "PT", "RO", "SK", "SI", "ES", "SE", "GB", "CH",
  ];

  /* The route currently reported. Kept so the first render() in app.js, which
     runs right after this file's own opening page view, does not report the
     landing page twice. */
  let reported = null;

  /* "#home" and no hash at all are the same route in app.js, so they report as
     one path — otherwise the home page's traffic arrives split in two. */
  function routePath() {
    const hash = location.hash.replace(/^#/, "");
    return hash && hash !== "home" ? "/" + hash : location.pathname;
  }

  /* Published before the GA_MEASUREMENT_ID guard, so app.js can call it
     unconditionally and get a no-op until the property exists. */
  window.SiteAnalytics = {
    get ready() { return Boolean(GA_MEASUREMENT_ID); },

    pageView() {
      if (!this.ready || typeof window.gtag !== "function") return;
      const path = routePath();
      if (path === reported) return;   // same route rendered again — not a new view
      reported = path;
      window.gtag("event", "page_view", {
        page_location: location.origin + path,
        page_title: document.title,
        page_referrer: document.referrer || undefined,
      });
    },
  };

  if (!GA_MEASUREMENT_ID) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  /* Consent Mode v2. The broad default first, then the stricter one for the
     regions that require it — a region-scoped default wins over the general
     one, so the order here only reflects how it reads. */
  gtag("consent", "default", {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "granted",
  });
  gtag("consent", "default", {
    region: CONSENT_REQUIRED_REGIONS,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500,   // ms to hold events while the CMP answers
  });

  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });

  const el = document.createElement("script");
  el.async = true;
  el.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
  document.head.appendChild(el);

  /* The landing view. Static pages have nothing else to report; on the SPA the
     first render() call finds this path already reported and stays quiet. */
  window.SiteAnalytics.pageView();
})();
