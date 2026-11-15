// Fails the build if anything a visitor can receive mentions unreleased work.
// Runs automatically after `npm run build` (see "postbuild" in package.json).
//
// WHY: the release switch hides pages at run time, but any content module imported by a client
// component is still shipped, in full, in the JavaScript every visitor downloads. This check
// looks at the actual output, so a mistake like that cannot be deployed unnoticed.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

if (process.env.NEXT_PUBLIC_PUBLISH_CONATUS === "true") {
  console.log("[check-private] release switch is ON: skipping");
  process.exit(0);
}

const TERMS = [/conatus/i, /کوناتوس/, /cancer/i, /سرطان/, /tumou?r/i, /تومور/, /chemotherap/i];
const TEXT = new Set([".js", ".html", ".rsc", ".json", ".css", ".txt", ".xml", ".svg", ".yml", ".map"]);
// Only what is actually SERVED: the client bundle, pre-rendered pages/payloads and generated text
// bodies (sitemap, robots), and public/. Server-only code under .next/server is never sent to visitors.
const ROOTS = [
  { dir: ".next/static", ext: TEXT },
  { dir: ".next/server/app", ext: new Set([".html", ".rsc", ".body", ".txt", ".xml"]) },
  { dir: "public", ext: TEXT },
].filter((r) => existsSync(r.dir));
// The self-hosted CMS runtime is third-party code and contains unrelated words.
const SKIP = [/public\/admin\/vendor\//];

const hits = [];
function walk(dir, ext) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (SKIP.some((r) => r.test(p))) continue;
    const st = statSync(p);
    if (st.isDirectory()) { walk(p, ext); continue; }
    if (!ext.has(extname(p))) continue;
    const body = readFileSync(p, "utf8");
    for (const re of TERMS) {
      const m = re.exec(body);
      if (m) {
        hits.push(`  ${p}  ←  "${body.slice(Math.max(0, m.index - 25), m.index + 35).replace(/\s+/g, " ")}"`);
        break;
      }
    }
  }
}
ROOTS.forEach((r) => walk(r.dir, r.ext));

if (hits.length) {
  console.error(`\n[check-private] BUILD STOPPED: ${hits.length} file(s) a visitor could receive mention unreleased work:\n`);
  console.error(hits.slice(0, 12).join("\n"));
  console.error("\nUsually a client component imports a content module (site, projects, visibility). Import @/content/identity instead.\n");
  process.exit(1);
}
console.log(`[check-private] ok: nothing unreleased in ${ROOTS.map((r) => r.dir).join(", ")}`);
