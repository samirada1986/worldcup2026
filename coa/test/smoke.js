'use strict';
/*
 * Dependency-free smoke test. Boots the server on a random port, exercises the
 * main API flows and asserts the results. Run: npm run smoke
 */
const assert = require('assert');
const http = require('http');

process.env.COA_DATA_DIR = require('path').join(require('os').tmpdir(), 'coa-smoke-' + Date.now());
process.env.PORT = '0';
const server = require('../server');

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = http.request(
      { host: '127.0.0.1', port: server.address().port, path, method,
        headers: { 'Content-Type': 'application/json' } },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          const ct = res.headers['content-type'] || '';
          const parsed = buf && ct.indexOf('json') >= 0 ? JSON.parse(buf) : buf;
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
  await new Promise((r) => (server.listening ? r() : server.once('listening', r)));
  let n = 0;
  const check = (name, cond) => { assert.ok(cond, 'FAIL: ' + name); n++; console.log('  ✓ ' + name); };

  let r = await req('GET', '/api/health');
  check('health ok', r.status === 200 && r.body.status === 'ok');

  r = await req('GET', '/api/products');
  check('6 active products', r.body.count === 6);
  check('products carry price+stock flag', r.body.products[0].price > 0 && 'inStock' in r.body.products[0]);

  r = await req('GET', '/api/products/p1/stock');
  const p1start = r.body.stock['کرم|۱'];
  check('p1 variant stock = 4', p1start === 4);

  r = await req('POST', '/api/cart/quote', { items: [{ pid: 'p1', color: 'کرم', size: '۱', qty: 1 }], code: 'COA10', shipId: 'post' });
  check('quote applies 10% coupon', r.body.totals.discount === 185000);
  check('quote total = 1,755,000', r.body.totals.total === 1755000);

  r = await req('POST', '/api/cart/quote', { items: [{ pid: 'p6', color: 'سبز', size: 'فری‌سایز', qty: 1 }] });
  check('free shipping over threshold', r.body.totals.shipping === 0);

  r = await req('POST', '/api/discounts/validate', { code: 'welcome', subtotal: 1000000 });
  check('exhausted coupon rejected', r.body.valid === false);

  r = await req('POST', '/api/orders', { customer: { name: 'آزمون', mobile: '09120000001' }, items: [{ pid: 'p1', color: 'کرم', size: '۱', qty: 2 }], shipId: 'post' });
  check('order created', r.status === 201 && r.body.id === 'COA-1007');
  const oid = r.body.id;

  r = await req('GET', '/api/products/p1/stock');
  check('stock decremented by 2', r.body.stock['کرم|۱'] === p1start - 2);

  r = await req('POST', '/api/orders', { customer: { name: 'x', mobile: '09120000002' }, items: [{ pid: 'p5', color: 'سبز', size: 'فری‌سایز', qty: 999 }] });
  check('oversell blocked (409)', r.status === 409);

  r = await req('PATCH', '/api/orders/' + oid + '/status', { status: 'cancelled' });
  check('order cancelled', r.body.status === 'cancelled');

  r = await req('GET', '/api/products/p1/stock');
  check('stock restored after cancel', r.body.stock['کرم|۱'] === p1start);

  r = await req('POST', '/api/inventory/move', { pid: 'p5', variant: 'سبز|فری‌سایز', delta: 5, why: 'ورود' });
  check('inventory move applied', r.body.qty === 5);

  r = await req('GET', '/api/inventory');
  check('inventory listing + low flags', r.body.items.length > 0 && 'low' in r.body.items[0]);

  r = await req('GET', '/');
  check('storefront served', r.status === 200);

  console.log('\n' + n + ' checks passed.');
  server.close();
}

main().catch((e) => { console.error(e); server.close(); process.exit(1); });
