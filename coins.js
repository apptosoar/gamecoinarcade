/* coins.js — the site's coin balance, kept in the browser.

   Numbers are deliberately small and tied to what a coin buys rather than to
   what feels generous. One continue costs 10, so one watched ad (20) is worth
   two continues and the daily bonus (15) is worth one and a half: enough that
   a player who never watches an ad still gets a session's worth every day, and
   watching one is a visible boost rather than the only way to play. The daily
   cap of 5 exists because ad networks throttle repeat views anyway, and a
   player farming 20 ads in a row earns the site nothing extra.

   Nothing here gates gameplay. Spending is available to game code (Phase 2),
   but a visitor who ignores coins entirely can still play everything. */
(function () {
  const KEY = "coins_state";
  const VERSION = 1;

  const CONFIG = {
    start: 40,          // a comfortable first session without watching anything
    dailyBonus: 15,     // once per calendar day, on first visit
    adReward: 20,       // one rewarded view
    adDailyCap: 5,      // per calendar day
    continueCost: 10,   // Phase 2: carry on after a game over
    hintCost: 5,        // Phase 2: reveal a puzzle hint
    bestBonus: 5,       // beating your own record
  };

  const today = () => new Date().toISOString().slice(0, 10);

  function load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { /* blocked */ }
    if (!s || s.v !== VERSION) s = { v: VERSION, balance: CONFIG.start, day: "", adsToday: 0, bonusDay: "" };
    if (s.day !== today()) { s.day = today(); s.adsToday = 0; }
    return s;
  }

  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* blocked */ }
  }

  let state = load();
  const listeners = [];

  function commit(reason) {
    save(state);
    listeners.forEach((fn) => { try { fn(state.balance, reason); } catch (e) { /* one listener must not break the rest */ } });
  }

  const SiteCoins = {
    config: CONFIG,
    get: () => state.balance,
    adsLeftToday: () => Math.max(0, CONFIG.adDailyCap - state.adsToday),

    add(n, reason) {
      n = Math.max(0, Math.round(n));
      if (!n) return state.balance;
      state.balance += n;
      commit(reason || "add");
      return state.balance;
    },

    /** true if it could be paid; false leaves the balance untouched */
    spend(n, reason) {
      n = Math.max(0, Math.round(n));
      if (state.balance < n) return false;
      state.balance -= n;
      commit(reason || "spend");
      return true;
    },

    /** called after an ad resolves — also when it failed, so a broken ad
        never costs the player the reward they were promised */
    grantAdReward() {
      state.adsToday += 1;
      return this.add(CONFIG.adReward, "ad");
    },

    /** granted silently on the first visit of each day */
    claimDailyBonus() {
      if (state.bonusDay === today()) return 0;
      state.bonusDay = today();
      this.add(CONFIG.dailyBonus, "daily");
      return CONFIG.dailyBonus;
    },

    onChange(fn) { listeners.push(fn); },
    reset() { state = { v: VERSION, balance: CONFIG.start, day: today(), adsToday: 0, bonusDay: "" }; commit("reset"); },
  };

  window.SiteCoins = SiteCoins;
  SiteCoins.claimDailyBonus();
  dispatchEvent(new Event("sitecoinsready"));

  /* ── The coin chip in the header ─────────────────────────────────────
     Kept glyph-and-number so it needs no translation, with the labels only
     in the aria text. It rides in the header rather than over the canvas so
     it can never sit on top of a control. */
  const LABEL = {
    ko: { coins: "코인", watch: "광고 보고 코인 받기", left: "오늘 남은 횟수" },
    en: { coins: "Coins", watch: "Watch an ad for coins", left: "left today" },
    ja: { coins: "コイン", watch: "広告を見てコインを獲得", left: "本日の残り" },
    zh: { coins: "金币", watch: "观看广告获得金币", left: "今日剩余" },
    es: { coins: "Monedas", watch: "Ver un anuncio para ganar monedas", left: "restantes hoy" },
    de: { coins: "Münzen", watch: "Werbung ansehen für Münzen", left: "heute übrig" },
    fr: { coins: "Pièces", watch: "Regarder une pub pour des pièces", left: "restants aujourd'hui" },
    pt: { coins: "Moedas", watch: "Assistir a um anúncio para ganhar moedas", left: "restantes hoje" },
  };

  function labels() {
    let code = "";
    try {
      const p = new URLSearchParams(location.search);
      code = (p.get("locale") || p.get("lang") || localStorage.getItem("locale") || navigator.language || "en").toLowerCase();
    } catch (e) { code = (navigator.language || "en").toLowerCase(); }
    return LABEL[code] || LABEL[code.split("-")[0]] || LABEL.en;
  }

  function chipWanted() {
    // Nothing to show a balance for until ads are live; ?ads=stub opens it for
    // testing. Coins still accrue quietly in the meantime.
    const adsOn = window.SiteConsent && window.SiteConsent.adsEnabled;
    const stub = window.SiteAds && window.SiteAds.stubForced;
    return !!(adsOn || stub);
  }

  function mount() {
    if (!chipWanted()) return;
    const host = document.querySelector("#sc-header .sc-lang-wrap") || document.querySelector(".topbar .lang-wrap");
    if (!host || document.getElementById("coin-chip")) return;
    const T = labels();

    const chip = document.createElement("div");
    chip.id = "coin-chip";
    chip.style.cssText = "display:flex;align-items:center;gap:8px;margin-inline-end:10px";

    const balance = document.createElement("span");
    balance.style.cssText = "display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border:1px solid rgba(255,255,255,0.14);" +
      "border-radius:999px;color:#f7b84b;font:700 13px/1 system-ui,sans-serif;white-space:nowrap";

    const watch = document.createElement("button");
    watch.type = "button";
    watch.style.cssText = "display:none;align-items:center;gap:5px;height:36px;padding:0 12px;border:0;border-radius:999px;" +
      "background:#f7b84b;color:#1b1205;font:800 13px/1 system-ui,sans-serif;cursor:pointer;white-space:nowrap";
    watch.innerHTML = '<span aria-hidden="true">▶</span><span>+' + CONFIG.adReward + "</span>";

    function paint() {
      balance.innerHTML = '<span aria-hidden="true">🪙</span><span>' + SiteCoins.get() + "</span>";
      balance.setAttribute("aria-label", T.coins + ": " + SiteCoins.get());
      const left = SiteCoins.adsLeftToday();
      const offer = !!(window.SiteAds && window.SiteAds.available()) && left > 0;
      watch.style.display = offer ? "inline-flex" : "none";
      watch.title = T.watch + " (" + left + " " + T.left + ")";
      watch.setAttribute("aria-label", watch.title);
    }

    watch.addEventListener("click", async () => {
      if (watch.disabled) return;
      watch.disabled = true;
      watch.style.opacity = ".6";
      try {
        await window.SiteAds.show("coin-chip");
      } finally {
        // granted whether or not the ad actually played: an adblocked or broken
        // ad is not the player's fault, and the button already promised coins
        SiteCoins.grantAdReward();
        watch.disabled = false;
        watch.style.opacity = "1";
        paint();
      }
    });

    chip.appendChild(balance);
    chip.appendChild(watch);
    host.parentNode.insertBefore(chip, host);
    SiteCoins.onChange(paint);
    paint();
    addEventListener("siteadsready", paint);
  }

  function boot() {
    mount();
    if (!document.getElementById("coin-chip")) setTimeout(mount, 400);   // header is injected async
  }
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", boot);
  else boot();
})();
