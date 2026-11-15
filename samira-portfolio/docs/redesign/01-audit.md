# 01 · Audit of the existing website

## Method and limits (read first)

- **The deployed URL could not be opened.** This working environment's network blocks `*.netlify.app` (HTTP 403 from the proxy), so I did **not** inspect the live site in a browser.
- What I audited instead is the **same code, built and run locally, in a real Chromium browser**: commit `2e83413` (the version that was deployed when the brief was written), plus its source and every photographic asset.
- Therefore **not verified**: what Netlify actually serves today, its environment variables, and whether Identity / Git Gateway are switched on. Everything below about those is unknown, not "fine".
- Screenshots: `screens/before-*.jpg`. (In `before-series-desktop.jpg` the introduction is redacted in this copy: that text no longer exists on the site.)

## Prioritised findings

### P0 · The artwork itself was not presented correctly

| # | Finding | Evidence |
|---|---------|----------|
| 1 | **Slide chrome and blank padding were baked into the photographs.** Each file contained its original slide: header text (`مستند · گزیده‌ی تصاویر`), a footer label (`مجموعه ی لحظه ی جاری`), page numbers (`۰۴`), hairlines and a slab of off-white, so every photograph sat on its own differently-sized "frame" and looked like a screenshot, not a print. | `before-series-desktop.jpg`; pixel measurement showed 25–89 % ivory-like pixels on an edge line of 7 of 8 files |
| 2 | **Root cause:** the photographs were first extracted by trimming a colour, which cannot tell slide background from bright picture (sunlit walls, cloud, white roofs). | re-detection test: a first re-crop cut 126 px off the top of one photograph, a second shaved 14 px off another; both caught and corrected |
| 3 | **Three statements were my inventions, shown as fact:** degree levels ("M.A.", "B.Sc."), the series dates "2016 – 2022", and the medium "Digital photography". None of them is in the artist's documents. | `site.ts`, `projects.ts` at `2e83413` |
| 4 | **Interpretation presented as the artist's voice** ("waits for the moment the everyday turns strange"), and an "About › Selected themes" list that came from a brief, not from her own words. | home lede, series intro, About page |
| 5 | The public copy still **named work that is not released**, and a footer line referred to a subject that is not in the published series. | documentary intro, footer tagline |
| 5b | **Unreleased content was shipped to every visitor**, even though the pages were hidden: names, a biography paragraph and complete journal notes were bundled into the browser JavaScript (and one dictionary into the Contact page's HTML), readable with "view source". Cause: client components imported the content modules, so the data travelled with them; the release switch only filtered it at run time. | search of the production build output |

### P1 · Art direction

| # | Finding |
|---|---------|
| 6 | **The architecture was designed around two bodies of work; one is published.** Result: the same photograph appeared as the home hero, again as the "selected works" card, again as the works cover, again as the series cover. |
| 7 | **A one-row "archive"** (Works) with a full-width card: the interface was larger than the content. |
| 8 | **Oversized type** (display sizes up to 7.5 rem) and ~40 arbitrary font sizes; no defined scale. |
| 9 | **Photographs were stretched.** Files are ~1110 px wide; layouts rendered them up to 1392 px (and `next/image` requested 3840 px variants). |
| 10 | **The sequence ran out of order on screen:** plate numbers read `07` before `05` in the alternating layout. |
| 11 | **One generic reveal** (fade-up) on every element, driven by an animation library loaded on every page. |
| 12 | An empty **Journal** stayed in the main navigation ("Notes will appear here"). |

### P2 · Accessibility, SEO, performance (measured with Lighthouse on a production build)

| Metric (mobile home) | Before | After |
|---|---|---|
| Performance | 81 | 92 |
| Accessibility | 96 | 100 |
| Best practices | 100 | 100 |
| SEO | 85 | 100 |
| Page weight | 686 KB | 463 KB |

Causes fixed: caption/label colours failed WCAG AA contrast (2.6 : 1 and 4.4 : 1 vs the required 4.5 : 1); canonical and hreflang URLs were relative; a link's accessible name did not contain its visible text; ~370 KB of web fonts were preloaded on English pages, including the Persian typeface; touch targets in header and footer were 18–24 px tall.

### P3 · Administration panel

| # | Finding |
|---|---------|
| 13 | `config.yml` used paths relative to a repository root that this project is not (it lives in `samira-portfolio/`), so saving would have written to non-existent paths. |
| 14 | `/admin/` redirected to `/admin`, after which the editor looked for `/config.yml` and failed with a 404. (Caught only by actually opening the editor; an HTTP 200 on the page hides it.) |
| 15 | It could edit only the journal and a few CV lists. It could **not** create projects, reorder or upload photographs, choose a cover, set draft/published, pick a layout, or set SEO. |
| 16 | The editor was loaded from a third-party CDN (reliability and privacy dependency). |

## What the redesign had to achieve

1. Present each photograph as an object: complete, uncropped, never enlarged, on a calm ground.
2. Make the site honest: only the artist's words and plain description of what is visible.
3. Fit the structure to the work that exists, and let it grow.
4. Give the artist real control (order, cover, layout, draft/publish, SEO) without a developer.
