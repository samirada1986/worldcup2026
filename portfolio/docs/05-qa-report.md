# 5. QA report: journeys, responsive behaviour, accessibility, performance

Test date: 8 November 2026. Environment: Linux container, Node 22, PostgreSQL 16, Chromium (Playwright 1.63). The final runs used a **production build** (`npm run build && npm start`) on a freshly migrated and seeded database.

Run it yourself: `npm run test:e2e` (needs the server and database running).

## Result

**15 / 15 automated tests passed**, on both the development server and the production build. Test files: `tests/e2e/journeys.spec.ts` and `tests/e2e/responsive.spec.ts`.

| # | Journey | What is verified | Result |
|---|---|---|---|
| V1 | Curator: homepage → CONATUS → full project → CV | `/` redirects to `/en`; "View project" opens CONATUS; the lightbox opens, focus moves to Close; arrow keys step through **every** image and wrap; rendered ratio = file ratio; Esc closes and returns focus to the image; About → CV; axe on 2 pages | ✅ |
| V2 | Editor enters at an artwork page → about → contact | `/en/works/conatus/3` shows "03 / 12" and the project link; About → Contact; server validation (empty, bad email) with `aria-invalid` and messages; success state | ✅ |
| — | Contact spam and rate limit | 3 messages per hour per IP (hashed): the 4th is refused with a clear message; anonymous `GET /api/inquiries` is refused | ✅ |
| V3 | Persian long-form essay on a 375 px phone | Opens from `/fa/writing`; body ≥ 17 px, line height ≥ 1.9, Vazirmatn, `direction: rtl`; no horizontal overflow; footnote jump; mobile menu opens and closes with Esc; axe | ✅ |
| V4 | Gallery: works index → project → CV PDF | Works index → CONATUS; the CV page offers "Download CV (PDF)" and the browser receives a `.pdf` download | ✅ |
| A1 | Artist: log in → new project → 8 photos → reorder → preview → publish | Logs in via the admin UI (dashboard "Studio overview" visible); **creates the project in the admin UI** (autosave draft); uploads 8 photos with metadata; sets the sequence and then **reverses its order**; anonymous gets **404** while it is a draft; **preview** shows the 8 images in the new order; after publishing, the anonymous visitor sees all 8 and the project appears in Works (cache revalidated) | ✅ |
| A2 | Artist: English essay + Persian translation → draft → publish both | Essay with 2 footnotes, a pull quote and an inline image; the draft is invisible on the site and in the API; Persian translation added; published in both languages; EN renders LTR with footnotes 1–2; FA renders RTL with footnote "۱" | ✅ |
| A3 | Replace a photograph | `PATCH /api/media/:id` with a new file → **same ID**, title and alt preserved, new filename served on the project page, artwork permalink still 200; original restored | ✅ |
| — | Access control | No drafts through the public API; the future project draft returns 404; an editor **cannot** change site settings, create users or make themselves admin; an editor **can** edit the artist profile | ✅ |
| R | Responsive at **375, 390, 768, 1024, 1440, 1920** px × 14 pages (EN + FA) | All return 200; **no horizontal overflow**; **no distorted images** (rendered ratio vs. file ratio, tolerance 0.02); header controls ≥ 24 px | ✅ |

### What was driven through the UI and what through the API

A1 logs in and creates the project **through the admin UI**. The 8 uploads, the reordering and the publishing in A1, and all of A2 and A3, go through the **same REST API the admin UI uses**, authenticated as the admin. Drag-and-drop and the rich-text toolbar are mouse interactions on the Payload admin UI. They were not automated, because those tests would break with every Payload upgrade. The admin editing screens were inspected visually (project edit view: localised fields, tabs, Publish/Draft, preview, versions).

## Friction found and fixed during QA

| Issue | Fix |
|---|---|
| Captions sat at the column edge, not under height-limited portrait images | Figures are sized from the image's aspect ratio, so the caption aligns with the image |
| Homepage repeated the same image in the opening work and in Selected works | Selected works uses the next image of the sequence when the cover equals the opening artwork |
| Hydration warning from the JS-enabled class on `<html>` | Suppressed for that one attribute |
| A Persian essay on the English site (and vice versa) kept the other language's fonts and rules | Typography tokens are now set per `[lang]` element, not only on `<html>` |
| Persian footnote list used Latin numerals | `list-style-type: persian` |
| Essay subheadings fell back to bold body serif | Display face, regular weight |
| The mobile lightbox "Artwork page" label wrapped onto two lines | Lightbox buttons never wrap |
| Production 404s on project pages (`dynamicParams = false` cascaded from the layout) | Removed; unknown locales are still rejected |
| Dev auto-sync of the schema conflicted with production migrations | Migration-only workflow (`PAYLOAD_DB_PUSH` opt-in) |
| The template's ESLint config crashed with Next 16 | Replaced with the flat config; lint is clean |
| The mobile menu closed via `setState` in an effect (lint error) | Open state is tied to the current path |

## Accessibility review (target WCAG 2.2 AA)

Automated: axe-core (`wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`) on Home, Project, Artwork, Works, Contact and the Persian essay at mobile size. **0 serious or critical violations.**

Manual review against the main criteria:

- **1.1.1 Non-text content.** Every media item has localised alt text, used everywhere the image appears. Duplicate decorative links are `aria-hidden`. Thumbnails in index rows are `alt=""` because the row's title is the link text.
- **1.3.1 Info and relationships.** Semantic landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page, labelled sections, `dl` for metadata, `ol` for footnotes, labelled form fields with `aria-describedby` errors.
- **1.4.3 Contrast.** Body 16.3 : 1; secondary text 6.2 : 1; errors 7.1 : 1.
- **1.4.4 / 1.4.10 Resize and reflow.** Fluid type in rem. No horizontal scroll from 375 px (tested), so 320 px CSS width also reflows.
- **1.4.12 Text spacing.** No fixed heights on text containers.
- **2.1.1 Keyboard.** Everything is reachable. The lightbox supports ←/→ (mirrored in RTL), Home/End, Esc and focus trapping. The mobile menu traps focus and closes on Esc. A skip link goes to main content.
- **2.4.3 Focus order / 2.4.7 Focus visible.** Focus returns to the opening image after the lightbox closes. A visible 2 px outline on every control.
- **2.4.11 Focus not obscured (2.2).** There is no sticky header, so focus is never hidden under fixed UI.
- **2.5.5 / 2.5.8 Target size (2.2).** Header and lightbox controls are ≥ 44 px; form fields and buttons 48 px.
- **2.3.3 Animation.** All motion respects `prefers-reduced-motion`.
- **3.1.1 / 3.1.2 Language.** `lang` and `dir` on `<html>`. Mixed-language content (a Persian title in an English list) carries its own `lang` and `dir`.
- **3.3.1 / 3.3.3 Errors.** Server-side validation with specific, localised messages. The status region receives focus.
- **4.1.2 Name, role, value.** Lightbox and mobile menu are `role=dialog` with `aria-modal` and labels. The language switch has `hreflang` and `lang`.

Not done: testing with a physical screen reader (VoiceOver/NVDA/TalkBack) and in Safari or Firefox. Recommended before launch.

## Performance (production build, Chromium)

| Page | Viewport | LCP | CLS | JS transferred | Total |
|---|---|---|---|---|---|
| Home | 1440 | 0.57 s | 0.000 | 142 KB | 332 KB |
| Home | 390 | 0.53 s | 0.000 | 142 KB | 314 KB |
| CONATUS (12 images) | 390 | 1.81 s | 0.021 | 144 KB | 298 KB |

Measured with network throttling (150 ms latency, ~16 Mbit/s) on localhost and the placeholder images. Real photographs are larger: expect higher transfer, mitigated by WebP derivatives and lazy loading. Re-measure with Lighthouse or PageSpeed after launch.

## Not verified in this environment

- **Docker image build** (no Docker daemon available). The Dockerfile follows the tested `BUILD_WITHOUT_DB=1` build path, but the image itself was not built.
- **S3 storage and SMTP email** (no credentials). Both are configuration-only paths of official Payload adapters.
- **Real devices.** Mobile was emulated in Chromium (viewport, touch, DPR 2).

## Screenshots

`docs/screenshots/` (2×): home EN/FA, project, spread, lightbox desktop/mobile, works index, essay EN/FA mobile, mobile menu (FA), contact, artwork page. Essay screenshots use a temporary, clearly labelled QA text that was deleted afterwards.
