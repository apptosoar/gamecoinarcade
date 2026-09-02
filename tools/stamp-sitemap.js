/* Stamp every sitemap URL with the last date its file actually changed.

   Google ignores <changefreq> and <priority>, but it does use <lastmod> — as
   long as the dates are honest. One sitemap full of "everything changed today"
   and it stops trusting the field for the whole site, so the dates come from
   git rather than from the clock: the last commit that touched the file, or
   today if the file has uncommitted edits that are about to be committed.

   Run it after a content change, before committing:  node tools/stamp-sitemap.js
*/
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://webgamearcades.com";
const SITEMAP = path.join(ROOT, "sitemap.xml");
// Local date, not toISOString() — that is UTC, and anywhere east of Greenwich
// it stamps yesterday onto files being committed today, disagreeing with the
// git dates (%cs) every other URL is stamped from.
const TODAY = (() => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
})();

const git = (args) =>
  execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();

function fileFor(url) {
  const p = url.startsWith(SITE) ? url.slice(SITE.length) || "/" : url;
  if (p === "/") return "index.html";
  return p.replace(/^\//, "") + (p.endsWith("/") ? "index.html" : "");
}

function lastChange(file) {
  if (!fs.existsSync(path.join(ROOT, file))) return null;
  if (git(["status", "--porcelain", "--", file])) return TODAY;
  return git(["log", "-1", "--format=%cs", "--", file]) || TODAY;
}

let stamped = 0;
const missing = [];
const counts = new Map();

const out = fs.readFileSync(SITEMAP, "utf8").replace(
  /<url>[\s\S]*?<\/url>/g,
  (block) => {
    const loc = /<loc>([^<]+)<\/loc>/.exec(block);
    if (!loc) return block;
    const file = fileFor(loc[1]);
    const date = lastChange(file);
    if (!date) { missing.push(`${loc[1]} -> ${file}`); return block; }
    stamped++;
    counts.set(date, (counts.get(date) || 0) + 1);
    return block
      .replace(/\s*<lastmod>[^<]*<\/lastmod>/, "")
      .replace("</loc>", `</loc>\n    <lastmod>${date}</lastmod>`);
  }
);

fs.writeFileSync(SITEMAP, out);
console.log(`stamped ${stamped} URLs`);
[...counts].sort().forEach(([d, n]) => console.log(`  ${d}  ${n}`));
if (missing.length) {
  console.error("no file behind these URLs:");
  missing.forEach((m) => console.error("  " + m));
  process.exitCode = 1;
}
