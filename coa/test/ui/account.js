'use strict';
/* Customer-account journeys + guards (dev-only, safe test data, no real payments).
 *   BASE=http://localhost:3000 node test/ui/account.js
 * Covers: protected routes redirect to login, demo login/logout, overview, orders (+filter,
 * detail), wishlist add/remove, addresses (add/remove), settings edit, guest isolation (no demo
 * identity leaks into checkout), production mode (no demo identities, login unavailable),
 * RTL/ID isolation, status tones, and mobile overflow/touch-target checks. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const BASE = process.env.BASE || 'http://localhost:3000';
const assert = require('assert');

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox'] });
  let n = 0;
  const ok = (name, cond) => { assert.ok(cond, 'FAIL: ' + name); n++; console.log('  ✓ ' + name); };
  const hash = (p) => p.evaluate(() => location.hash);
  const go = async (p, h) => { await p.evaluate((x) => { location.hash = x; }, h); await p.waitForTimeout(450); };
  const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  /* ---------------- demo environment, desktop ---------------- */
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  let p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(BASE + '/#/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(600);

  console.log('guest');
  for (const r of ['/account', '/account/orders', '/account/order/COA-1006', '/account/addresses', '/account/settings']) {
    await go(p, '#' + r);
    const h = await hash(p);
    ok('guest ' + r + ' -> login (next preserved)', h.indexOf('#/login') === 0 && h.indexOf('next=') > 0);
  }
  ok('login page offers a clearly labelled demo login', (await p.locator('[data-act=login]').innerText()).indexOf('نمایشی') > -1);
  await go(p, '#/account/wishlist');
  ok('guest wishlist stays reachable (device-local)', (await hash(p)) === '#/account/wishlist');
  ok('guest wishlist shows no demo customer', (await p.evaluate(() => document.body.innerText)).indexOf('مشتری نمایشی') < 0);

  // a guest's checkout must not be pre-filled with the demo customer's data
  await go(p, '#/product/p1');
  await p.click('.buy .opts[aria-labelledby=ls] .chip:not(.na)');
  await p.click('.buy [data-act=add]');
  await p.waitForTimeout(500);
  await go(p, '#/checkout');
  const prefill = await p.evaluate(() => ({ name: (document.querySelector('input[name=name]') || {}).value, mobile: (document.querySelector('input[name=mobile]') || {}).value }));
  ok('guest checkout is not prefilled with demo identity', !prefill.name && !prefill.mobile);

  console.log('login + overview');
  await go(p, '#/account/orders');
  await p.click('[data-act=login]');
  await p.waitForTimeout(600);
  ok('login returns to the page that was requested', (await hash(p)) === '#/account/orders');
  await go(p, '#/account');
  ok('overview heading is the account title (not a greeting)', (await p.locator('.ac-body h1').innerText()).trim() === 'حساب کاربری من');
  ok('greeting is secondary and carries the demo label', (await p.locator('.ac-hello').innerText()).indexOf('نمایشی') > -1);
  const stats = await p.locator('.stat').evaluateAll((els) => els.map((e) => ({ href: e.getAttribute('href'), n: e.querySelector('b').textContent })));
  ok('three summary cards linking to their sections', stats.length === 3 && stats.every((s) => s.href.indexOf('#/account/') === 0));
  ok('counts use Persian digits', stats.every((s) => /^[۰-۹]+$/.test(s.n.trim())));
  const h1Size = await p.locator('.ac-body h1').evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  ok('page title is compact (<= 34px, was 42px)', h1Size <= 34);
  const firstId = await p.locator('.oc .oc-id bdi').first().innerText();
  ok('"latest order" is actually the newest order (COA-1006)', firstId.trim() === 'COA-1006');

  console.log('orders');
  await p.click('.ac-link[href="#/account/orders"]');
  await p.waitForTimeout(500);
  const cards = await p.locator('.oc').count();
  ok('orders list renders one card per order', cards === 2);
  const tones = await p.locator('.oc .badge.st').evaluateAll((els) => els.map((e) => e.className));
  ok('delivered is green, confirmed is neutral (not success)', tones.some((c) => c.indexOf(' ok') > -1) && tones.some((c) => c.indexOf(' info') > -1));
  ok('order id is direction-isolated (bdi.ltr)', (await p.locator('.oc .oc-id bdi.ltr').count()) >= 1);
  await p.click('[data-act=ofilter][data-v=active]');
  ok('status filter narrows the list', (await p.locator('.oc').count()) === 1);
  await p.click('[data-act=ofilter][data-v=cancelled]');
  ok('empty filter shows an empty state, not a blank page', (await p.locator('.empty').count()) === 1);
  await p.click('[data-act=ofilter][data-v=all]');
  await p.locator('.oc a.btn').first().click();
  await p.waitForTimeout(500);
  ok('order detail opens', (await hash(p)).indexOf('#/account/order/COA-') === 0);
  ok('order detail shows timeline, items, address and totals', (await p.locator('.tl').count()) === 1 && (await p.locator('.sum').count()) === 1 && (await p.locator('.line').count()) >= 1);
  await p.click('.ac-link[href="#/account"]');
  await p.waitForTimeout(400);
  ok('back to overview', (await hash(p)) === '#/account');

  console.log('wishlist');
  await p.click('.ac-link[href="#/account/wishlist"]');
  await p.waitForTimeout(500);
  const before = await p.locator('.card').count();
  await p.locator('.card [data-act=wish]').first().click();
  await p.waitForTimeout(400);
  ok('removing a favourite updates the list', (await p.locator('.card').count()) === before - 1);
  ok('empty wishlist shows a useful empty state', (await p.locator('.empty a.btn').count()) === 1);

  console.log('addresses + settings');
  await p.click('.ac-link[href="#/account/addresses"]');
  await p.waitForTimeout(500);
  const addrBefore = await p.locator('.ad').count();
  await p.fill('form[data-form=addr] input[name=label]', 'آزمون');
  await p.fill('form[data-form=addr] input[name=name]', 'گیرندهٔ آزمون');
  await p.fill('form[data-form=addr] input[name=mobile]', '09120000001');
  await p.selectOption('form[data-form=addr] select[name=province]', { index: 1 });
  await p.fill('form[data-form=addr] input[name=city]', 'تهران');
  await p.fill('form[data-form=addr] input[name=postal]', '1234567890');
  await p.fill('form[data-form=addr] input[name=address]', 'نشانی آزمایشی');
  await p.click('form[data-form=addr] button.btn');
  await p.waitForTimeout(500);
  ok('address can be added', (await p.locator('.ad').count()) === addrBefore + 1);
  await p.locator('.ad [data-act=rmaddr]').last().click();
  await p.waitForTimeout(400);
  ok('address can be removed', (await p.locator('.ad').count()) === addrBefore);
  await p.click('.ac-link[href="#/account/settings"]');
  await p.waitForTimeout(500);
  await p.fill('form[data-form=profile] input[name=name]', 'نام آزمون');
  await p.click('form[data-form=profile] button.btn');
  await p.waitForTimeout(500);
  await go(p, '#/account');
  ok('profile edit is reflected in the greeting', (await p.locator('.ac-hello').innerText()).indexOf('نام آزمون') > -1);

  console.log('nav a11y + logout');
  ok('active nav item is exposed with aria-current', (await p.locator('.ac-link[aria-current=page]').count()) === 1);
  await p.locator('.ac-link').first().focus();
  await p.keyboard.press('Tab');
  ok('nav links are keyboard focusable', (await p.evaluate(() => document.activeElement.classList.contains('ac-link'))) === true);
  await p.click('.ac-nav [data-act=logout]');
  await p.waitForTimeout(600);
  ok('logout returns to the storefront', (await hash(p)) === '#/' || (await hash(p)) === '');
  await go(p, '#/account/orders');
  ok('after logout protected routes redirect again', (await hash(p)).indexOf('#/login') === 0);
  ok('no page errors (demo/desktop)', errs.length === 0);
  await ctx.close();

  /* ---------------- demo environment, mobile ---------------- */
  for (const [w, h] of [[430, 932], [390, 844], [375, 812], [768, 1024]]) {
    ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 700, hasTouch: w < 700 });
    p = await ctx.newPage();
    await p.goto(BASE + '/#/login', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(500);
    await p.click('[data-act=login]');
    await p.waitForTimeout(500);
    for (const r of ['', '/orders', '/order/COA-1006', '/wishlist', '/addresses', '/settings']) {
      await go(p, '#/account' + r);
      ok(w + 'px /account' + r + ': no horizontal overflow', (await overflow(p)) === 0);
    }
    await go(p, '#/account');
    const tiny = await p.evaluate(() => [...document.querySelectorAll('.ac-link,.ac-body .btn,.ac-body .chip,.stat')].filter((e) => e.offsetParent && e.getBoundingClientRect().height < 40).length);
    ok(w + 'px: account controls are touch-sized (>=40px)', tiny === 0);
    const fs = await p.evaluate(() => [...document.querySelectorAll('.ac-body h1,.ac-body p,.ac-body span,.ac-body b')].filter((e) => e.offsetParent && parseFloat(getComputedStyle(e).fontSize) < 12).length);
    ok(w + 'px: no text below 12px', fs === 0);
    await ctx.close();
  }

  /* ---------------- production environment: no fabricated identities ---------------- */
  ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { window.COA_ENV = 'production'; });
  p = await ctx.newPage();
  const perrs = [];
  p.on('pageerror', (e) => perrs.push(e.message));
  await p.goto(BASE + '/#/account', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(600);
  ok('production: account requires login', (await hash(p)).indexOf('#/login') === 0);
  ok('production: no demo login button is offered', (await p.locator('[data-act=login]').count()) === 0);
  ok('production: no demo identity anywhere in the page', (await p.evaluate(() => document.body.innerText)).indexOf('مشتری نمایشی') < 0);
  // state is only persisted on a mutation, so toggle a favourite to make the seeded state observable
  await p.goto(BASE + '/#/shop', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(900);
  await p.locator('.card [data-act=wish]').first().click();
  await p.waitForTimeout(400);
  const store = await p.evaluate(() => { for (const k of Object.keys(localStorage)) { try { const o = JSON.parse(localStorage.getItem(k)); if (o && o.customers) return { c: o.customers.length, o: o.orders.length, a: o.addresses.length, me: o.me }; } catch (e) {} } return null; });
  ok('production: seed holds no customers, orders or addresses', store && store.c === 0 && store.o === 0 && store.a === 0 && store.me === null);
  for (const r of ['/#/', '/#/shop', '/#/cart', '/#/admin', '/#/admin/orders', '/#/admin/customers', '/#/journal']) {
    await p.goto(BASE + r, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(500);
  }
  ok('production: storefront and admin render without errors on empty data', perrs.length === 0);
  await ctx.close();

  console.log('\n' + n + ' checks passed.');
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
