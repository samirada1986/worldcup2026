// Regenerate low-quality blur placeholders for every image in public/works + public/about.
// Requires ImageMagick (`convert`) on PATH.  Run from the project root:
//   node scripts/gen-blur.mjs
import { execSync } from "node:child_process";
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const roots = ["public/works", "public/about"];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(jpe?g|png|webp)$/i.test(name)) out.push(p);
  }
  return out;
}

const files = roots.flatMap(walk).sort();
const lines = ['// Auto-generated low-quality image placeholders (base64). Do not edit by hand.'];
lines.push("export const blur: Record<string, string> = {");

for (const file of files) {
  const rel = "/" + relative("public", file).split("\\").join("/");
  const b64 = execSync(
    `convert ${JSON.stringify(file)} -strip -resize 20x -quality 40 -interlace none jpg:- | base64 -w0`,
    { shell: "/bin/bash", maxBuffer: 1 << 24 }
  )
    .toString()
    .trim();
  lines.push(`  ${JSON.stringify(rel)}: "data:image/jpeg;base64,${b64}",`);
}

lines.push("};\n");
writeFileSync("src/lib/blur.ts", lines.join("\n"));
console.log(`Wrote ${files.length} placeholders to src/lib/blur.ts`);
