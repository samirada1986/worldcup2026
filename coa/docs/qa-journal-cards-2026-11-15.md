# COA — QA pass: Persian journal/blog cards (2026-11-15)

Starting point of the QA brief: the Persian blog-card typography/layout defect
(date jammed against the title, tiny, weak separation). Fixed, verified, and
guarded with a regression test.

## Access note
The deployed preview host (`netlify.app`) is blocked by this environment's
egress proxy, so — per the brief — it was not "inspected in production." The
**exact commit that is live on the preview** was run locally and driven with
Playwright. Local behaviour is what is reported here.

## BUG-01 — invalid heading tag jams the date onto the journal title (P1)

- **Where:** homepage "از ژورنال" section (and the shared `postCard`
  component). Evidence: `docs/screens/jr-home-before.jpg` — the card rendered
  «۹ آبان ۱۴۰۵سه راه پوشیدن ترنچ‌کت» with the date glued to the title on one line.
- **Root cause (confirmed by DOM dump):** the homepage built the cards with
  `C.posts.slice(0,2).map(postCard)`. `Array.prototype.map` calls the callback
  with `(item, index, array)`, so the **posts array** was passed as `postCard`'s
  third argument `lv` (the heading level). The heading tag was therefore built as
  `<h' + lv + '>` → `<h[object Object],[object Object]>` — invalid HTML. The
  browser error-corrects it into inline garbage, collapsing the date `<span>` and
  the title onto the same line. The listing page passed `lv` explicitly (`,2`),
  so only the homepage showed the worst form; both had weak separation.
- **Files modified:** `coa/public/index.html`.
- **Fix:**
  1. Call site now passes a clean level: `.map(function(p,i){return postCard(p,i,3)})`.
  2. `postCard` rewritten to a proper, semantic card: image → `<time datetime>`
     date → real heading title → 2-line description (`excerpt()` of the body) →
     "خواندن یادداشت ←" read action. `lv` is validated (2/3/4 only).
  3. New `.jr-card` CSS: a flex column with controlled `gap`, a responsive title
     (`clamp(20px,2vw,26px)` desktop, `clamp(18px,5.5vw,22px)` mobile), a 13px
     readable date, description with a 2-line clamp, and an animated read link —
     replacing the old `.jr h3{margin-top:4px}` separation hack.
  4. The article page date is now a `<time datetime>` with real separation.
- **Verification:** `docs/screens/jr-home-after.jpg`, `jr-list-after.jpg`,
  `jr-mobile-after.jpg`. Heading is a valid `<h2>/<h3>`, no `[object` anywhere in
  the DOM, date on its own line above the title, no horizontal overflow at
  1440/390/375, long Persian titles wrap, description-less posts render.
- **Status:** ✅ fixed and verified.

## Regression guard (Phase 10)
`test/ui/journal-cards.js` — 20 Playwright assertions on desktop + mobile: no
invalid `[object` markup, title is a real heading, date is on its own line above
the title (DOM-measured gap), title > date size, date ≥ 12px, no horizontal
overflow, and the same holds for a long Persian title and an empty-body post.
All 20 pass.

## Rest of the site (this pass)
Re-ran the existing suites against the change: `test/ui/e2e.js` (purchase journey,
desktop + mobile), `test/ui/a11y.js` axe scan (**0 violations**), API smoke
(16/16). The broader audit from `review-audit-2026-11-15.md` still stands:
CLS 0, no horizontal overflow, local fonts/images, fast LCP. No other P0/P1
rendering defects were found in this pass; the open items there (thin collection
page, Persian copy pass, quick-view, studio reshoot of weak secondary assets)
remain the tracked follow-ups.

## Files modified
- `coa/public/index.html` — `postCard`, its call site, `.jr-card` CSS, article date.
- `coa/test/ui/journal-cards.js` — new regression test.
