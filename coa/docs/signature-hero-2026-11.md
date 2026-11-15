# COA — Signature Clothing-Rack Hero

A standalone, self-contained hero that introduces COA as an editorial fashion
brand: real garments hang on a brushed-steel rail and arrive in a choreographed
sequence, then stay interactive for product discovery. Built to drop into the
homepage once the parallel redesign settles.

**Files:** `public/hero.html` (scene + motion), `public/hero-config.js` (editable
curation), `public/assets/brand/coa-mark.png` (logo).
**Preview:** serve `coa/` and open `/hero.html` (also deploys statically to Netlify).

---

## 1. Honest constraints (stated up front)

- **Creative references not inspected.** The two Instagram reels, readymag.com
  and wearebrand.io are **blocked by this environment's egress proxy**, so they
  were *not* viewed. Per the brief, nothing about them is claimed. The motion
  here is built from the written brief + general editorial-motion principles.
  To match those specific reels, provide screenshots/clips.
- **Product images are photographs, not cutouts.** All 27 assets are opaque
  JPEGs (several on models / flat-lay). There are **no transparent garment
  cutouts**, so a literal "cut-out garment drapes on a hanger" is not credible
  with current assets. Chosen solution (approved): an **art-directed framed-card
  rail** — each real photo in a portrait frame on a hanger with a product tag.
  Honest, premium, and works today. A true cut-out treatment would need a
  masking pass or studio reshoot on seamless backgrounds.

## 2. Logo-based brand analysis (extracted from `COA Logo.key`)

The Keynote was unzipped and the mark extracted (`docs/screens/logo-extracted.png`).
Colours sampled from the real artwork:

| Token | Hex | Role |
|------|------|------|
| Navy (fill) | `#324156` | primary brand / actions |
| Sage (ring) | `#899989` | secondary / editorial accents |
| Dusty rose (lettering) | `~#C9A9AC` | delicate accent, eyebrow text |
| Ivory | `#FAF8F5` | page ground (gives product photos space) |
| Ink | `#232C38` | text |

The mark is a circle: deep muted navy fill, sage gray-green ring, "COA" in thin
dusty-rose lettering with a small Persian «کوا» superscript. The real circular
mark is now used in the header (`coa-mark.png`), alongside a "COA" wordmark.
These values align with the already-derived site palette, so the hero and the
existing redesign are visually coherent.

## 3. Hero storyboard (as implemented)

1. **Open** — editorial ivory studio ground, logo + nav visible, rail bar sweeps in.
2. **Garments arrive** — 5 real garments (one per category) enter sequentially
   from varied paths (left / right / drop / up), staggered ~150ms.
3. **Hang & settle** — each settles onto its hanger with eased overshoot, then a
   soft fabric sway; tops align to the rail, longer pieces hang lower.
4. **Composition** — eyebrow, serif-Persian headline «کوآ، به رنگِ حالِ تو.»,
   supporting line, and two CTAs (مشاهدهٔ مجموعه / خرید همه) rise in. Total ≈ 4.2s.
5. **Explore** — desktop hover lifts a card + dims the rest + shows a category
   chip; click → product route. Mobile: tap selects/previews, tap again follows.

## 4. Animation technical approach

- **Vanilla JS + Web Animations API** — no GSAP/Three.js/WebGL. Evaluated GSAP;
  chose zero-dependency WAAPI for robustness (no runtime CDN), fast load, and fit
  with this no-build codebase. Only `transform`/`opacity` are animated (GPU-
  friendly, no layout thrash).
- **Non-blocking** — navigation and shopping are usable immediately; the sequence
  never gates interaction and does not replay on every navigation.
- **Fallbacks** — `prefers-reduced-motion` renders the final composition with no
  motion; `.no-js` shows everything in place; fonts are **local** (`assets/fonts`),
  so there is no external dependency at render time.
- **Data by stable ID** — garments are referenced by product id; live name/price/
  availability come from `/api/products` when the backend runs, else from a
  snapshot in `hero-config.js`. Missing/inactive products are dropped gracefully.

## 5. Admin / maintainability (no code changes)

`public/hero-config.js` holds the curated garments (by id), their rail order,
image key, arrival path, all hero copy, CTA targets, and the price snapshot.
A non-developer can re-curate the hero by editing that one file.

## 6. Mobile-specific art direction

Not a scaled desktop: the rail is re-composed to **3 garments**, tighter spacing,
stacked tags (name over price), centered copy, both CTAs above the fold, and
tap (not hover) interaction. See `docs/screens/hero-mobile.jpg`.

## 7. QA (Playwright, deviceScaleFactor 2)

| View | Screenshot | Result |
|------|-----------|--------|
| Desktop 1440 | `docs/screens/hero-desktop.jpg` | 5 garments evenly hung, names + prices readable, all categories shown |
| Mobile 390 | `docs/screens/hero-mobile.jpg` | 3 garments, no overlap, CTAs visible, clean headline |
| Reduced motion | `docs/screens/hero-reduced-motion.jpg` | final composition, no animation |

No console/page errors in any run. Prices are never obscured.

## 7b. Orange accent + rack motion (brand update)

Orange `#E87536` (provisional — to be validated against the client's brand
materials) is the hero's **signature accent, used for non-text details only**.

Measured contrast (WCAG): orange on ivory **2.82:1** and white on orange
**2.99:1** — both fail for text, so orange never carries text. Ink on orange is
4.72:1 (used for the CTA arrow); `--orange-ink #B4521C` (4.76:1 on ivory) is the
token for any orange *text*.

Where orange appears (roughly the "10%" of the composition):

- a thin line that draws in beside the eyebrow label;
- a **progress line running along the steel bar** while the garments arrive,
  drawn from the copy toward the garments;
- that line then becomes a **selection marker riding the bar** above the hovered
  / tapped garment;
- the arrow badge inside the navy primary CTA;
- the active/hover underline in the navigation.

Garments are never recoloured; the rack stays steel.

Motion added: legs and feet rise in, the bar sweeps across, **the bar flexes
under each garment as it lands**, each garment swings and decays, then keeps a
very light endless sway (own period per garment); hovering/tapping a garment
makes it swing. The opening sequence plays once per browser session
(`sessionStorage`), and is skipped entirely under `prefers-reduced-motion`.

Frames: `docs/screens/hero-motion-frames.jpg`, hover state `hero-hover.jpg`.

## 7c. Integrated into the homepage (`public/index.html`)

The rack now **is** the homepage hero (it replaced the three-image fan). It is
built inside the app, not embedded:

- `vHome()` renders it from live store state — real names, prices, stock and the
  app's own `#/product/<id>` routes; an out-of-stock piece shows «ناموجود», an
  inactive or deleted product is dropped and the rail re-spaces itself.
- Headline, sub-line and CTAs are the existing admin-managed hero copy
  (`heroTitle`, `heroSub`); a secondary «تازه‌ها» CTA was added.
- **Admin → محتوا → «لباس‌های رگال صفحه اصلی»**: five ordered slots choose which
  products hang on the rail and in what order (`S.content.rack`, stable product
  ids; default `RACK`).
- `initRack()` runs after each render: the sequence plays once per page load;
  later re-renders, back-navigation and `prefers-reduced-motion` get the settled
  composition immediately.
- Responsive: 5 garments ≥640px, 3 on phones (tap to select, tap again to open).

Checks run against the integrated page: Playwright at 1920 / 1440 / 1280 / 768 /
430 / 390 / 375 (no horizontal overflow, no console errors), existing
`test/ui/e2e.js` (desktop + mobile OK), `test/ui/a11y.js` axe scan (0
violations), API smoke test (16/16). Screens: `docs/screens/home-rack-*.jpg`.

`public/hero.html` + `hero-config.js` remain as the standalone lab version.

## 8. Not done / next steps

- **Orange across the rest of the site** (shop, PDP, cart, checkout, about,
  contact) is not applied yet; only the hero carries it.
- The circular logo mark is not yet in the main site header (wordmark only).

- **Integration into `index.html`** is intentionally deferred to avoid colliding
  with the active homepage redesign on this branch; the hero is a standalone,
  mergeable piece pending that hand-off.
- Reel-accurate motion, a true cut-out garment treatment, and a full admin UI
  (vs. the config file) are follow-ups requiring the reel assets and a cutout
  production pass respectively.
