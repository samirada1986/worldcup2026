# COA — Customer account redesign & global consistency (2026-11-15)

Evidence: `docs/screens/acct-before-*.jpg` and `acct-after-*.jpg` (1440 / 1280 / 768 /
430 / 390 / 375), `global-*.jpg` for the other pages. The preview host
(`netlify.app`) is blocked from this environment, so everything below was run
and measured locally with Playwright against the same commit. **Production
behaviour on Netlify was not observed.**

## 1. Confirmed problems and root causes

| ID | Problem | Root cause | Fix |
|---|---|---|---|
| ACC-01 (P0) | Every visitor lands on a fabricated customer «مشتری نمایشی»; no login, logout or guard exists | `S.me='c1'` hard-coded in `seed()`; `vAccount()` always rendered it; no auth route anywhere | Session model: `S.me` is `null` until login. `guardRoute()` redirects `#/account/*` to `#/login?next=…`; `login`/`logout` actions; header icon reflects state |
| ACC-02 (P0) | Checkout pre-filled **guests** with the demo customer's name, phone and address | `ui.co` seeded from `S.addresses[0]` regardless of login | Prefill only when `S.me` is set; guest-only checkbox shown only to signed-in customers, otherwise a one-line explanation |
| ACC-03 (P0) | Demo identities exist in production | Seed always contained customers, orders, addresses | `ENV` / `DEMO_MODE` (`<meta name="coa-env">` or `window.COA_ENV`): outside demo the seed has **no** customers, orders, addresses or wishlist, and login says accounts are not available yet |
| ACC-04 (P1) | "آخرین سفارش" showed the *oldest* order (COA-1002 instead of COA-1006) | Orders stored oldest-first; the view used `O[0]` | `myOrders()` sorts newest first |
| ACC-05 (P1) | Every non-delivered status was the same amber, so «تأیید سفارش» and «در مسیر ارسال» looked identical, and colour was the only cue | `stBadge` mapped everything except delivered/cancelled to `warn` | `stTone()`: pending amber, in progress neutral, delivered green, cancelled red; every badge has a dot so it is not colour-only |
| ACC-06 (P1) | Oversized 42px greeting with the demo name, a flat 3-block KPI row, a lone "last order" panel, divider-only sidebar | Generic dashboard markup with inline styles | Compact header («حساب کاربری من» + the supporting sentence), greeting as a secondary chip, three small linked cards, structured order cards, tinted sidebar with orange edge |
| ACC-07 (P1) | Order timeline: a narrow vertical list in a 900px box, most of it empty | One vertical layout at every width | Horizontal stepper ≥640px, vertical list on phones (CSS only, same markup) |
| ACC-08 (P1) | Order id, date and amount mixed directions in one row | Inline concatenation | `<bdi class="ltr">` for ids, `<time datetime>` for dates, labelled fields, Persian digits for all counts |
| GLB-01 (P2) | 12 customer pages hand-rolled their own `h1`: 42px, ad-hoc inline margins | No shared component | `pgHead()` + `.pg-head`; cart, checkout, journal, contact, FAQ, size guide, static pages, order tracking and account all use it (32px / 25px on phones) |
| GLB-02 (P2) | `.panel`, `.sum`, `.opt`, `.empty` each had different padding, border and background; empty states were bare dashed boxes | Per-component values | Shared tokens (`--card-bg`, `--card-bd`, `--card-pad`, `--tint-*`) and `.surf`; one `emptyState()` component |
| GLB-03 (P3) | Journal excerpt rendered «…کنید.…» | Flattened paragraphs before truncating | `excerpt()` uses the first paragraph and strips trailing punctuation |
| GLB-04 (P3) | Footer bottom-bar spacing silently collapsed | My earlier CSS used `--s5`, which did not exist | Token defined (`--s5: 20px`) |
| GLB-05 (P3) | Filter chip counts were grey on navy | `.muted` overrode the chip colour | `.chip .muted{color:inherit}` |

Found while testing my own changes (and fixed): an obsolete `.empty p` margin was
stacking on the new flex `gap`; my first mobile page-title size was 20px — wrong,
now the 25px scale step.

## 2. What was built

- **Header** — compact title + supporting text; the greeting carries the demo
  label only in demo mode.
- **Layout** — 12-col grid: sidebar (right, RTL) + content; on ≤1023px the
  sidebar becomes scrollable pill tabs and the active tab scrolls into view.
- **Navigation** — نمای کلی / سفارش‌ها / علاقه‌مندی‌ها / نشانی‌ها / تنظیمات +
  logout, icons, `aria-current`, keyboard focusable, tinted active state with an
  orange logical-start edge, one separator (before logout) instead of five.
- **Summary cards** — کل سفارش‌ها, سفارش‌های در جریان, علاقه‌مندی‌ها: real
  counts, Persian digits, each links to its section.
- **Order cards** — id, date, status, thumbnails (+N), item count, total, details;
  «رهگیری سفارش» only for in-progress orders (tracking exists at `#/track/:id`).
  Status filter chips with counts; empty and empty-filter states.
- **Order detail, wishlist, addresses, settings** restyled on the same components.
- **Login page** — demo login labelled as demo; production variant offers none.

## 3. Demo vs production (honest scope)

`DEMO_MODE` only controls whether demo **identities** exist. The catalogue,
prices and orders are still demo data and the demo notices stay. This is a
static front-end with no server session: the "session" is `S.me` in
`localStorage`, so the guard protects the **UI**, not data. Real authorization
(and protecting `#/admin`, which is only unlinked, not authenticated) needs the
backend (`server.js`) with sessions. Not faked here.

## 4. Verification

| Check | Result |
|---|---|
| `test/ui/account.js` (new) | **71 checks pass**: guest redirects (5 routes), login returns to requested page, overview/orders/filter/detail/wishlist add-remove/addresses add-remove/settings edit/logout, post-logout redirect, guest checkout not prefilled, production env (no demo login, empty seed, storefront + admin render on empty data), overflow + touch-target (≥40px) + min-font checks at 430/390/375/768 |
| `test/ui/a11y.js` (extended to login, contact, checkout, 6 account pages, tracking) | **0 axe violations**, 20 routes × 2 viewports |
| `test/ui/e2e.js` purchase journey | pass (desktop + mobile) |
| `test/ui/journal-cards.js` | 20 pass |
| `npm run smoke` (API) | 16/16 |
| Page-title probe (cart/checkout/journal/contact/FAQ/track/about) | all 32px / 500 desktop, 25px phones, 0 overflow |

## 5. Not done / limitations

- **Skeleton loading**: account data is local and synchronous, so there is no
  real async content to skeleton; none was invented.
- Server-side authentication/authorization (above).
- `.line` (order/cart line items) and the admin tables still use their older
  styles; they were not part of the visible problems.
- Persian copy was written in the informal «تو/حسابت» register the brief used;
  worth a brand-voice review.

## 6. Files

- `coa/public/index.html` — tokens, shared components, session/guard, account views, CSS.
- `coa/test/ui/account.js` (new), `coa/test/ui/a11y.js` (extended).
- `coa/docs/account-redesign-2026-11-15.md`, `coa/docs/screens/acct-*.jpg`, `global-*.jpg`.
