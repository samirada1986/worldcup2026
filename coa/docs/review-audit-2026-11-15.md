# COA — Website Review, Audit & Motion Assessment (2026-11-15)

Scope: the two briefs of 2026-11-15 (premium review + editorial content + hero
art direction, and the advanced-motion brief).

## 0. How this was audited (and an access limitation, stated plainly)

The deployed preview `deploy-preview-3--coa-store.netlify.app` **cannot be
opened from this environment** — the egress proxy refuses `netlify.app`
(verified: `connect_rejected`). So, per the brief, I did not pretend to inspect
it. Instead I ran the **exact commit that is live on the preview**
(`0a16bd3`, the head of this branch, which is what Netlify built) on a local
copy of the real server and drove it with Playwright at 1920 / 1440 / 768 /
390 / 375. Screenshots are in `docs/screens/` (`before-*`, `after-*`).

Measured on the built page (Playwright, cold load):

| width | LCP (ms) | CLS | horiz. overflow | transfer | requests |
|---|---|---|---|---|---|
| 1920 | 204 | 0 | 0 | ~680 KB | 14 |
| 1440 | 204 | 0 | 0 | ~680 KB | 14 |
| 768 | 160 | 0 | 0 | ~680 KB | 16 |
| 390 | 168 | 0 | 0 | ~680 KB | 14 |
| 375 | 172 | 0 | 0 | ~680 KB | 14 |

No console or page errors on any route. CLS 0 everywhere, no horizontal
scroll, fonts and images are local (no third-party requests). The store is
genuinely fast and stable — performance is **not** a problem to fix.

## 1. What is already strong (so it is not "fixed")

The motion brief's premise — "do not implement only basic fade-ins" — is largely
**already met** in the codebase. The existing, accessible system:

- `data-rv="img"` → **clip-path mask reveal** (inset wipe + de-zoom) on editorial
  and gallery images — the "image mask reveal" the brief asks for.
- `data-rv="lines"` → headline reveals **line by line**.
- `data-rv="up"` → staggered entrance via a `--i` index.
- `.folio::after` → the **orange section-title underline draws in** on reveal.
- Product cards: image **scales and swaps to a second image on hover**; the meta
  link underline animates.
- `data-plx` / parallax on hero imagery.
- All gated behind `.js`, `IntersectionObserver`, and `prefers-reduced-motion`
  (which collapses everything to the static final state).

This is tasteful and on-brand. The brief also forbids scroll-hijacking, forced
waits and over-animation — so the right move is **not** to bolt a heavy GSAP
scroll-timeline on top, but to fix real defects and tighten consistency.

## 2. Prioritized issue inventory

### P1 — off-brand hero / product imagery (FIXED)
- **Page/component:** homepage hero rack, "new arrivals" and "پلار" category
  tile; product p4 (نیم‌زیپ پلار).
- **Evidence:** `before-home-full-1440.jpg`, `docs/screens` assets sheet.
- **Defect:** the green half-zip image (`pgreen.jpg`) was a jacket crumpled on a
  **car bonnet with a visible Mercedes badge** — unprofessional and a third-party
  logo. The "پلار" category tile used `poster.jpg`, a **catalogue card with
  English text** ("Half zipped pillar sweater") baked in.
- **Impact:** breaks the premium fashion read on the single most visible element;
  the English card looks like placeholder/stock art.
- **Root cause:** weak source asset chosen as the product's primary image.
- **Fix (done):** replaced `pgreen.jpg` with a clean, text-free crop of the green
  half-zip on ivory (honest crop, no manipulation); pointed the "پلار" category
  image at it too. Mercedes car and English text are gone from the site.
- **Status:** ✅ implemented, verified (`after-home-1440.jpg`, `after-categories.jpg`).

### P2 — journal images used a plain fade (FIXED)
- Editorial journal thumbnails used `data-rv="up"` (fade) while every other
  editorial image uses the mask reveal. Aligned them to `data-rv="img"` for one
  consistent reveal language. ✅ implemented.

### P3 — "مجموعه فصل" (collection) page is thin — NOT yet addressed
- **Evidence:** `before-collection-1440.jpg`.
- **Defect:** the page is an editorial image + one headline with large empty
  space and little product discovery; it is reachable from the main nav.
- **Impact:** a prominent nav destination underdelivers.
- **Recommendation:** either enrich it (lookbook with product hotspots + a curated
  product grid) or fold it into Shop. Deferred — see §4.

### P4 — remaining weak catalogue assets — asset checklist, not faked
Still-weak source images that no crop can make premium; listed for a proper
shoot rather than disguised:
- `matcha.jpg` (skirt crumpled on a bed), `trio.jpg` / `colors.jpg` /
  `swatch.jpg` (catalogue line-ups and swatch grids). These are currently used
  only as secondary/colour images, so impact is low, but they should be replaced
  in a studio pass (flat-lay or on-figure on seamless ivory, 3:4, ≥1200px tall).

## 3. Brand & content notes

- **Palette/balance:** navy + ivory + sage + one orange accent now reads
  coherently; orange stays off text (2.8:1) and is used for lines/markers/one
  CTA, with a single orange-led band. Balance looks right — not too much orange.
  The provisional orange `#E87536` and three alternatives (with contrast figures)
  are in `brand-direction-2026-11.md` for the client to validate against real
  brand material.
- **Copy:** the store is **Persian / RTL**. The briefs' proposed slogans are in
  English ("Made to be worn. Made to be you."); translating them literally would
  not fit. The current Persian section headings are already distinct and on-voice
  («خرید بر اساس دسته», «تازه رسیده», «انتخاب‌های COA»…). A full Persian copy pass
  in the proposed voice is a worthwhile follow-up but was **not** force-fitted
  from English this round.

## 4. Remaining work (honest, sequenced — not done this round)

1. Enrich or retire the collection page (P3) — lookbook + hotspots + product grid.
2. Persian copy pass in the COA voice (distinct CTA per section; tighten the
   brand statement) — adapting the briefs' intent, not translating slogans.
3. Quick-view panel from product cards and hero garments (currently cards/hero
   link straight to the PDP, which works and is accessible).
4. A studio asset pass for the weak secondary images in P4.
5. The hero stays the asset-honest **framed-card rail** (chosen earlier because
   there are no transparent garment cut-outs); a true cut-out treatment needs a
   masking/reshoot pass. The Instagram/Readymag/WeAreBrand references remain
   unreachable from here, so motion was built from principles, not those reels.

## 5. QA this round

Playwright 1920–375 (0 overflow, 0 CLS, no errors), `test/ui/e2e.js`
(desktop + mobile pass), `test/ui/a11y.js` axe scan (**0 violations**), API smoke
(16/16). Before/after screenshots in `docs/screens/`.
