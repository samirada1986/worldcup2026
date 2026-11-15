// Copies the Decap CMS browser runtime from node_modules into public/admin/vendor so the
// admin panel is self-hosted (no third-party CDN). Runs automatically before dev and build.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const src = "node_modules/decap-cms/dist";
const dest = "public/admin/vendor";
if (!existsSync(src)) {
  console.warn("[copy-cms] decap-cms not installed; skipping");
  process.exit(0);
}
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
const keep = /^(decap-cms\.js|\d+\.decap-cms\.js|[a-f0-9]+\.wasm)$/;
let n = 0;
for (const f of readdirSync(src)) {
  if (keep.test(f)) { cpSync(join(src, f), join(dest, f)); n++; }
}
console.log(`[copy-cms] copied ${n} files to ${dest}`);
