const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const http = require("http");

// Derived from the game folders rather than a hand-kept list - the previous
// hardcoded array had gone 22 games stale, leaving those thumbnails 404ing from
// the og:image tags that point at them. Pass --all to recapture every game.
const GAMES = fs
  .readdirSync(path.join(__dirname, "games"), { withFileTypes: true })
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(__dirname, "games", e.name, "index.html")))
  .map((e) => e.name)
  .sort();

const ROOT = path.join(__dirname);
const OUT = path.join(ROOT, "assets", "thumbs");

// Served over HTTP rather than file:// - the game pages pull /site-chrome.js and
// /coins.js by absolute path, and under file:// those 404 and can leave the
// board unrendered.
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".json": "application/json" };

function startServer() {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split("?")[0]);
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end("not found"); return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

async function main() {
  const server = await startServer();
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 800, height: 720 });

  const all = process.argv.includes("--all");

  for (const game of GAMES) {
    if (!all && fs.existsSync(path.join(OUT, `${game}.png`))) continue;
    const htmlPath = path.join(ROOT, "games", game, "index.html");
    if (!fs.existsSync(htmlPath)) {
      console.log(`  skip (not found): ${game}`);
      continue;
    }

    const url = `file:///${htmlPath.replace(/\\/g, "/")}`;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 10000 });
      // wait for initial render / canvas draw
      await page.waitForTimeout(2000);

      const outFile = path.join(OUT, `${game}.png`);

      // Try .stage first (DOM-based games), fall back to canvas#game
      const hasStage = await page.locator(".stage").count() > 0;
      const hasCanvas = await page.locator("canvas#game").count() > 0;

      if (hasStage) {
        await page.locator(".stage").first().screenshot({ path: outFile });
      } else if (hasCanvas) {
        await page.locator("canvas#game").first().screenshot({ path: outFile });
      } else {
        // last resort: screenshot the body
        await page.screenshot({ path: outFile, clip: { x: 0, y: 0, width: 800, height: 500 } });
      }

      console.log(`  ✓ ${game} (${hasStage ? "stage" : hasCanvas ? "canvas" : "body"})`);
    } catch (e) {
      console.log(`  ✗ ${game}: ${e.message.split("\n")[0]}`);
    }
  }

  await browser.close();
  server.close();
  console.log("\nDone — saved to assets/thumbs/");
}

main().catch(console.error);
