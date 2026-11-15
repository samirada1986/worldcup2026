# COA — Backend (بک‌اند فروشگاه)

A REST backend and test server for the **COA** storefront — the Persian (RTL)
fashion-shop prototype that previously ran entirely in the browser with its data
held in `localStorage`. This package lifts that exact domain (catalogue, cart
pricing, coupons, shipping, orders, inventory) onto a real server-side API, and
serves the original storefront alongside it.

> فروشگاه COA قبلاً یک پروتوتایپ کاملاً سمت‌کلاینت بود و هیچ بک‌اندی نداشت. این
> پکیج یک API واقعی (Node.js) می‌سازد که همان کاتالوگ، کد تخفیف، ارسال و سفارش‌ها
> را سمت سرور مدیریت می‌کند و خودِ فروشگاه را هم سرو می‌کند.

## Run

No dependencies to install — it uses only the Node.js standard library.

```bash
cd coa
npm start           # → http://localhost:3000
```

| URL | What |
| --- | --- |
| `/` | The original COA storefront (served as-is) |
| `/api/docs` | Live, interactive API explorer (RTL) |
| `/api/health` | Health check |

Environment variables: `PORT` (default `3000`), `HOST` (default `0.0.0.0`),
`COA_DATA_DIR` (where `store.json` is persisted; default `coa/data`).

### Test

```bash
npm run smoke       # boots on a random port and asserts the main flows
```

## Data

On first boot the server writes `data/store.json` from the seed (ported verbatim
from the prototype — same 6 products, 3 demo customers, 6 seed orders, `COA10` /
`WELCOME` coupons, and settings). Mutations persist to that file, so test data
survives restarts. `store.json` is git-ignored. `POST /api/admin/reset` restores
the clean seed. Prices are in **Toman (IRT)**; stock is keyed per variant as
`"<colorName>|<size>"`.

## API

Base path `/api`. All responses are JSON; CORS is open (`*`) for easy testing.

### Catalogue
- `GET /api/store` — store profile + categories
- `GET /api/categories`
- `GET /api/products` — query: `cat`, `sort` (`new|price_asc|price_desc`), `all=1` (include inactive)
- `GET /api/products/:id` — detail incl. full per-variant `stock`
- `GET /api/products/:id/stock`
- `GET /api/shipping` — methods (`post`, `express`) + free-shipping threshold

### Cart & coupons
- `POST /api/cart/quote` — body `{ items:[{pid,color,size,qty}], code?, shipId? }` → priced lines + `totals` (subtotal, discount, shipping, total). Shipping is free once `subtotal − discount ≥ freeOver`.
- `POST /api/discounts/validate` — body `{ code, subtotal? }`

### Orders
- `GET /api/orders` — query: `status`, `customerId`
- `GET /api/orders/:id`
- `POST /api/orders` — body `{ customer:{name,mobile,address?}, items:[…], code?, shipId?, payMethod? }`. Validates stock (`409` on shortage), **decrements inventory**, consumes one coupon use, logs a stock movement, returns the created order (`COA-####`).
- `PATCH /api/orders/:id/status` — body `{ status, note? }`. Statuses: `placed → confirmed → preparing → handed → transit → delivered`, plus `cancelled`. Cancelling **restocks** the items.

### Inventory & admin
- `GET /api/inventory` — flattened variants with a `low` flag
- `POST /api/inventory/move` — body `{ pid, variant:"color|size", delta, why? }`
- `GET /api/inventory/moves`
- `GET /api/discounts`
- `GET /api/settings` · `PUT /api/settings`
- `POST /api/admin/reset`

## Layout

```
coa/
├── server.js        # http server + router + static serving
├── lib/
│   ├── seed.js      # seed data ported from the prototype
│   ├── db.js        # JSON-file store (load/save/reset)
│   └── logic.js     # pricing / coupon / stock logic (ported)
├── public/
│   ├── index.html   # the original storefront
│   └── api-docs.html
└── test/smoke.js
```

## Note on the frontend

The storefront (`public/index.html`) is served unchanged, so it still runs on
its own in-browser state. The backend is a faithful, standalone API ready for
the SPA to consume; wiring the storefront's reads/writes to these endpoints is
the natural next step and can be done incrementally (catalogue first, then
cart/checkout, then the admin panel).
