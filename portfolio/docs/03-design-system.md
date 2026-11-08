# 3. Design system

Source of truth: `src/styles/site.css` (tokens at the top, components below). Every spacing rule uses **logical properties** (`margin-inline-start`, `padding-block` …), so one stylesheet serves English (LTR) and Persian (RTL).

## Colour

| Token | Value | Use | Contrast on paper |
|---|---|---|---|
| `--paper` | `#F7F6F2` | page ground, lightbox ground | — |
| `--white` | `#FFFFFF` | form fields | — |
| `--ink` | `#191919` | text, rules, buttons | 16.3 : 1 |
| `--ink-2` | `#5D5C58` | secondary text, captions, metadata | 6.2 : 1 (AA) |
| `--ink-3` | `#8B8A85` | non-text only (link underline tint) | 3.2 : 1 |
| `--rule` / `--rule-strong` | `#E2E0DA` / `#C9C6BE` | dividers | — |
| `--wash` | `#EFEDE7` | image background while loading | — |
| `--error` / `--ok` | `#9A2C1F` / `#2F5D3A` | form states | 7.1 : 1 |

The palette is starting point plus one adjustment. The suggested `#707070` secondary grey was darkened to `#5D5C58` so small captions pass WCAG AA comfortably on the warm ground. There is no brand colour: the artwork provides colour.

## Typography

| Role | English | Persian |
|---|---|---|
| Display / page titles | Instrument Serif 400 | Vazirmatn 300 |
| Section headings (h2/h3) | Instrument Serif 400 | Vazirmatn 350–500 |
| Interface, body, captions | Inter (variable) | Vazirmatn (variable) |
| Long-form essays | Source Serif 4 (variable, optical sizes) | Vazirmatn |
| Labels / metadata | Inter 500, 12.5 px, uppercase, +0.09em | Vazirmatn 500, 14 px, **no** uppercase or tracking |

Fonts are **self-hosted** via Fontsource, with no request to Google. This helps privacy and reliability for visitors in Iran, and only the unicode subsets actually used are downloaded. All families are OFL-licensed.

Why these: Instrument Serif gives a contemporary, slightly condensed editorial voice that suits titles like *CONATUS* without feeling like fashion. Inter is neutral and very legible at small sizes. Source Serif 4 is a true text face with optical sizes for long reading. Vazirmatn is the most complete and best-hinted contemporary Persian family. Estedad was evaluated, but its display character competes with the artwork, and its Latin is weaker than Vazirmatn's.

### Fluid type scale (min at 375 px → max at 1920 px)

| Token | English | Persian |
|---|---|---|
| `--t-display` | 44 → 112 px, lh 0.98 | 36 → 88 px, lh 1.3 |
| `--t-title` (essay titles) | 38 → 76 px | 32 → 60 px |
| `--t-h2` | 28 → 42 px | 24 → 36 px |
| `--t-h3` | 22 → 28 px | 22 → 28 px |
| `--t-lead` | 21 → 28 px | 19 → 24 px, lh 1.9 |
| `--t-read` (essays) | 18 → 20 px, lh 1.7 | 17 → 19 px, lh 2.05 |
| `--t-body` | 17 px, lh 1.6 | 17 px, lh 1.9 |
| `--t-caption` | 14 px | 14 px |

Reading measure: about 36 rem (≈ 65 characters) for English and 38 rem for Persian.

## Spacing and rhythm

A 4-based scale: `--s-1` (4 px) to `--s-10` (128 px). Section spacing is fluid, `--section: clamp(72px, …, 160px)`. Inside a project sequence, consecutive blocks are separated by `clamp(64px, 9vw, 160px)`, enough white space for each work to be seen alone.

## Grid

| Breakpoint | Columns | Gutter | Outer margin |
|---|---|---|---|
| Mobile (< 768) | 4 | 16 px | 16 px |
| Tablet (≥ 768) | 8 | 20 px | 32 px |
| Desktop (≥ 1024) | 12 | 24 px | 48 px |
| Wide (≥ 1440) | 12 | 24 px | 56 px, max width 1760 px |

## Image rules

- Never cropped, never stretched. The figure width comes from the aspect ratio: `width: min(100%, 86svh × ratio)`.
- Images use derivatives at 480, 960, 1600 and 2400 px wide (WebP, quality 82–90) via `srcset`/`sizes`. The original upload is kept untouched as the master.
- The opening image loads eagerly with `fetchpriority=high`; everything else is lazy-loaded.
- Captions sit under the image, aligned to its edge: number, then title. Full metadata appears in the lightbox and on the artwork page.

## Sequence layouts (CMS blocks)

| Block | Desktop composition |
|---|---|
| Image sequence | Ordered images: one per row centred, pairs, or alternating start/end |
| Single image | Small (4 col), Medium (6), Large (8), Wide (10), aligned start/centre/end |
| Two-image spread | Equal halves, or asymmetric 7+4 / 4+6; top, middle or bottom aligned |
| Full-width image | Edge to edge, or within margins |
| Image with text | 6 + 4 columns, image first or text first |
| Text | Reading column, columns 4–9 |
| White space | S / M / L / XL |
| Video | Uploaded mp4/webm or Vimeo/YouTube (privacy-enhanced embed) |

Below 768 px, every block becomes a single column in sequence order.

## Components

Header (wordmark, navigation, language switch, mobile menu dialog) · Footer · Section head (rule + label + link) · Index row (works, writing) · CV list · Project meta list · Artwork figure · Lightbox · Pager (previous/next) · Buttons (solid, ghost; 48 px tall) · Form fields (48 px, visible focus) · Notice · Preview bar.

## Motion

| Interaction | Motion | Duration |
|---|---|---|
| Image enters viewport | fade + 12 px rise | 900 ms |
| Navigation hover / current page | hairline underline grows | 280 ms |
| Lightbox open / image change | fade | 240 / 220 ms |
| Mobile menu | fade | 280 ms |

Everything is disabled under `prefers-reduced-motion: reduce`. There is no scroll-jacking, no parallax and no zoom.

## Focus and touch

- Every interactive element shows a 2 px ink outline with 3 px offset (`:focus-visible`).
- Header controls and lightbox buttons are at least 44 × 44 px. Automated tests check that no header control is under 24 px tall at any width.
