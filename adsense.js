/* adsense.js — the Google AdSense tag and Google's consent message.

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

   Auto ads are used deliberately: Google places units around the page content
   itself, so nothing has to be positioned by hand over a running game. */
(function () {
  const ADSENSE_CLIENT = "ca-pub-1237395397379866";   // e.g. "ca-pub-1234567890123456"

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
