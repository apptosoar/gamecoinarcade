/* consent.js — consent gate for advertising cookies.
   Loaded by site-chrome.js on every static page and directly by the SPA.

   The banner only appears once ads are actually switched on (SITE_ADS_ENABLED),
   so visitors are not asked to agree to third-party cookies that do not exist
   yet. Ad code must call SiteConsent.granted() before loading any SDK, and the
   footer "cookie settings" link reopens the choice so consent can be withdrawn
   as easily as it was given. */
(function () {
  const KEY = "ad_consent";
  const VERSION = 1;

  // Advertising master switch. While it is false nothing third-party loads and
  // no banner appears; flip it in the same change that ships the ad SDK.
  const ADS_ENABLED = false;
  window.SITE_ADS_ENABLED = ADS_ENABLED;

  const I18N = {
    ko: { notice: "이 사이트는 운영과 광고 제공을 위해 쿠키를 사용합니다.", more: "자세히", accept: "동의", decline: "거부", settings: "쿠키 설정" },
    en: { notice: "This site uses cookies for operation and ad delivery.", more: "Learn more", accept: "Accept", decline: "Decline", settings: "Cookie settings" },
    es: { notice: "Este sitio usa cookies para su funcionamiento y publicidad.", more: "Más info", accept: "Aceptar", decline: "Rechazar", settings: "Configuración de cookies" },
    zh: { notice: "本网站使用 Cookie 用于网站运营和广告投放。", more: "了解更多", accept: "接受", decline: "拒绝", settings: "Cookie 设置" },
    ja: { notice: "このサイトは運営と広告配信のためにCookieを使用します。", more: "詳細", accept: "同意", decline: "拒否", settings: "Cookie設定" },
    de: { notice: "Diese Website verwendet Cookies für Betrieb und Werbung.", more: "Mehr", accept: "Akzeptieren", decline: "Ablehnen", settings: "Cookie-Einstellungen" },
    fr: { notice: "Ce site utilise des cookies pour le fonctionnement et la publicité.", more: "En savoir plus", accept: "Accepter", decline: "Refuser", settings: "Paramètres des cookies" },
    hi: { notice: "यह साइट कार्यों और विज्ञापनों के लिए कुकीज़ उपयोग करती है।", more: "अधिक", accept: "स्वीकार", decline: "अस्वीकार", settings: "कुकी सेटिंग्स" },
    cs: { notice: "Tento web používá cookies pro provoz a reklamy.", more: "Více", accept: "Přijmout", decline: "Odmítnout", settings: "Nastavení cookies" },
    nl: { notice: "Deze site gebruikt cookies voor werking en advertenties.", more: "Meer info", accept: "Accepteren", decline: "Weigeren", settings: "Cookie-instellingen" },
    fi: { notice: "Tämä sivusto käyttää evästeitä toimintaan ja mainontaan.", more: "Lue lisää", accept: "Hyväksy", decline: "Hylkää", settings: "Evästeasetukset" },
    he: { notice: "אתר זה משתמש בקובצי עוגייה לתפעול ופרסום.", more: "מידע נוסף", accept: "אישור", decline: "דחה", settings: "הגדרות עוגיות" },
    ro: { notice: "Acest site folosește cookie-uri pentru funcționare și reclame.", more: "Mai mult", accept: "Acceptă", decline: "Refuz", settings: "Setări cookie-uri" },
    uk: { notice: "Цей сайт використовує файли cookie для роботи та реклами.", more: "Детальніше", accept: "Прийняти", decline: "Відхилити", settings: "Налаштування cookie" },
    pt: { notice: "Este site usa cookies para operação e publicidade.", more: "Saiba mais", accept: "Aceitar", decline: "Recusar", settings: "Configurações de cookies" },
    id: { notice: "Situs ini menggunakan cookie untuk operasional dan iklan.", more: "Pelajari", accept: "Setuju", decline: "Tolak", settings: "Pengaturan cookie" },
    bn: { notice: "এই সাইট কার্যক্রম ও বিজ্ঞাপনের জন্য কুকি ব্যবহার করে।", more: "আরও", accept: "গ্রহণ", decline: "প্রত্যাখ্যান", settings: "কুকি সেটিংস" },
    bg: { notice: "Този сайт използва бисквитки за работа и реклами.", more: "Повече", accept: "Приемам", decline: "Отказ", settings: "Настройки за бисквитки" },
    ca: { notice: "Aquest lloc utilitza galetes per al funcionament i la publicitat.", more: "Més info", accept: "Acceptar", decline: "Rebutjar", settings: "Configuració de galetes" },
    "zh-TW": { notice: "本網站使用 Cookie 用於網站運營和廣告投放。", more: "了解更多", accept: "接受", decline: "拒絕", settings: "Cookie 設定" },
    hr: { notice: "Ova stranica koristi kolačiće za rad i oglase.", more: "Više", accept: "Prihvati", decline: "Odbij", settings: "Postavke kolačića" },
    da: { notice: "Dette websted bruger cookies til drift og annoncer.", more: "Mere", accept: "Accepter", decline: "Afvis", settings: "Cookieindstillinger" },
    et: { notice: "See sait kasutab küpsiseid töö ja reklaamide jaoks.", more: "Loe rohkem", accept: "Nõustu", decline: "Keeldu", settings: "Küpsiste seaded" },
    fil: { notice: "Gumagamit ang site na ito ng cookies para sa operasyon at mga ad.", more: "Matuto pa", accept: "Tanggapin", decline: "Tanggihan", settings: "Mga setting ng cookie" },
    el: { notice: "Αυτός ο ιστότοπος χρησιμοποιεί cookies για λειτουργία και διαφημίσεις.", more: "Περισσότερα", accept: "Αποδοχή", decline: "Απόρριψη", settings: "Ρυθμίσεις cookie" },
    gu: { notice: "આ સાઇટ ઓપરેશન અને જાહેરાત માટે કૂકીઝ વાપરે છે.", more: "વધુ", accept: "સ્વીકાર", decline: "નકારો", settings: "કૂકી સેટિંગ્સ" },
    hu: { notice: "Ez a weboldal sütiket használ a működéshez és hirdetésekhez.", more: "Részletek", accept: "Elfogadom", decline: "Elutasítás", settings: "Süti beállítások" },
    it: { notice: "Questo sito usa cookie per il funzionamento e la pubblicità.", more: "Scopri di più", accept: "Accetta", decline: "Rifiuta", settings: "Impostazioni cookie" },
    kn: { notice: "ಈ ಸೈಟ್ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ಜಾಹೀರಾತಿಗಾಗಿ ಕುಕೀಗಳನ್ನು ಬಳಸುತ್ತದೆ.", more: "ಇನ್ನಷ್ಟು", accept: "ಒಪ್ಪಿಕೊಳ್ಳಿ", decline: "ನಿರಾಕರಿಸಿ", settings: "ಕುಕೀ ಸೆಟ್ಟಿಂಗ್‌ಗಳು" },
    lv: { notice: "Šī vietne izmanto sīkfailus darbībai un reklāmām.", more: "Vairāk", accept: "Piekrist", decline: "Noraidīt", settings: "Sīkfailu iestatījumi" },
    lt: { notice: "Ši svetainė naudoja slapukus veikimui ir reklamai.", more: "Daugiau", accept: "Sutikti", decline: "Atmesti", settings: "Slapukų nustatymai" },
    ms: { notice: "Laman ini menggunakan kuki untuk operasi dan iklan.", more: "Ketahui lebih", accept: "Terima", decline: "Tolak", settings: "Tetapan kuki" },
    ml: { notice: "ഈ സൈറ്റ് പ്രവർത്തനത്തിനും പരസ്യത്തിനും കുക്കികൾ ഉപയോഗിക്കുന്നു.", more: "കൂടുതൽ", accept: "സ്വീകരിക്കുക", decline: "നിരസിക്കുക", settings: "കുക്കി ക്രമീകരണങ്ങൾ" },
    mr: { notice: "हे साइट ऑपरेशन आणि जाहिरातींसाठी कुकीज वापरते.", more: "अधिक", accept: "स्वीकारा", decline: "नकार द्या", settings: "कुकी सेटिंग्ज" },
    no: { notice: "Dette nettstedet bruker informasjonskapsler for drift og annonser.", more: "Mer", accept: "Godta", decline: "Avvis", settings: "Infokapselinnstillinger" },
    pl: { notice: "Ta strona używa ciasteczek do działania i reklam.", more: "Więcej", accept: "Akceptuj", decline: "Odrzuć", settings: "Ustawienia cookies" },
    pa: { notice: "ਇਹ ਸਾਈਟ ਕਾਰਜਾਂ ਅਤੇ ਇਸ਼ਤਿਹਾਰਾਂ ਲਈ ਕੁਕੀਜ਼ ਵਰਤਦੀ ਹੈ।", more: "ਹੋਰ", accept: "ਸਵੀਕਾਰ", decline: "ਇਨਕਾਰ", settings: "ਕੁਕੀ ਸੈਟਿੰਗਾਂ" },
    ru: { notice: "Этот сайт использует файлы cookie для работы и рекламы.", more: "Подробнее", accept: "Принять", decline: "Отклонить", settings: "Настройки cookie" },
    sr: { notice: "Овај сајт користи колачиће за рад и огласе.", more: "Више", accept: "Прихвати", decline: "Одбиј", settings: "Подешавања колачића" },
    sk: { notice: "Táto stránka používa súbory cookie pre prevádzku a reklamy.", more: "Viac", accept: "Prijať", decline: "Odmietnuť", settings: "Nastavenia cookies" },
    sl: { notice: "To spletno mesto uporablja piškotke za delovanje in oglase.", more: "Več", accept: "Sprejmi", decline: "Zavrni", settings: "Nastavitve piškotkov" },
    sv: { notice: "Den här webbplatsen använder cookies för drift och annonser.", more: "Mer", accept: "Acceptera", decline: "Avvisa", settings: "Cookieinställningar" },
    ta: { notice: "இந்த தளம் செயல்பாடு மற்றும் விளம்பரங்களுக்கு குக்கிகளை பயன்படுத்துகிறது.", more: "மேலும்", accept: "ஏற்றுக்கொள்", decline: "நிராகரி", settings: "குக்கீ அமைப்புகள்" },
    te: { notice: "ఈ సైట్ ఆపరేషన్ మరియు ప్రకటనల కోసం కుకీలను ఉపయోగిస్తుంది.", more: "మరిన్ని", accept: "అంగీకరించు", decline: "తిరస్కరించు", settings: "కుకీ సెట్టింగ్‌లు" },
    th: { notice: "เว็บไซต์นี้ใช้คุกกี้สำหรับการดำเนินงานและโฆษณา", more: "เพิ่มเติม", accept: "ยอมรับ", decline: "ปฏิเสธ", settings: "การตั้งค่าคุกกี้" },
    tr: { notice: "Bu site işletim ve reklamcılık için çerezler kullanır.", more: "Daha fazla", accept: "Kabul et", decline: "Reddet", settings: "Çerez ayarları" },
    ur: { notice: "یہ سائٹ آپریشن اور اشتہارات کے لیے کوکیز استعمال کرتی ہے۔", more: "مزید", accept: "قبول کریں", decline: "مسترد کریں", settings: "کوکی سیٹنگز" },  };

  function detectLocale() {
    const norm = (v) => {
      if (!v) return "";
      const code = String(v).trim().replace("_", "-").toLowerCase();
      if (code === "zh-tw" || code === "zh-hk" || code === "zh-mo" || code.startsWith("zh-hant")) return "zh-TW";
      const base = code.split("-")[0];
      return I18N[code] ? code : I18N[base] ? base : "";
    };
    try {
      const params = new URLSearchParams(location.search);
      const direct = norm(params.get("locale") || params.get("lang"));
      if (direct) return direct;
      const saved = norm(localStorage.getItem("locale"));
      if (saved) return saved;
    } catch (e) { /* storage blocked */ }
    const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
    for (const l of langs) { const hit = norm(l); if (hit) return hit; }
    return "en";
  }

  const T = I18N[detectLocale()] || I18N.en;
  const listeners = [];
  let banner = null;

  function read() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null");
      return raw && raw.v === VERSION ? raw.c : null;
    } catch (e) { return null; }
  }

  function save(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ c: choice, v: VERSION, t: Date.now() })); } catch (e) { /* ignore */ }
  }

  function choose(choice) {
    save(choice);
    close();
    listeners.forEach((fn) => { try { fn(choice); } catch (e) { /* a listener must not break the rest */ } });
  }

  function close() {
    if (banner) { banner.remove(); banner = null; }
  }

  function render() {
    if (banner) return;
    banner = document.createElement("div");
    banner.id = "consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.style.cssText = "position:fixed;bottom:0;left:0;right:0;z-index:9999;display:flex;align-items:center;" +
      "justify-content:center;gap:14px;flex-wrap:wrap;padding:14px 20px;background:#20242b;" +
      "border-top:1px solid rgba(255,255,255,0.12);color:#b8bec9;font:13px/1.5 system-ui,-apple-system,sans-serif";
    const btn = "padding:7px 18px;border:none;border-radius:6px;font:600 13px/1 inherit;cursor:pointer";
    banner.innerHTML =
      '<span style="max-width:52ch">' + T.notice + "</span>" +
      '<span style="display:flex;align-items:center;gap:10px;flex-shrink:0">' +
        '<a href="/privacy.html" style="color:#2bd1c4;text-decoration:none">' + T.more + "</a>" +
        '<button type="button" data-consent="denied" style="' + btn + ';background:rgba(255,255,255,0.12);color:#f4f2ea">' + T.decline + "</button>" +
        '<button type="button" data-consent="granted" style="' + btn + ';background:#f7b84b;color:#1b1205">' + T.accept + "</button>" +
      "</span>";
    banner.querySelectorAll("[data-consent]").forEach((b) => {
      b.addEventListener("click", () => choose(b.dataset.consent));
    });
    document.body.appendChild(banner);
  }

  const SiteConsent = {
    /** "granted" | "denied" | null (not asked yet) */
    get: read,
    granted: () => read() === "granted",
    /** ad code should call this and only load an SDK when it resolves true */
    set: choose,
    onChange(fn) { listeners.push(fn); },
    /** reopen the choice — used by the footer link, so consent can be withdrawn */
    open() { close(); render(); },
    strings: T,
    adsEnabled: ADS_ENABLED,
    /** shown only when ads are live and no choice has been recorded */
    maybeShow() {
      if (!ADS_ENABLED || read()) return;
      if (document.body) render();
      else addEventListener("DOMContentLoaded", render, { once: true });
    },
  };

  window.SiteConsent = SiteConsent;
  // site-chrome.js pulls this file in asynchronously, so it waits on the event
  dispatchEvent(new Event("siteconsentready"));
  SiteConsent.maybeShow();
})();
