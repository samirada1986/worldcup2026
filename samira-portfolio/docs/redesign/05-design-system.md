# 05 · Design system

Tokens live in `tailwind.config.ts` and `src/app/globals.css`. Nothing on the site is set outside this system.

## Typography

| Role | Family | Why |
|---|---|---|
| Display, ledes, long reading | **Newsreader** (variable, optical size) | A literary, editorial serif with real optical sizes; calmer than a "soft" display serif |
| Interface, captions, metadata | **Inter** (variable) | Neutral; stays out of the way of the photographs |
| Persian | **Vazirmatn** (variable) | Even colour in text; full weight range; loaded only on Persian pages |

Variable fonts: one file per family. Persian is not preloaded on English pages.

**Scale** (≈ 1.25, fluid at the top):

| Token | Size | Use |
|---|---|---|
| `caption` | 12 px | Plate numbers, smallest metadata |
| `meta` | 13 px | Captions, labels, footer fine print |
| `ui` | 15 px | Navigation, buttons, links |
| `body` | 17 px | Reading text (serif), 1.72 line height (2.1 in Persian) |
| `lede` | 19 → 22 px | Introductions |
| `display-md` | 28 → 40 px | Section / project headings |
| `display-lg` | 34 → 52 px | Page titles |
| `display-xl` | 40 → 64 px | The artist's name, home page only |

Eyebrows are 12 px, tracked uppercase in Latin; in Persian they are not uppercase and use far less tracking (tracking breaks Arabic-script joining).

## Colour (derived from the work and the artist's printed portfolio)

| Token | Value | Contrast on paper | Use |
|---|---|---|---|
| `paper` | rgb(247 244 236) | n/a | Ground: warm off-white, like uncoated paper |
| `ink` | rgb(26 23 20) | 16.2 : 1 | Headings, key text |
| `ink-soft` | rgb(44 38 33) | 13.6 : 1 | Body text |
| `stone` | rgb(98 91 82) | 6.1 : 1 | Secondary text |
| `stone-light` | rgb(108 100 91) | 5.3 : 1 | Metadata (still AA at 12 px) |
| `line` | rgb(214 207 194) | decorative | Hairlines |
| `clay` | rgb(150 97 68) | 4.7 : 1 | One hairline accent, taken from her printed portfolio |
| `charcoal` | rgb(22 19 15) | n/a | The photograph viewer ground |

No bright accents; the photographs bring the colour (blue sky, red rock, a red coat) and must not be competed with.

## Layout rules

1. **Native-size rule.** A photograph's maximum display width is its own pixel width. Layouts may shrink an image, never enlarge it. (`Figure` sets `max-width: <native px>`; `next.config.ts` caps generated variants.)
2. **Never crop.** Images keep their aspect ratio everywhere, including the viewer.
3. **Reading order is sacred.** Pairs may offset vertically, never swap sides. (A bug of exactly this kind was found and fixed.)
4. **Plate numbers, not titles.** `01`–`08` in tabular figures (Persian digits in Persian). Captions appear only if the artist wrote them.
5. **A phone stays a sequence.** On small screens a pair does not stack identically: the second plate steps in from the reading edge.
6. **Grid:** 12 columns, max width 96 rem, 24 px (mobile) / 40 px side gutters; asymmetric spans (5/7, 7/4 with offset) on large screens.

## Components

`Header` · `Footer` · `LocaleSwitcher` · `Reveal` (text) · **`Figure`** (one photograph: unveil, viewer, caption) · **`Sequence`** (composes plates; three modes) · **`IndexStrip`** (index of plates, also navigation) · `LightboxProvider` (viewer) · `ContactForm` · `PrintButton` · page `template` (fade).

### The viewer
Dark ground, counter, close, previous/next; **Esc**, **←/→** (reversed in Persian), swipe on touch; focus is trapped while open and **returns to the photograph you came from**; the next photograph is pre-loaded; never larger than native size.

## Motion system

Three behaviours, each with a job, all CSS-driven with one tiny `IntersectionObserver` (no animation library):

| Behaviour | Where | What | Timing |
|---|---|---|---|
| **Unveil** | Photographs below the fold | A mask lifts from the bottom while the image settles from 1.035× | 1.25 s mask, 1.8 s settle, once |
| **Text fade** | Prose | Opacity only | 0.8 s, once |
| **Page fade** | Route change | Opacity only | 0.5 s |

Rules: nothing is hidden without JavaScript; anything already on screen at load is left alone (the opening photograph is never delayed); each element animates **once**; no parallax, no scroll-jacking, no zoom; **`prefers-reduced-motion` switches every one of them off**.

## Right-to-left (Persian)

Layout is *recomposed*, not mirrored by a flag: the photograph moves to the facing page, the caption number sits at the reading start, arrows flip, the viewer's keyboard direction flips, the line height grows, numerals localise, and uppercase/tracking are dropped. Persian is optional per field in the admin panel; missing translations fall back to English instead of rendering blank.

## Accessibility rules

Semantic landmarks and a skip link; every photograph has descriptive alt text (what is visible, never an invented title); focus is always visible; touch targets ≥ 44 px; contrast ≥ 4.5 : 1 for all text; canonical and hreflang are absolute URLs.

## Content model (admin-editable)

`projects/*.json`: `slug · published (draft) · featured · order · layout · status · title · kicker · year · medium · cover · intro · images[ src · placement hint · alt · caption · note ] · seo`.
Image width/height and blur placeholders are read from the files at build time, so uploading a photograph needs no manual measurements.
