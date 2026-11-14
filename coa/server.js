'use strict';
/*
 * COA store — backend test server.
 * Zero external dependencies: Node's built-in http + a tiny router.
 * Serves the original standalone storefront at "/" and a JSON REST API
 * under "/api/*" that implements the same domain the prototype simulated
 * client-side (catalogue, cart pricing, coupons, shipping, orders, inventory).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const db = require('./lib/db');
const L = require('./lib/logic');
const { STATUSES, stIdx, stName } = require('./lib/seed');

const PORT = process.env.PORT !== undefined ? parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');

/* ------------------------------ http helpers ------------------------------ */

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.map': 'application/json',
  '.webp': 'image/webp', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.txt', '.xml', '.webmanifest']);

function send(res, status, body, headers) {
  const h = Object.assign(
    { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' },
    headers || {}
  );
  res.writeHead(status, h);
  res.end(body);
}
function json(res, status, obj) {
  send(res, status, JSON.stringify(obj, null, 2), { 'Content-Type': MIME['.json'] });
}
function ok(res, obj) { json(res, 200, obj); }
function created(res, obj) { json(res, 201, obj); }
function bad(res, msg, extra) { json(res, 400, Object.assign({ error: msg }, extra || {})); }
function notFound(res, msg) { json(res, 404, { error: msg || 'یافت نشد' }); }

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > 1e6) { reject(new Error('payload too large')); req.destroy(); return; }
      data += c;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

/* --------------------------- public projections --------------------------- */
// Hide internal admin-only fields from the public catalogue, and surface a
// simple total-stock count per product.
function totalStock(p) {
  return Object.keys(p.stock || {}).reduce((t, k) => t + (p.stock[k] || 0), 0);
}
function publicProduct(p) {
  return {
    id: p.id, name: p.name, cat: p.cat, price: p.price, currency: 'IRT',
    fabric: p.fabric, sku: p.sku, imgs: p.imgs, colors: p.colors, cimg: p.cimg || null,
    sizes: p.sizes, desc: p.desc, care: p.care, fit: p.fit,
    isNew: !!p.isNew, inStock: totalStock(p) > 0, totalStock: totalStock(p),
    seoT: p.seoT, seoD: p.seoD,
  };
}

/* -------------------------------- routes --------------------------------- */
// Each entry: [method, /regex path/, handler(req,res,match,body)]
const routes = [];
function route(method, pattern, handler) { routes.push([method, pattern, handler]); }

// Health & meta
route('GET', /^\/api\/?$/, (req, res) => ok(res, { name: 'COA API', version: 1, status: 'ok', docs: '/api/docs' }));
route('GET', /^\/api\/health$/, (req, res) => ok(res, { status: 'ok', time: new Date().toISOString() }));

// Public store profile
route('GET', /^\/api\/store$/, (req, res) => {
  const s = db.get().settings;
  ok(res, {
    store: s.store, insta: s.insta, currency: 'IRT',
    shipCost: s.shipCost, freeOver: s.freeOver,
    categories: db.get().categories,
  });
});

// Categories
route('GET', /^\/api\/categories$/, (req, res) => ok(res, { categories: db.get().categories }));

// Products list (?cat=, ?sort=new|price_asc|price_desc, ?all=1 for inactive too)
route('GET', /^\/api\/products$/, (req, res, m, body, query) => {
  const st = db.get();
  let list = st.products.slice();
  if (query.all !== '1') list = list.filter((p) => p.active);
  if (query.cat) list = list.filter((p) => p.cat === query.cat);
  if (query.sort === 'price_asc') list.sort((a, b) => a.price - b.price);
  else if (query.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
  else if (query.sort === 'new') list.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  ok(res, { count: list.length, products: list.map(publicProduct) });
});

// Single product
route('GET', /^\/api\/products\/([^/]+)$/, (req, res, m) => {
  const p = L.productById(db.get(), decodeURIComponent(m[1]));
  if (!p) return notFound(res, 'محصول یافت نشد');
  const pub = publicProduct(p);
  pub.stock = p.stock; // full per-variant breakdown on the detail endpoint
  ok(res, pub);
});

// Per-variant stock for a product
route('GET', /^\/api\/products\/([^/]+)\/stock$/, (req, res, m) => {
  const p = L.productById(db.get(), decodeURIComponent(m[1]));
  if (!p) return notFound(res, 'محصول یافت نشد');
  ok(res, { pid: p.id, totalStock: totalStock(p), low: db.get().settings.low, stock: p.stock });
});

// Shipping methods
route('GET', /^\/api\/shipping$/, (req, res) => ok(res, { methods: L.shipMethods(db.get().settings), freeOver: db.get().settings.freeOver }));

// Cart quote: body { items:[{pid,color,size,qty}], code, shipId }
route('POST', /^\/api\/cart\/quote$/, (req, res, m, body) => {
  const st = db.get();
  const { lines, errors } = L.resolveLines(st, body.items);
  const t = L.totals(st, lines, body.code, body.shipId);
  ok(res, { lines, totals: t, issues: errors });
});

// Validate a discount code: body { code, subtotal? }
route('POST', /^\/api\/discounts\/validate$/, (req, res, m, body) => {
  const st = db.get();
  const d = L.findCode(st, body.code);
  const err = L.codeError(d);
  const sub = Number(body.subtotal) || 0;
  ok(res, {
    valid: !err,
    error: err || '',
    code: d ? d.code : null,
    pct: d ? d.pct : 0,
    discount: !err ? Math.round((sub * d.pct) / 100) : 0,
  });
});

// Customers (demo data)
route('GET', /^\/api\/customers$/, (req, res) => ok(res, { customers: db.get().customers }));

/* ------------------------------- orders ---------------------------------- */

route('GET', /^\/api\/orders$/, (req, res, m, body, query) => {
  let list = db.get().orders.slice().sort((a, b) => b.ts - a.ts);
  if (query.status) list = list.filter((o) => o.status === query.status);
  if (query.customerId) list = list.filter((o) => o.customerId === query.customerId);
  ok(res, { count: list.length, orders: list });
});

route('GET', /^\/api\/orders\/([^/]+)$/, (req, res, m) => {
  const o = db.get().orders.filter((x) => x.id === decodeURIComponent(m[1]))[0];
  if (!o) return notFound(res, 'سفارش یافت نشد');
  ok(res, o);
});

// Create an order: validates stock, decrements it, applies coupon, records it.
// body { customer:{name,mobile,address?}, customerId?, items:[...], code?, shipId?, payMethod? }
route('POST', /^\/api\/orders$/, async (req, res, m, body) => {
  const st = db.get();
  const items = body.items || [];
  if (!items.length) return bad(res, 'سبد خرید خالی است');
  const cust = body.customer || {};
  if (!cust.name || !cust.mobile) return bad(res, 'نام و شماره موبایل مشتری لازم است');

  const { lines, errors } = L.resolveLines(st, items);
  if (errors.length) return bad(res, 'برخی اقلام نامعتبرند', { issues: errors });

  const short = lines.filter((l) => !l.inStock);
  if (short.length) {
    return json(res, 409, {
      error: 'موجودی کافی نیست',
      issues: short.map((l) => ({ pid: l.pid, color: l.color, size: l.size, requested: l.qty, available: l.stock })),
    });
  }

  // Coupon: re-validate and consume one use.
  let discount = 0;
  let codeUsed = '';
  if (body.code) {
    const d = L.findCode(st, body.code);
    const err = L.codeError(d);
    if (err) return bad(res, err, { field: 'code' });
    const sub = lines.reduce((t, x) => t + x.sum, 0);
    discount = Math.round((sub * d.pct) / 100);
    codeUsed = d.code;
    d.used += 1;
  }

  const t = L.totals(st, lines, body.code, body.shipId);
  const now = Date.now();
  const id = 'COA-' + st.seq;
  st.seq += 1;

  // Decrement stock + log an inventory movement per line.
  lines.forEach((l) => {
    const p = L.productById(st, l.pid);
    const key = L.variantKey(l.color, l.size);
    p.stock[key] = (p.stock[key] || 0) - l.qty;
    st.moves.unshift({ ts: now, pid: p.id, v: key, d: -l.qty, why: 'سفارش ' + id });
  });

  const order = {
    id, ts: now, customerId: body.customerId || null,
    name: cust.name, mobile: cust.mobile,
    address: cust.address || null,
    items: lines.map((l) => ({ pid: l.pid, name: l.name, color: l.color, size: l.size, qty: l.qty, price: l.price, img: l.img })),
    subtotal: t.subtotal, discount, code: codeUsed, shipping: t.shipping, total: t.total,
    shipMethod: t.shipMethod, payMethod: body.payMethod || 'درگاه پرداخت (نمایشی)',
    paid: true, status: 'placed',
    history: [{ s: 'placed', ts: now }], notes: [],
  };
  st.orders.push(order);
  db.save();
  created(res, order);
});

// Update order status: body { status, note? }. 'cancelled' restocks the items.
route('PATCH', /^\/api\/orders\/([^/]+)\/status$/, (req, res, m, body) => {
  const st = db.get();
  const o = st.orders.filter((x) => x.id === decodeURIComponent(m[1]))[0];
  if (!o) return notFound(res, 'سفارش یافت نشد');
  const next = body.status;
  const valid = STATUSES.map((s) => s[0]).concat('cancelled');
  if (valid.indexOf(next) < 0) return bad(res, 'وضعیت نامعتبر است', { allowed: valid });
  if (o.status === next) return ok(res, o);

  if (next === 'cancelled' && o.status !== 'cancelled') {
    // return items to stock
    const now = Date.now();
    o.items.forEach((it) => {
      const p = L.productById(st, it.pid);
      if (!p) return;
      const key = L.variantKey(it.color, it.size);
      p.stock[key] = (p.stock[key] || 0) + it.qty;
      st.moves.unshift({ ts: now, pid: p.id, v: key, d: it.qty, why: 'لغو سفارش ' + o.id });
    });
  }
  o.status = next;
  o.history.push({ s: next, ts: Date.now() });
  if (body.note) o.notes.push({ ts: Date.now(), text: String(body.note) });
  db.save();
  ok(res, o);
});

/* ----------------------------- inventory --------------------------------- */

// Flattened inventory with a "low" flag per variant.
route('GET', /^\/api\/inventory$/, (req, res) => {
  const st = db.get();
  const low = st.settings.low;
  const rows = [];
  st.products.forEach((p) => {
    Object.keys(p.stock || {}).forEach((k) => {
      const parts = k.split('|');
      rows.push({ pid: p.id, product: p.name, color: parts[0], size: parts[1], qty: p.stock[k], low: p.stock[k] <= low });
    });
  });
  ok(res, { threshold: low, count: rows.length, items: rows });
});

// Record a stock movement: body { pid, variant 'color|size', delta, why? }
route('POST', /^\/api\/inventory\/move$/, (req, res, m, body) => {
  const st = db.get();
  const p = L.productById(st, body.pid);
  if (!p) return notFound(res, 'محصول یافت نشد');
  const key = body.variant;
  if (!key || !(key in p.stock)) return bad(res, 'تنوع نامعتبر است', { variants: Object.keys(p.stock) });
  const delta = parseInt(L.en(body.delta), 10);
  if (!delta) return bad(res, 'مقدار تغییر باید عددی غیر صفر باشد');
  const next = (p.stock[key] || 0) + delta;
  if (next < 0) return bad(res, 'موجودی نمی‌تواند منفی شود', { current: p.stock[key] });
  p.stock[key] = next;
  const move = { ts: Date.now(), pid: p.id, v: key, d: delta, why: body.why || 'تعدیل دستی' };
  st.moves.unshift(move);
  db.save();
  ok(res, { move, qty: next });
});

route('GET', /^\/api\/inventory\/moves$/, (req, res) => ok(res, { moves: db.get().moves }));

/* ------------------------------- discounts ------------------------------- */
route('GET', /^\/api\/discounts$/, (req, res) => ok(res, { discounts: db.get().discounts }));

/* ------------------------------- settings -------------------------------- */
route('GET', /^\/api\/settings$/, (req, res) => ok(res, db.get().settings));
route('PUT', /^\/api\/settings$/, (req, res, m, body) => {
  const st = db.get();
  const allowed = ['store', 'insta', 'shipCost', 'freeOver', 'low', 'notifyOrder', 'notifyLow'];
  allowed.forEach((k) => { if (k in body) st.settings[k] = body[k]; });
  db.save();
  ok(res, st.settings);
});

/* --------------------------- admin: reset data --------------------------- */
route('POST', /^\/api\/admin\/reset$/, (req, res) => { db.reset(); ok(res, { status: 'reseeded' }); });

/* ------------------------------ static files ----------------------------- */
function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  // prevent path traversal
  const safe = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!safe.startsWith(PUBLIC_DIR)) return notFound(res, 'not found');
  fs.stat(safe, (err, stat) => {
    if (err || !stat.isFile()) {
      if (rel === '/api-docs.html') return; // handled by route
      return notFound(res, 'not found');
    }
    const ext = path.extname(safe).toLowerCase();
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
    // Fingerprint-free assets: cache for a week and revalidate; HTML always revalidates.
    headers['Cache-Control'] = rel.startsWith('/assets/') ? 'public, max-age=604800' : 'no-cache';
    headers['Vary'] = 'Accept-Encoding';
    const gz = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    if (gz) headers['Content-Encoding'] = 'gzip';
    res.writeHead(200, headers);
    const rs = fs.createReadStream(safe);
    if (gz) rs.pipe(require('zlib').createGzip()).pipe(res); else rs.pipe(res);
  });
}

/* -------------------------------- server --------------------------------- */
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const pathname = u.pathname;
  const query = Object.fromEntries(u.searchParams.entries());

  if (req.method === 'OPTIONS') {
    return send(res, 204, '', {
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
  }

  // API docs page (served from /api/docs)
  if (pathname === '/api/docs' && req.method === 'GET') {
    const f = path.join(PUBLIC_DIR, 'api-docs.html');
    if (fs.existsSync(f)) {
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      return fs.createReadStream(f).pipe(res);
    }
  }

  if (pathname.startsWith('/api/') || pathname === '/api') {
    // dispatch to a matching route
    let body = {};
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      try { body = await readBody(req); } catch (e) { return bad(res, e.message); }
    }
    for (const [method, pattern, handler] of routes) {
      if (method !== req.method) continue;
      const mt = pathname.match(pattern);
      if (mt) {
        try { return await handler(req, res, mt, body, query); }
        catch (e) { console.error('[api] handler error:', e); return json(res, 500, { error: 'خطای داخلی سرور', detail: e.message }); }
      }
    }
    return notFound(res, 'این مسیر API وجود ندارد');
  }

  // everything else -> static storefront
  serveStatic(req, res, pathname);
});

server.listen(PORT, HOST, () => {
  db.get(); // ensure seeded
  console.log(`COA backend listening on http://${HOST}:${PORT}`);
  console.log(`  storefront : http://localhost:${PORT}/`);
  console.log(`  API docs   : http://localhost:${PORT}/api/docs`);
  console.log(`  data file  : ${db.DATA_FILE}`);
});

module.exports = server;
