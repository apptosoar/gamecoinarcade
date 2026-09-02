/* Bake the rendered home page into index.html.

   The home page is a hash-routed SPA: index.html ships an empty <main id="app">
   and app.js fills it. A crawler that does not run scripts saw 57 words. This
   loads the real page in a browser, waits for app.js to finish, and writes the
   resulting markup back into <main id="app"> so the HTML carries the game grid,
   the intro and the genre catalogue on its own. app.js still re-renders on load,
   so the visitor's page and the baked copy stay the same thing.

   Re-run this after editing renderHome(), homeIntro(), homeCatalog(), gameMeta
   or the English strings they use:   node tools/prerender-home.js
*/
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain",
};

function serve() {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split("?")[0]);
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end("not found"); return;
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(fs.readFileSync(file));
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve(server)));
}

(async () => {
  const server = await serve();
  const port = server.address().port;
  const browser = await chromium.launch();
  // the baked copy is the English default; every other locale is swapped in by
  // app.js at runtime from the same strings
  const page = await browser.newPage({ locale: "en-US" });

  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".app-grid .app-icon", { timeout: 15000 });
  await page.waitForSelector(".lp-catalog li a", { timeout: 15000 });

  const rendered = await page.evaluate(() => document.getElementById("app").innerHTML);
  const counts = await page.evaluate(() => ({
    tiles: document.querySelectorAll(".app-grid .app-icon").length,
    listed: document.querySelectorAll(".lp-catalog li a").length,
    words: (document.getElementById("app").innerText || "").split(/\s+/).filter(Boolean).length,
  }));

  await browser.close();
  server.close();

  if (errors.length) {
    console.error("page errors:\n" + errors.join("\n"));
    process.exit(1);
  }

  const indexPath = path.join(ROOT, "index.html");
  const html = fs.readFileSync(indexPath, "utf8");
  const marker = /(<main id="app">)([\s\S]*?)(<\/main>)/;
  if (!marker.test(html)) throw new Error('no <main id="app"> in index.html');

  const body = rendered.trim().split("\n").map(l => "      " + l.trimEnd()).join("\n");
  const out = html.replace(marker, (_, open, __, close) =>
    `${open}\n<!-- Pre-rendered by tools/prerender-home.js so the home page's content is in the\n     HTML itself. app.js replaces this with the same markup on load; re-run the\n     script after changing renderHome() or the game list. -->\n${body}\n    ${close}`);

  fs.writeFileSync(indexPath, out);
  console.log(`baked ${counts.tiles} tiles, ${counts.listed} catalogue links, ~${counts.words} words into index.html`);
})();
