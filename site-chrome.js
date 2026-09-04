/* site-chrome.js — shared header + footer for all non-SPA pages */
(function () {

  /* ── Measurement first, before anything else in this file ─────────
     This script tag sits in every page's <head>, so injecting these two from
     here — at parse time, rather than from init() after DOMContentLoaded — is
     what gets the requests out while the document is still loading. Waiting
     for the DOM lost the page view of every visitor who left during the wait.
     analytics.js goes first because it sets the Consent Mode defaults that the
     ad tag then reads. The rest of the ad stack still loads from init(); only
     the two tags that count a visit are hoisted, and only they are ordered
     ahead of the others. */
  (function loadMeasurement() {
    ["/analytics.js", "/adsense.js"].forEach((src) => {
      if (document.querySelector('script[src="' + src + '"]')) return;
      const el = document.createElement("script");
      el.async = false;   // keep this order, and stay ahead of init()'s scripts
      el.src = src;
      document.head.appendChild(el);
    });
  })();

  /* ── i18n data (nav + footer strings for all 47 locales) ─────────── */
  const SC_I18N = {
    ko:      { games:"게임",           blog:"블로그",      community:"커뮤니티",    about:"소개",            footer:"브라우저에서 바로 즐기는 웹 게임 모음" },
    en:      { games:"Games",          blog:"Blog",        community:"Community",   about:"About",           footer:"A collection of web games that run directly in your browser" },
    es:      { games:"Juegos",         blog:"Blog",        community:"Comunidad",   about:"Acerca",          footer:"Una colección de juegos web que se ejecutan directamente en tu navegador" },
    zh:      { games:"游戏",           blog:"博客",         community:"社区",        about:"关于",            footer:"可直接在浏览器中游玩的网页游戏合集" },
    ja:      { games:"ゲーム",         blog:"ブログ",       community:"コミュニティ", about:"About",           footer:"ブラウザで直接遊べるウェブゲーム集" },
    de:      { games:"Spiele",         blog:"Blog",        community:"Community",   about:"Über uns",        footer:"Eine Sammlung von Webspielen, die direkt im Browser laufen" },
    fr:      { games:"Jeux",           blog:"Blog",        community:"Communauté",  about:"À propos",        footer:"Une collection de jeux web qui se lancent directement dans votre navigateur" },
    hi:      { games:"गेम्स",          blog:"ब्लॉग",        community:"समुदाय",      about:"परिचय",           footer:"ब्राउज़र में सीधे खेले जाने वाले वेब गेम्स का संग्रह" },
    cs:      { games:"Hry",            blog:"Blog",        community:"Komunita",    about:"O nás",           footer:"Sbírka webových her, které běží přímo v prohlížeči" },
    nl:      { games:"Spellen",        blog:"Blog",        community:"Community",   about:"Over",            footer:"Een verzameling webspellen die direct in je browser draaien" },
    fi:      { games:"Pelit",          blog:"Blogi",       community:"Yhteisö",     about:"Tietoa",          footer:"Kokoelma webpelejä, jotka toimivat suoraan selaimessa" },
    he:      { games:"משחקים",         blog:"בלוג",         community:"קהילה",       about:"אודות",           footer:"אוסף משחקי רשת שרצים ישירות בדפדפן" },
    ro:      { games:"Jocuri",         blog:"Blog",        community:"Comunitate",  about:"Despre",          footer:"O colecție de jocuri web care rulează direct în browser" },
    uk:      { games:"Ігри",           blog:"Блог",        community:"Спільнота",   about:"Про нас",         footer:"Колекція вебігор, які запускаються прямо в браузері" },
    pt:      { games:"Jogos",          blog:"Blog",        community:"Comunidade",  about:"Sobre",           footer:"Uma coleção de jogos web que rodam diretamente no navegador" },
    id:      { games:"Game",           blog:"Blog",        community:"Komunitas",   about:"Tentang",         footer:"Kumpulan game web yang langsung berjalan di browser" },
    bn:      { games:"গেম",            blog:"ব্লগ",         community:"সম্প্রদায়",   about:"পরিচিতি",          footer:"সরাসরি ব্রাউজারে চলে এমন ওয়েব গেমের সংগ্রহ" },
    bg:      { games:"Игри",           blog:"Блог",        community:"Общност",     about:"За нас",          footer:"Колекция от уеб игри, работещи директно в браузъра" },
    ca:      { games:"Jocs",           blog:"Blog",        community:"Comunitat",   about:"Sobre",           footer:"Una col·lecció de jocs web que s'executen directament al navegador" },
    "zh-TW": { games:"遊戲",          blog:"部落格",       community:"社群",         about:"關於",            footer:"可直接在瀏覽器中遊玩的網頁遊戲合集" },
    hr:      { games:"Igre",           blog:"Blog",        community:"Zajednica",   about:"O nama",          footer:"Zbirka web igara koje se pokreću izravno u pregledniku" },
    da:      { games:"Spil",           blog:"Blog",        community:"Fællesskab",  about:"Om",              footer:"En samling webspil der kører direkte i browseren" },
    et:      { games:"Mängud",         blog:"Blogi",       community:"Kogukond",    about:"Meist",           footer:"Veebi mängude kogu, mis töötab otse brauseris" },
    fil:     { games:"Mga Laro",       blog:"Blog",        community:"Komunidad",   about:"Tungkol",         footer:"Isang koleksyon ng mga web game na tumatakbo nang direkta sa browser" },
    el:      { games:"Παιχνίδια",      blog:"Blog",        community:"Κοινότητα",   about:"Σχετικά",         footer:"Μια συλλογή web παιχνιδιών που τρέχουν απευθείας στον browser" },
    gu:      { games:"ગેમ્સ",          blog:"બ્લૉગ",        community:"સમુદાય",      about:"પરિચય",           footer:"સીધા બ્રાઉઝરમાં ચાલતી વેબ ગેમ્સનો સંગ્રહ" },
    hu:      { games:"Játékok",        blog:"Blog",        community:"Közösség",    about:"Rólunk",          footer:"Böngészőben közvetlenül futó webjátékok gyűjteménye" },
    it:      { games:"Giochi",         blog:"Blog",        community:"Comunità",    about:"Chi siamo",       footer:"Una raccolta di giochi web che si avviano direttamente nel browser" },
    kn:      { games:"ಆಟಗಳು",          blog:"ಬ್ಲಾಗ್",       community:"ಸಮುದಾಯ",     about:"ನಮ್ಮ ಬಗ್ಗೆ",        footer:"ನೇರವಾಗಿ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಆಡಬಹುದಾದ ವೆಬ್ ಗೇಮ್‌ಗಳ ಸಂಗ್ರಹ" },
    lv:      { games:"Spēles",         blog:"Blog",        community:"Kopiena",     about:"Par mums",        footer:"Tīmekļa spēļu kolekcija, kas darbojas tieši pārlūkprogrammā" },
    lt:      { games:"Žaidimai",       blog:"Tinklaraštis",community:"Bendruomenė", about:"Apie",            footer:"Žiniatinklio žaidimų kolekcija, veikianti tiesiogiai naršyklėje" },
    ms:      { games:"Permainan",      blog:"Blog",        community:"Komuniti",    about:"Tentang",         footer:"Koleksi permainan web yang berjalan terus dalam pelayar" },
    ml:      { games:"ഗെയിമുകൾ",       blog:"ബ്ലോഗ്",       community:"കമ്മ്യൂണിറ്റി", about:"ഞങ്ങളെ കുറിച്ച്", footer:"ബ്രൗസറിൽ നേരിട്ട് ഓടുന്ന വെബ് ഗെയിമുകളുടെ ശേഖരം" },
    mr:      { games:"खेळ",            blog:"ब्लॉग",        community:"समुदाय",      about:"आमच्याबद्दल",     footer:"थेट ब्राउझरमध्ये चालणाऱ्या वेब गेम्सचा संग्रह" },
    no:      { games:"Spill",          blog:"Blogg",       community:"Fellesskap",  about:"Om",              footer:"En samling nettspill som kjører direkte i nettleseren" },
    pl:      { games:"Gry",            blog:"Blog",        community:"Społeczność", about:"O nas",           footer:"Kolekcja gier webowych działających bezpośrednio w przeglądarce" },
    pa:      { games:"ਗੇਮਾਂ",           blog:"ਬਲੌਗ",        community:"ਭਾਈਚਾਰਾ",    about:"ਸਾਡੇ ਬਾਰੇ",       footer:"ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਸਿੱਧੇ ਚੱਲਣ ਵਾਲੀਆਂ ਵੈੱਬ ਗੇਮਾਂ ਦਾ ਸੰਗ੍ਰਹਿ" },
    ru:      { games:"Игры",           blog:"Блог",        community:"Сообщество",  about:"О нас",           footer:"Коллекция веб-игр, запускающихся прямо в браузере" },
    sr:      { games:"Игре",           blog:"Блог",        community:"Заједница",   about:"О нама",          footer:"Колекција веб игара које се покрећу директно у прегледачу" },
    sk:      { games:"Hry",            blog:"Blog",        community:"Komunita",    about:"O nás",           footer:"Kolekcia webových hier, ktoré bežia priamo v prehliadači" },
    sl:      { games:"Igre",           blog:"Blog",        community:"Skupnost",    about:"O nas",           footer:"Zbirka spletnih iger, ki delujejo neposredno v brskalniku" },
    sv:      { games:"Spel",           blog:"Blogg",       community:"Gemenskap",   about:"Om oss",          footer:"En samling webbspel som körs direkt i webbläsaren" },
    ta:      { games:"விளையாட்டுகள்",   blog:"வலைப்பதிவு",  community:"சமூகம்",      about:"பற்றி",            footer:"நேரடியாக உலாவியில் இயங்கும் வலை விளையாட்டுகளின் தொகுப்பு" },
    te:      { games:"ఆటలు",           blog:"బ్లాగ్",       community:"సమాజం",       about:"గురించి",          footer:"నేరుగా బ్రౌజర్‌లో నడిచే వెబ్ గేమ్‌ల సేకరణ" },
    th:      { games:"เกม",            blog:"บล็อก",        community:"ชุมชน",        about:"เกี่ยวกับ",         footer:"คอลเลกชันเกมเว็บที่เล่นได้โดยตรงในเบราว์เซอร์" },
    tr:      { games:"Oyunlar",        blog:"Blog",        community:"Topluluk",    about:"Hakkında",        footer:"Doğrudan tarayıcıda çalışan web oyunları koleksiyonu" },
    ur:      { games:"گیمز",           blog:"بلاگ",         community:"کمیونٹی",     about:"ہمارے بارے میں",  footer:"براہ راست براؤزر میں چلنے والے ویب گیمز کا مجموعہ" },
  };

  const SC_LOCALE_NAMES = {
    ko:"한국어", en:"English", es:"Español", zh:"中文", ja:"日本語", de:"Deutsch",
    fr:"Français", hi:"हिन्दी", cs:"Čeština", nl:"Nederlands", fi:"Suomi",
    he:"עברית", ro:"Română", uk:"Українська", pt:"Português", id:"Bahasa Indonesia",
    bn:"বাংলা", bg:"Български", ca:"Català", "zh-TW":"繁體中文", hr:"Hrvatski",
    da:"Dansk", et:"Eesti", fil:"Filipino", el:"Ελληνικά", gu:"ગુજરાતી",
    hu:"Magyar", it:"Italiano", kn:"ಕನ್ನಡ", lv:"Latviešu", lt:"Lietuvių",
    ms:"Bahasa Melayu", ml:"മലയാളം", mr:"मराठी", no:"Norsk", pl:"Polski",
    pa:"ਪੰਜਾਬੀ", ru:"Русский", sr:"Српски", sk:"Slovenčina", sl:"Slovenščina",
    sv:"Svenska", ta:"தமிழ்", te:"తెలుగు", th:"ภาษาไทย", tr:"Türkçe", ur:"اردو",
  };

  const SC_PREFERRED = ["en","ko","ja","zh","zh-TW","es","pt","de","fr","id"];
  const SC_ALL_LOCALES = Object.keys(SC_LOCALE_NAMES);
  const SC_RTL = new Set(["he","ur","ar"]);

  function scNormalize(code) {
    if (!code) return "";
    const c = code.toLowerCase();
    if (c === "zh-tw" || c.startsWith("zh-tw") || c === "zh-hant") return "zh-TW";
    if (c.startsWith("zh")) return "zh";
    if (c.startsWith("fil") || c.startsWith("tl")) return "fil";
    return SC_ALL_LOCALES.find(l => c === l.toLowerCase() || c.startsWith(l.toLowerCase() + "-")) || "";
  }

  function scDetectLocale() {
    const saved = scNormalize(localStorage.getItem("locale"));
    if (saved) return saved;
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language || "en"];
    for (const l of langs) {
      const loc = scNormalize(l);
      if (loc) return loc;
    }
    return "en";
  }

  const scLocale = scDetectLocale();
  const scT = SC_I18N[scLocale] || SC_I18N.en;

  /* Set RTL direction when locale uses right-to-left script */
  if (SC_RTL.has(scLocale)) document.documentElement.dir = "rtl";

  function init() {
    if (document.getElementById("sc-header")) return;

    /* ── CSS ──────────────────────────────────────────────────────────── */
    const style = document.createElement("style");
    style.textContent = [
      "#sc-header{position:sticky;top:0;z-index:100;align-self:stretch;display:grid;grid-template-columns:1fr auto;align-items:center;gap:18px;min-height:68px;padding:12px clamp(16px,4vw,44px);border-bottom:1px solid rgba(255,255,255,0.12);background:rgba(16,17,20,0.84);backdrop-filter:blur(18px);box-sizing:border-box}",
      ".sc-brand{display:flex;align-items:center;gap:10px;min-width:0;color:#f4f2ea;text-decoration:none;font-weight:800}",
      ".sc-brand-mark{display:grid;width:34px;height:34px;flex-shrink:0;place-items:center;border-radius:8px;background:linear-gradient(135deg,#f7b84b,#f05d5e);color:#15110a;font-weight:900;box-shadow:0 8px 20px rgba(247,184,75,0.22)}",
      ".sc-right{display:flex;align-items:center;gap:8px}",
      ".sc-nav{display:flex;gap:4px}",
      ".sc-nav a{padding:9px 12px;border-radius:8px;color:#b8bec9;text-decoration:none;font-size:.92rem;font-weight:500;transition:transform 160ms ease,color 150ms ease}",
      ".sc-nav a:hover{color:#f4f2ea;transform:translateY(-1px)}",
      ".sc-nav a.sc-active{color:#f7b84b;font-weight:600}",
      "@media(max-width:900px){.sc-nav{display:none}}",
      /* the nav's replacement below 900px - without it Blog and Community vanish on a phone */
      ".sc-menu-wrap{position:relative;z-index:20;display:none}",
      "@media(max-width:900px){.sc-menu-wrap{display:block}}",
      ".sc-menu-dd{position:absolute;top:calc(100% + 6px);right:0;width:190px;background:#1a1d24;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:4px;box-shadow:0 12px 40px rgba(0,0,0,0.5)}",
      ".sc-menu-dd[hidden]{display:none}",
      ".sc-menu-dd a{display:block;padding:10px 12px;border-radius:6px;color:#b8bec9;text-decoration:none;font:14px/1.4 system-ui,sans-serif}",
      ".sc-menu-dd a:hover{background:rgba(255,255,255,0.06);color:#f4f2ea}",
      ".sc-menu-dd a.sc-active{color:#f7b84b;background:rgba(247,184,75,0.08);font-weight:600}",
      "#sc-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;width:min(1440px,calc(100% - 32px));margin:0 auto;padding:24px 0 36px;border-top:1px solid rgba(255,255,255,0.12);color:#b8bec9;font-size:.88rem}",
      ".sc-footer-brand{display:flex;flex-direction:column;gap:4px}",
      ".sc-footer-brand strong{color:#f4f2ea;font-weight:800;font-size:.95rem;display:block}",
      ".sc-footer-brand span{display:block}",
      ".sc-footer-nav{display:flex;flex-wrap:wrap;align-items:center}",
      ".sc-footer-nav a{color:#b8bec9;text-decoration:none;padding:4px 14px;transition:color .15s}",
      ".sc-footer-nav a:hover{color:#f4f2ea}",
      ".sc-footer-nav a+a{border-left:1px solid rgba(255,255,255,0.12)}",
      "body:not(.game-wrap-adjust){display:flex;flex-direction:column;min-height:100dvh}",
      "body:not(.game-wrap-adjust) #sc-footer{margin-top:auto}",
      ".game-wrap-adjust .wrap{height:min(calc(100dvh - 68px - var(--sc-footer-h,108px)),720px)!important}",
      ".game-wrap-adjust .game{height:calc(100dvh - 68px - var(--sc-footer-h,108px))!important}",
      "@media(max-width:780px){.game-wrap-adjust .wrap{height:min(calc(100dvh - 68px),720px)!important}.game-wrap-adjust .game{height:calc(100dvh - 68px)!important}}",
      /* lang switcher */
      ".sc-lang-wrap{position:relative;z-index:20}",
      ".sc-lang-btn{display:flex;align-items:center;gap:6px;height:36px;padding:0 10px;border:1px solid rgba(255,255,255,0.14);border-radius:8px;background:transparent;color:#b8bec9;font:13px/1 system-ui,sans-serif;cursor:pointer;white-space:nowrap;transition:background 160ms,color 160ms}",
      ".sc-lang-btn:hover,.sc-lang-btn[aria-expanded=true]{background:rgba(255,255,255,0.07);color:#f4f2ea}",
      ".sc-lang-dd{position:absolute;top:calc(100% + 6px);right:0;width:200px;max-height:340px;overflow-y:auto;background:#1a1d24;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:4px;box-shadow:0 12px 40px rgba(0,0,0,0.5);scrollbar-width:thin}",
      ".sc-lang-dd[hidden]{display:none}",
      ".sc-lang-opt{display:block;width:100%;padding:8px 12px;text-align:start;background:transparent;border:0;border-radius:6px;color:#b8bec9;font:14px/1.4 system-ui,sans-serif;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".sc-lang-opt:hover{background:rgba(255,255,255,0.06);color:#f4f2ea}",
      ".sc-lang-opt.active{color:#f7b84b;background:rgba(247,184,75,0.08);font-weight:600}",
      "@media(max-width:460px){.sc-lang-dd{right:-10px;width:180px}.sc-lang-label{display:none}.sc-lang-btn{padding:0 8px}}",
      /* Game write-up below the play area. Only 10 of the 52 game pages load
         game-shell.css - the rest style themselves inline - so this lives here,
         where every page already gets it. */
      ".game-article{width:min(760px,calc(100% - 32px));margin:8px auto 0;padding:32px 0 8px;border-top:1px solid rgba(255,255,255,0.1);color:#b8bec9;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.75;text-align:start}",
      ".game-article h1{margin:0 0 16px;font-size:clamp(1.5rem,4.5vw,2rem);color:#f4f2ea;font-weight:800}",
      ".game-article h2{margin:30px 0 10px;font-size:.78rem;text-transform:uppercase;letter-spacing:1.5px;color:#f7b84b;font-weight:700}",
      ".game-article p{margin:0 0 14px;max-width:66ch;font-size:1rem}",
      ".game-article ul{margin:0 0 16px;padding-inline-start:20px}",
      ".game-article li{margin-bottom:6px}",
      ".game-article strong{color:#f4f2ea}",
      ".game-article hr{margin:26px 0;border:none;border-top:1px solid rgba(255,255,255,0.08)}",
      ".game-article a{color:#2bd1c4}",
      "@media(max-width:520px){.game-article{padding-top:24px}}",
    ].join("");
    document.head.appendChild(style);

    /* ── Active nav detection ─────────────────────────────────────────── */
    const p = location.pathname;
    function active(href) {
      if (href === "/" && (p === "/" || p.startsWith("/games/"))) return true;
      if (href !== "/" && p.startsWith(href.replace(".html", ""))) return true;
      return false;
    }
    const NAV = [
      { label: scT.games,     href: "/" },
      { label: scT.blog,      href: "/blog.html" },
      { label: scT.community, href: "/community.html" },
      { label: scT.about,     href: "/about.html" },
    ];

    /* ── Language switcher HTML ───────────────────────────────────────── */
    const preferred = SC_PREFERRED.filter(l => SC_LOCALE_NAMES[l]);
    const rest = SC_ALL_LOCALES.filter(l => !preferred.includes(l))
      .sort((a, b) => SC_LOCALE_NAMES[a].localeCompare(SC_LOCALE_NAMES[b]));
    const sorted = [...preferred, ...rest];

    const langHtml =
      '<div class="sc-lang-wrap">' +
        '<button class="sc-lang-btn" id="scLangBtn" aria-label="Change language" aria-expanded="false" aria-haspopup="listbox">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
          '<span class="sc-lang-label">' + (SC_LOCALE_NAMES[scLocale] || "English") + '</span>' +
        '</button>' +
        '<div class="sc-lang-dd" id="scLangDd" hidden>' +
          sorted.map(l =>
            '<button class="sc-lang-opt' + (l === scLocale ? ' active' : '') + '" data-locale="' + l + '">' +
            SC_LOCALE_NAMES[l] + '</button>'
          ).join("") +
        '</div>' +
      '</div>';

    /* ── Mobile menu HTML (same destinations as .sc-nav) ──────────────── */
    const menuHtml =
      '<div class="sc-menu-wrap">' +
        '<button class="sc-lang-btn" id="scMenuBtn" aria-label="Menu" aria-expanded="false" aria-haspopup="true" aria-controls="scMenuDd">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
        '</button>' +
        '<div class="sc-menu-dd" id="scMenuDd" hidden>' +
          NAV.map(n =>
            '<a href="' + n.href + '"' + (active(n.href) ? ' class="sc-active"' : "") + ">" + n.label + "</a>"
          ).join("") +
        '</div>' +
      '</div>';

    /* ── Header ───────────────────────────────────────────────────────── */
    const header = document.createElement("header");
    header.id = "sc-header";
    header.innerHTML =
      '<a class="sc-brand" href="/">' +
        '<span class="sc-brand-mark">G</span>' +
        '<span>Webgame Arcades</span>' +
      '</a>' +
      '<div class="sc-right">' +
        '<nav class="sc-nav">' +
        NAV.map(n =>
          '<a href="' + n.href + '"' + (active(n.href) ? ' class="sc-active"' : "") + ">" + n.label + "</a>"
        ).join("") +
        '</nav>' +
        langHtml +
        menuHtml +
      '</div>';

    document.querySelectorAll("header").forEach(h => h.remove());
    document.body.insertBefore(header, document.body.firstChild);

    /* ── Lang switcher events ─────────────────────────────────────────── */
    const btn = document.getElementById("scLangBtn");
    const dd  = document.getElementById("scLangDd");

    btn.addEventListener("click", e => {
      e.stopPropagation();
      const open = dd.hidden;
      dd.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      if (open) dd.querySelector(".active")?.scrollIntoView({ block: "nearest" });
    });

    dd.addEventListener("click", e => {
      const locale = e.target.closest("[data-locale]")?.dataset.locale;
      if (!locale || locale === scLocale) return;
      localStorage.setItem("locale", locale);
      localStorage.setItem("locale_source", "manual");
      localStorage.removeItem("geo_locale");
      location.reload();
    });

    /* ── Mobile menu events ───────────────────────────────────────────── */
    const menuBtn = document.getElementById("scMenuBtn");
    const menuDd  = document.getElementById("scMenuDd");

    menuBtn.addEventListener("click", e => {
      e.stopPropagation();
      const open = menuDd.hidden;
      menuDd.hidden = !open;
      menuBtn.setAttribute("aria-expanded", String(open));
    });

    function closeAll() {
      dd.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      menuDd.hidden = true;
      menuBtn.setAttribute("aria-expanded", "false");
    }

    document.addEventListener("click", closeAll);

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeAll();
    });

    /* ── Footer ───────────────────────────────────────────────────────── */
    const footer = document.createElement("footer");
    footer.id = "sc-footer";
    footer.innerHTML =
      '<div class="sc-footer-brand">' +
        '<strong>Webgame Arcades</strong>' +
        '<span>' + scT.footer + '</span>' +
      '</div>' +
      '<nav class="sc-footer-nav" aria-label="Footer menu">' +
        '<a href="/blog.html">' + scT.blog + '</a>' +
        '<a href="/community.html">' + scT.community + '</a>' +
        '<a href="/about.html">' + scT.about + '</a>' +
        '<a href="/privacy.html">Privacy</a>' +
        '<a href="/terms.html">Terms</a>' +
        '<a href="/faq.html">FAQ</a>' +
        '<a href="/contact.html">Contact</a>' +
      '</nav>';

    document.querySelectorAll("footer").forEach(f => f.remove());
    document.body.appendChild(footer);

    /* ── Consent gate: loaded here so every static page gets it. The cookie
          settings link only appears once ads are on, because consent must be
          as easy to withdraw as it was to give ─────────────────────────── */
    function addConsentLink() {
      if (!window.SiteConsent || !window.SiteConsent.adsEnabled) return;
      const nav = footer.querySelector(".sc-footer-nav");
      if (!nav || nav.querySelector("[data-consent-settings]")) return;
      const link = document.createElement("a");
      link.href = "#";
      link.dataset.consentSettings = "1";
      link.textContent = window.SiteConsent.strings.settings;
      link.addEventListener("click", (e) => { e.preventDefault(); window.SiteConsent.open(); });
      nav.appendChild(link);
    }
    if (window.SiteConsent) addConsentLink();
    else addEventListener("siteconsentready", addConsentLink, { once: true });

    ["/consent.js", "/ads.js", "/coins.js"].forEach((src) => {
      if (document.querySelector('script[src="' + src + '"]')) return;
      const el = document.createElement("script");
      el.src = src;
      document.head.appendChild(el);
    });

    /* ── Sync footer height as CSS variable ───────────────────────────── */
    function syncFooterH() {
      document.documentElement.style.setProperty('--sc-footer-h', footer.offsetHeight + 'px');
    }
    requestAnimationFrame(syncFooterH);
    window.addEventListener('resize', syncFooterH);

    /* ── Game play page: fix .wrap height for 68px topbar ─────────────── */
    if (/^\/games\/[^/]+\/$/.test(p) || /^\/games\/[^/]+\/index\.html$/.test(p)) {
      document.body.classList.add("game-wrap-adjust");
    }

  } // end init

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
