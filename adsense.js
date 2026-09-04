/* adsense.js — the Google AdSense tag, Google's consent message, and the ad
   slot the single-page app re-requests on every route.

   Inert until ADSENSE_CLIENT is filled in: with it empty this file injects
   nothing and no request leaves the page, so it is safe to ship before the
   account is approved. Set it to the publisher id from the AdSense dashboard
   (the "ca-pub-…" value) and both scripts go live everywhere at once.

   Order matters. Google's Privacy & messaging script is a certified CMP: it is
   what asks EEA/UK/Swiss visitors for consent and passes the answer to the ad
   tag through the TCF API. It has to be in the page before adsbygoogle.js so
   the ad tag finds a consent signal rather than assuming one, which is why it
   is written first here and why neither is gated behind consent.js — that
   banner belongs to the rewarded-video network and stays off until its own
   ADS_ENABLED flag is flipped.

   This file has to run from <head>, and it does: index.html carries its own
   <script> tag up there, and site-chrome.js injects it the moment it parses,
   which is also in <head>. Requesting the tag any later — from the end of
   <body>, or after DOMContentLoaded — means a visitor who leaves before the
   page settles never reaches an ad request, and AdSense never counts the
   page view at all.

   Auto ads are used deliberately: Google places units around the page content
   itself, so nothing has to be positioned by hand over a running game. But
   auto ads only scan the document once, at load. index.html is a hash-routed
   single-page app, so #home → #games → #info are all one document load: one
   ad request, one page view, no matter how far the visitor browses. That is
   what SiteAdSense.mount is for — app.js calls it after every route render and it
   pushes a fresh manual unit, and it is that request AdSense counts. It stays
   inert until ADSENSE_SLOT holds a real display-unit id from the dashboard,
   so the SPA behaves exactly as it does today until the account is approved. */
(function () {
  const ADSENSE_CLIENT = "ca-pub-1237395397379866";   // e.g. "ca-pub-1234567890123456"
  const ADSENSE_SLOT = "";                            // e.g. "1234567890" — Display unit, "Ad units" in the dashboard

  /* Published before the ADSENSE_CLIENT guard below, so app.js can call into
     it unconditionally and get a no-op while the site is still unapproved.
     Named SiteAdSense, not SiteAds: ads.js already owns window.SiteAds for the
     GameMonetize rewarded-video player and coins.js calls through it. */
  window.SiteAdSense = {
    get ready() { return Boolean(ADSENSE_CLIENT && ADSENSE_SLOT); },

    /* Replaces whatever is in `container` with a new ad unit and asks Google to
       fill it. A fresh <ins> every time is required: adsbygoogle marks a unit
       as processed and silently skips a second push at the same element. */
    mount(container) {
      if (!this.ready || !container) return;
      container.textContent = "";
      const ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.dataset.adClient = ADSENSE_CLIENT;
      ins.dataset.adSlot = ADSENSE_SLOT;
      ins.dataset.adFormat = "auto";
      ins.dataset.fullWidthResponsive = "true";
      container.appendChild(ins);
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // Blocked by an extension, or the tag has not landed yet — the next
        // route change tries again, and a missed unit must not break render().
      }
    },
  };

  if (!ADSENSE_CLIENT) return;

  const pubId = ADSENSE_CLIENT.replace(/^ca-/, "");

  function addScript(src, extra) {
    if (document.querySelector('script[src="' + src + '"]')) return;
    const el = document.createElement("script");
    el.async = true;
    el.src = src;
    Object.assign(el, extra || {});
    document.head.appendChild(el);
  }

  /* Google's consent message (Privacy & messaging in the AdSense dashboard) */
  addScript("https://fundingchoicesmessages.google.com/i/" + pubId + "?ers=1");

  /* Tells Funding Choices the page is ready for it — Google's own snippet,
     kept verbatim apart from formatting. */
  (function signalGooglefcPresent() {
    if (!window.frames.googlefcPresent) {
      if (document.body) {
        const iframe = document.createElement("iframe");
        iframe.style = "width:0;height:0;border:none;z-index:-1000;left:-1000px;top:-1000px;";
        iframe.style.display = "none";
        iframe.name = "googlefcPresent";
        document.body.appendChild(iframe);
      } else {
        setTimeout(signalGooglefcPresent, 0);
      }
    }
  })();

  /* The ad tag itself */
  addScript(
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + ADSENSE_CLIENT,
    { crossOrigin: "anonymous" }
  );
})();
