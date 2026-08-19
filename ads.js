/* ads.js — rewarded-ad wrapper.

   Stub by default: no network, no SDK, no gameId yet. `SiteAds.show()` runs a
   local placeholder so the whole reward flow — button, countdown, coins, daily
   cap — can be built and tested before GameMonetize approves the site. Add the
   ids to GAME_IDS and flip consent.js's ADS_ENABLED to go live; the calling
   code does not change.

   The one rule the caller can rely on: show() always resolves, never rejects.
   A blocked SDK, a network failure, an ad that never fires its resume event —
   all resolve as { shown: false, reason }. Ad breakage must never cost the
   player something the interface already promised them. */
(function () {
  const SDK_URL = "https://api.gamemonetize.com/sdk.js";
  const AD_TIMEOUT_MS = 25000;   // an ad that never returns must not hang the UI

  // GameMonetize issues one id per registered game. Games missing from this map
  // fall back to the stub, so the reward flow still works while ids trickle in.
  const GAME_IDS = {
    // "project-synapse": "xxxxxxxx",
  };

  // GameMonetize's dashboard has a "Verify Game" check that opens a game URL and
  // looks for a live SDK. Their checker never answers a consent banner, so a
  // one-off URL carrying this token loads the SDK directly — for that URL only.
  // Everyone else still gets no banner, no ads and no third-party script.
  // Pass the id in the URL (&gmid=...) before it is added to GAME_IDS above.
  // Remove the token once the game is approved.
  const VERIFY_TOKEN = "gm7f3a91c2";

  const params = new URLSearchParams(location.search);
  const forceStub = params.get("ads") === "stub";
  const verifyMode = params.get("gmverify") === VERIFY_TOKEN;

  function currentGameId() {
    const m = location.pathname.match(/\/games\/([^/]+)\//);
    const mapped = m ? GAME_IDS[m[1]] || null : null;
    return mapped || (verifyMode ? params.get("gmid") : null);
  }

  function live() {
    if (forceStub) return false;
    if (verifyMode) return !!currentGameId();   // the check URL bypasses the gate
    if (!window.SiteConsent || !window.SiteConsent.adsEnabled) return false;
    if (!window.SiteConsent.granted()) return false;
    return !!currentGameId();
  }

  const SiteAds = {
    /** true only when there is a real ad to play, or when ?ads=stub is asking
        for the placeholder — never in normal browsing before launch */
    available() {
      if (window.SiteCoins && window.SiteCoins.adsLeftToday() <= 0) return false;
      return live() || forceStub;
    },
    isStub: () => !live(),
    stubForced: forceStub,

    /** resolves { shown, reason } — never rejects */
    show(placement) {
      return live() ? showReal(placement) : showStub(placement);
    },
  };

  /* ── stub ──────────────────────────────────────────────────────────── */
  function showStub() {
    return new Promise((resolve) => {
      const wrap = document.createElement("div");
      wrap.style.cssText = "position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;" +
        "background:rgba(6,8,13,.88);color:#f4f2ea;font:14px/1.6 system-ui,-apple-system,sans-serif";
      let left = 3;
      const paint = () => {
        wrap.innerHTML =
          '<div style="text-align:center;padding:28px 34px;border:1px solid rgba(255,255,255,.14);border-radius:12px;background:#151820;max-width:min(90vw,360px)">' +
            '<div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#f7b84b;font-weight:800">Ad placeholder</div>' +
            '<div style="margin:14px 0 6px;font-size:32px;font-weight:800">' + left + '</div>' +
            '<div style="color:#b8bec9">No ad network is connected yet.<br>The reward is granted either way.</div>' +
          "</div>";
      };
      paint();
      document.body.appendChild(wrap);
      const tick = setInterval(() => {
        left -= 1;
        if (left > 0) { paint(); return; }
        clearInterval(tick);
        wrap.remove();
        resolve({ shown: true, reason: "stub" });
      }, 1000);
    });
  }

  /* ── GameMonetize ──────────────────────────────────────────────────── */
  let sdkLoading = null;

  function loadSdk(gameId) {
    if (sdkLoading) return sdkLoading;
    sdkLoading = new Promise((resolve) => {
      let settled = false;
      const done = (ok) => { if (!settled) { settled = true; resolve(ok); } };
      window.SDK_OPTIONS = {
        gameId,
        onEvent(event) {
          if (event.name === "SDK_READY") done(true);
          if (event.name === "SDK_GAME_PAUSE" && SiteAds._onPause) SiteAds._onPause();
          if (event.name === "SDK_GAME_START" && SiteAds._onResume) SiteAds._onResume();
        },
      };
      const el = document.createElement("script");
      el.id = "gamemonetize-sdk";
      el.src = SDK_URL;
      el.addEventListener("error", () => done(false));   // adblock, offline, bad response
      document.head.appendChild(el);
      setTimeout(() => done(false), 8000);
    });
    return sdkLoading;
  }

  function showReal(placement) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (shown, reason) => {
        if (settled) return;
        settled = true;
        SiteAds._onResume = null;
        resolve({ shown, reason });
      };
      loadSdk(currentGameId()).then((ready) => {
        if (!ready) return finish(false, "sdk-unavailable");
        // the ad is over when the SDK hands control back
        SiteAds._onResume = () => finish(true, "complete");
        try {
          if (window.sdk && typeof window.sdk.showBanner === "function") window.sdk.showBanner();
          else return finish(false, "no-show-method");
        } catch (e) {
          return finish(false, "show-threw");
        }
        setTimeout(() => finish(false, "timeout"), AD_TIMEOUT_MS);
      });
      void placement;
    });
  }

  window.SiteAds = SiteAds;
  SiteAds.verifyMode = verifyMode;

  // In verify mode load the SDK straight away — the checker looks for it on
  // page load, not after a click — and show a badge so the mode is never
  // silently left switched on.
  if (verifyMode) {
    const gameId = currentGameId();
    if (gameId) loadSdk(gameId);
    const badge = () => {
      const el = document.createElement("div");
      el.textContent = "GameMonetize verify mode" + (gameId ? " · " + gameId : " · no gameId");
      el.style.cssText = "position:fixed;left:10px;bottom:10px;z-index:10001;padding:6px 12px;border-radius:999px;" +
        "background:#f7b84b;color:#1b1205;font:700 12px/1 system-ui,sans-serif";
      document.body.appendChild(el);
    };
    if (document.body) badge();
    else addEventListener("DOMContentLoaded", badge, { once: true });
  }

  dispatchEvent(new Event("siteadsready"));
})();
