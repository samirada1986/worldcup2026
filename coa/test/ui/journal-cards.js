'use strict';
/* Visual-regression guard for the journal/blog cards (dev-only).
 * Encodes the 2026-11-15 fix: the homepage used `.map(postCard)`, leaking the
 * array into the heading-level arg and emitting an invalid <h[object Object]>
 * tag, which jammed the date onto the title. Also checks RTL date/title
 * separation, a real heading, no horizontal overflow, long titles and
 * description-less posts.
 *   BASE=http://localhost:3000 node test/ui/journal-cards.js */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const BASE = process.env.BASE || 'http://localhost:3000';
const assert = require('assert');

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--no-sandbox'] });
  let n = 0;
  const ok = (name, cond) => { assert.ok(cond, 'FAIL: ' + name); n++; console.log('  ✓ ' + name); };

  for (const [label, w, h, mob] of [['desktop', 1440, 900, false], ['mobile', 390, 844, true]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));

    // homepage journal section (the regressed path)
    await p.goto(BASE + '/#/', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(mob ? 1200 : 3800);
    ok(label + ': no invalid [object heading in document', (await p.content()).indexOf('[object') < 0);

    // journal listing
    await p.evaluate(() => { location.hash = '#/journal'; });
    await p.waitForTimeout(900);
    const cards = await p.evaluate(() => {
      return [...document.querySelectorAll('.jr-card')].map(c => {
        const t = c.querySelector('time'), h = c.querySelector('h1,h2,h3,h4');
        const tr = t.getBoundingClientRect(), hr = h.getBoundingClientRect();
        return { heading: h.tagName, gap: Math.round(hr.top - tr.bottom), dateSize: parseFloat(getComputedStyle(t).fontSize), titleSize: parseFloat(getComputedStyle(h).fontSize) };
      });
    });
    ok(label + ': journal cards present', cards.length >= 1);
    ok(label + ': title is a real heading', cards.every(c => /^H[1-4]$/.test(c.heading)));
    ok(label + ': date sits on its own line above the title (gap > 0)', cards.every(c => c.gap >= 2));
    ok(label + ': title larger than date', cards.every(c => c.titleSize > c.dateSize + 3));
    ok(label + ': date is readable (>=12px)', cards.every(c => c.dateSize >= 12));
    ok(label + ': no horizontal overflow on journal', (await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) === 0);

    // long Persian title + a description-less post, reloaded so state re-reads
    await p.evaluate(() => {
      for (const k of Object.keys(localStorage)) {
        try { const o = JSON.parse(localStorage.getItem(k)); if (o && o.content && o.content.posts && o.content.posts.length) { o.content.posts[0].title = 'یک عنوان بسیار بلند فارسی برای آزمودن شکستن خط و چیدمان کارت ژورنال در حالت‌های مختلف نمایش'; o.content.posts[0].body = ''; localStorage.setItem(k, JSON.stringify(o)); } } catch (e) {}
      }
    });
    await p.reload({ waitUntil: 'domcontentloaded' });
    await p.evaluate(() => { location.hash = '#/journal'; });
    await p.waitForTimeout(700);
    ok(label + ': long title + empty body still no overflow', (await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) === 0);
    ok(label + ': long title did not produce invalid markup', (await p.content()).indexOf('[object') < 0);

    ok(label + ': no page errors', errs.length === 0);
    await ctx.close();
  }

  console.log('\n' + n + ' checks passed.');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
