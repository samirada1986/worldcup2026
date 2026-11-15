# 06 · Visual and technical QA report

All results are from a **production build** (`npm run build && npm run start`) in a real Chromium browser (Playwright), unless stated otherwise.

## 1. Measured results

### Lighthouse (final build)

| Page / profile | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | Weight |
|---|---|---|---|---|---|---|---|---|
| Home · desktop | **100** | **100** | **100** | **100** | 0.7 s | 0 ms | 0 | 443 KB |
| Home · mobile* | 92 | **100** | **100** | **100** | 3.3 s | 50 ms | 0 | 463 KB |
| Series · desktop | 99 | **100** | **100** | **100** | 0.8 s | 10 ms | 0 | 568 KB |
| Series · mobile* | 87 | **100** | **100** | **100** | 4.1 s | 60 ms | 0 | 607 KB |

\* Lighthouse's mobile profile simulates a slow phone on slow 4G with a 4× CPU slowdown. On an earlier build (before the font fix) the *observed* LCP breakdown on the home page was about 280 ms (24 ms to first byte, 49 ms discovery, 84 ms download, 124 ms render). The mobile performance number is therefore a pessimistic simulation, not a measurement of a real phone.

Before / after on the mobile home page: Performance 81 → 92, Accessibility 96 → 100, SEO 85 → 100, weight 686 KB → 463 KB.

### Responsive check: 63 page × width combinations
Pages: home, works, series, about, cv, contact in English; home, series, about in Persian. Widths: **1920, 1440, 1280, 768, 430, 390, 375**.

- **Horizontal overflow: none, in all 63.**
- **Photographs shown larger than their own pixel size: none, in all 63** (checked on every `<img>`).
- **Touch targets:** checked by measuring every link and button on home, series, about and contact at phone and tablet widths: all ≥ 40 px in both dimensions except the "CV" link (35 × 45 px, which still meets WCAG 2.2's 24 px minimum). The other pages were covered by the shared header/footer, not individually re-measured.
- Screenshots **reviewed by eye**: home and series at 1440 and 390 (English), the Persian home at 1440, and the header at 768 and 1440. The other width/page combinations were checked by the automated measurements above, not by eye.
- The 63-combination run was made just before the final hit-area tweaks to the header and About links (no layout change); the touch-target measurements above were re-run after them.

### Photograph integrity
Each of the eight photographs was re-extracted from the raw PDF layers, then verified on **all four edges** (an ivory-fringe measurement per edge, outer line vs next line in) and visually on a dark background where leftover slide background or text would stand out. Result: no slide text, rules, page numbers or background on any photograph; no content removed (checked against the raw layer after two earlier mistakes were caught: see §3).

### Administration panel (local backend, real browser)
| Check | Result |
|---|---|
| Editor starts at `/admin/` | Pass, after fixing a 404 on `config.yml` (the bare `/admin` URL relies on the same absolute config link; not separately tested) |
| Collections and every field render with correct labels; Persian marked optional | Pass |
| Edit a title through the UI → save | Pass: the file on disk changed in exactly **one** place; nothing dropped, added or reordered |
| **Drag a photograph to a new position → save** | Pass: on-screen order changed, file order changed |
| Reorder → production build → page | Pass: plates render in the new order; plate numbers and the home page's opening-photograph number follow |
| Netlify Identity / Git Gateway login | **Not tested** (requires the one-time Netlify setup) |
| Uploading a new photograph through the media library | **Not tested** here (the code path computes size and blur at build; verified with the existing files only) |

## 2. The five perspectives

**Contemporary photography curator.** *Works:* the photographs are complete, in true proportion, in a clear sequence with consistent numbering; no promotional language; the pairs are chosen for what they share. *Weak:* there are no titles, dates, locations or editions; the exhibition/publication sections are empty (and correctly hidden); there is a single series, so "Works" is an archive of one.

**Art-book designer.** *Works:* a large opening plate, pairs with a vertical offset that never reorders, singles alternating sides, an index of plates; a literary serif with a real scale. *Weak:* the pairs differ slightly in aspect ratio (one photograph is 1093 px wide, the rest 1109–1110), so adjacent edges do not align perfectly; captions are numerals only; a phone has no true "spread".

**Museum exhibition designer.** *Works:* each photograph is hung like a print, at most its own size, with generous space; a wall-label-like caption. *Weak:* nothing yet documents installation, scale or edition; the viewer is a dark lightbox, not a "room".

**Senior digital art director.** *Works:* restraint; one accent; three motion behaviours with a job each; the identity rests on plate numbers, the native-size rule and the clay hairline. *Weak (honest):* the home title page (type facing a photograph) is a well-known pattern; the identity is **quiet to the point of conservative**. With more material (video, installation views, series with text) there is room to push it further; with eight small photographs, I chose to stay out of their way.

**International portfolio reviewer.** *Works:* bilingual with a recomposed right-to-left layout; accessible (100); fast; sharing previews; structured data; a CV that prints cleanly. *Weak:* no downloadable portfolio PDF; no statement longer than her biography; no press/exhibition information to show.

## 3. Defects found during QA, and how they were corrected

| # | Defect | Found by | Fix |
|---|---|---|---|
| 1 | Photographs carried slide text, rules, page numbers and blank slabs | Looking at the live page, then pixel measurement | Re-extraction with a block-density detector and an edge-fringe pass |
| 2 | First re-crop removed 126 px from the top of a photograph | Comparing the crop with its raw layer | Replaced the density rule |
| 3 | Second pass removed 14 px of a sunlit wall (mistaken for background) | Measuring the edge rows | Background now requires >90 % ivory, plus a separate fringe rule |
| 4 | Pairs read "03 \| 02" and "06 \| 05" | Viewing the page | Offset alternates vertically only; reading order is never swapped |
| 5 | Admin could not start (`config.yml` 404) | Opening the editor | Explicit absolute config URL |
| 6 | Admin paths wrong for this repository layout | Reading the config against the repo | Prefix documented; one place to change |
| 7 | Text colours failed AA contrast (2.6 : 1 and 4.4 : 1) | Lighthouse | New tokens (5.3 : 1 and 6.1 : 1) |
| 8 | canonical / hreflang relative; SEO 85 | Lighthouse | Absolute `metadataBase` from the host's URL |
| 9 | 370 KB of fonts on every page, including Persian on English pages | Lighthouse request list | Variable fonts, one file each; Persian not preloaded on English |
| 10 | Touch targets 18–24 px | Measuring every link and button | 44 px hit areas, no visual change |
| 11 | Empty Journal in the main navigation | Viewing the page | Appears only once it has a note |
| 12 | Content I had invented (degree levels, dates, medium, interpretive lines, themes) | Re-reading against her documents | Removed; recorded in `07-open-questions.md` |
| 13 | A stale server made my first re-measurement meaningless | Noticing the canonical was unchanged | Killed the real process (`next-server`) and re-measured |
| 14 | A string-splice bug corrupted a source file | Type check | Restored from git, redone with correct ordering |
| 15 | **Unreleased content was inside the JavaScript sent to every visitor** (see audit 5b), although the pages were hidden | Searching the built files, not the source | Client components import a tiny public `identity` module only; the unreleased page lives in a non-routed folder; a post-build guard (`scripts/check-private.mjs`) now fails the build if anything unreleased could reach a visitor. **Proved by re-introducing the leak: the build stopped with exit code 1 and named the file.** |

## 4. What was **not** tested (so nobody assumes it was)

- **The deployed site and Netlify settings** (unreachable from this environment).
- **Real devices.** Only emulated viewports. **Browsers:** Chromium only; Safari and Firefox were not run.
- **Screen readers** (VoiceOver, NVDA, TalkBack). Automated accessibility checks pass; that is not the same as a manual audit.
- **The admin panel against Netlify Identity,** and **uploading a new photograph** through it.
- **Retina softness.** A photograph shown at its native CSS width is still enlarged 2× on a high-density screen; only higher-resolution originals fix that (see `07-open-questions.md`).
- **Website benchmark by observation** (hosts unreachable): see `03-benchmark.md`.
