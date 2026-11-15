# COA — Footer redesign, nav cleanup & production-readiness (2026-11-15)

Access note: the preview host (`netlify.app`) is blocked from this environment,
so the live commit was run locally and driven with Playwright. Before/after:
`docs/screens/footer-before.jpg`, `footer-after.jpg`, `footer-mobile-after.jpg`.

## 1 — Dev/admin tools removed from the public footer (done)
The footer exposed a "پروتوتایپ" column with `#/admin` (پنل مدیریت),
`#/design-system` (سیستم طراحی) and a `data-act="reset"` **destructive demo-data
button** — all public. Removed that column entirely.
- The admin (`#/admin`) and design-system (`#/design-system`) routes still work
  by direct URL for the owner; they are simply no longer linked from the public
  UI.
- The **reset-demo-data** action was moved into the admin dashboard
  (`#/admin`), so a regular visitor can no longer trigger it. Verified by DOM:
  `.ft [data-act=reset]` is gone, `.adm [data-act=reset]` is present.

Honest limitation: this is a static single-page demo with no server session, so
admin is **unlinked, not authenticated**. Real authorization needs the backend
(`server.js`) with a login/session; recorded as a follow-up. I did not fake
server-side auth.

## 2 — Demo vs production messaging (reflects real capability)
The store genuinely has no live checkout: checkout already labels payment
«درگاه پرداخت (نمایشی)» / «پرداخت آنلاین (نمایشی)», and orders are demo. The
footer now carries a concise, always-visible notice:
«نسخهٔ نمایشی COA — ثبت سفارش و پرداخت واقعی در این نسخه فعال نیست.»
No warning was removed; messaging matches actual system state. True
dev/staging/prod separation belongs to the backend deployment (env flags) and is
left for when real payment/order systems are connected — not faked here.

## 3–4 — Footer redesign
Replaced the ragged 5-column grid (brand span-6 + four span-2 columns, the 5th
wrapping to a near-empty second row) with a balanced editorial layout:
- **Brand** (logo, verified one-line description, Instagram + Telegram as
  underlined links).
- **فروشگاه** (همه محصولات، تازه‌ها، the real categories).
- **پشتیبانی** (راهنمای سایز، ارسال و مرجوعی، پرسش‌های پرتکرار، تماس با ما).
- **COA** (درباره ما، ژورنال، مجموعه فصل).
- **Bottom bar**: «© ۱٬۴۰۴ COA» + the demo notice, on a hairline rule.
All links point to real, implemented pages. Orange is used selectively — a 2px
top rule on the footer and a short underline accent under each heading — on
ivory/navy/sage. Flex layout with controlled gaps; vertical rhythm tightened
(top margin 96→80px, padding reduced).

## 5 — Whitespace above the footer
Root cause of the footer's own ragged empty area was the wrapping 5th column
(above), now gone. The gap between the last section and the footer is a normal
80px margin (measured), not a defect; no negative margins used.

## 6 — "Powered by Netlify" badge
Not present in our code or `netlify.toml`. It is injected by Netlify's
**deploy-preview** environment (the `deploy-preview-3--…` URL), not by the
application, and does not appear on the production domain. Nothing to disable in
our code; no mandatory disclosure was hidden.

## 8 — Mobile footer
Intentional mobile layout (not stacked desktop columns): brand first full-width,
social as a row, link groups in a **2-column** grid, bottom bar stacked. Touch
targets ≥ the existing 44px link padding; no horizontal overflow at 390/375.

## 9 — Motion preserved
No hero/editorial/microinteraction code was touched; the footer uses the
existing reveal system. e2e, a11y, journal-cards and smoke all still pass.

## Verification (Playwright, local)
1440 / 768 / 390 / 375: no horizontal overflow; admin reachable directly; reset
only in admin; no dev links in footer. `test/ui/e2e.js` (desktop+mobile),
`test/ui/a11y.js` (**0 axe violations**), `test/ui/journal-cards.js` (20),
API smoke (16/16) — all pass.

## Files modified
- `coa/public/index.html` — footer markup, `.ft*` CSS, reset moved to admin.

## Follow-ups
- Real admin authentication (needs the backend session).
- The contact page content is sparse (lots of whitespace above the footer there);
  worth enriching — tracked, not a footer issue.
