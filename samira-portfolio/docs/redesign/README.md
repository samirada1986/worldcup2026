# Redesign documentation

A single line of orientation: **the site is now a quiet gallery built like a book**: a complete, uncropped, never-enlarged photograph on a calm ground, an authored sequence of plates, and an admin panel that lets the artist control order, cover, layout, draft/publish and SEO herself.

## Deliverables

| # | Deliverable | Status | Where |
|---|---|---|---|
| 1 | Existing website audit | **Partial**: the live URL could not be opened from this environment; the identical commit was audited locally in a real browser | [01-audit.md](01-audit.md) |
| 2 | Artistic practice assessment | Done (from the published work and her own words) | [02-practice.md](02-practice.md) |
| 3 | International benchmark | **Partial**: artists' work covered; **website design not observed** (hosts unreachable); provisional shortlist, clearly labelled | [03-benchmark.md](03-benchmark.md) |
| 4 | Three creative directions | Done | [04-directions.md](04-directions.md) |
| 5 | Selected design concept | Done: "a quiet gallery, built like a book" | [04-directions.md](04-directions.md) |
| 6 | Typography and design system | Done | [05-design-system.md](05-design-system.md) |
| 7 | Redesigned homepage | Done | `src/app/[locale]/page.tsx` · `screens/after-home-*` |
| 8 | Redesigned Works archive | Done (a catalogue list; one series is published) | `src/app/[locale]/works/page.tsx` · `screens/after-works-desktop.jpg` |
| 9 | Redesigned project pages | Done: three layout modes; one dynamic route for every project | `src/app/[locale]/works/[slug]/page.tsx`, `src/components/Sequence.tsx` |
| 10 | Improved administration panel | Done and **tested in a real browser** against the local backend; **not** tested against Netlify Identity (needs the one-time setup in the README) | `public/admin/config.yml` |
| 11 | Responsive implementation | Done; measured at 1920 / 1440 / 1280 / 768 / 430 / 390 / 375 | [06-qa-report.md](06-qa-report.md) |
| 12 | Motion design system | Done | [05-design-system.md](05-design-system.md) |
| 13 | Before-and-after screenshots | Done | [`screens/`](screens/) |
| 14 | Visual QA report | Done | [06-qa-report.md](06-qa-report.md) |
| 15 | Final working website | Done: production build passes | repository |

Open items and everything I could not do or know: [07-open-questions.md](07-open-questions.md).
