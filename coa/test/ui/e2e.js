'use strict';
/* UI end-to-end check (dev-only, not part of `npm test`).
 * Needs Playwright + Chrome on the machine; they are intentionally NOT project dependencies.
 *   BASE=http://localhost:3000 PLAYWRIGHT_PATH=/path/to/node_modules/playwright CHROME=/usr/bin/google-chrome node test/ui/e2e.js
 * Covers: product meta/schema, sticky buy bar (mobile), size validation, add to cart,
 * 4-step checkout, order confirmation, image zoom open/close. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const BASE = process.env.BASE || 'http://localhost:3000';
const assert=require('assert');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROME||undefined,args:['--no-sandbox']});
 for(const [name,vp,mob] of [['desktop',{width:1440,height:900},false],['mobile',{width:390,height:844},true]]){
  const ctx=await b.newContext({viewport:vp,hasTouch:mob,isMobile:mob,locale:'fa-IR'});const page=await ctx.newPage();
  const errs=[];page.on('pageerror',e=>errs.push(e.message));page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await page.goto(BASE+'/#/product/p1');await page.waitForTimeout(1200);
  await page.evaluate(()=>document.querySelectorAll('[data-rv]').forEach(e=>e.classList.add('seen')));
  // meta + schema
  const meta=await page.evaluate(()=>({t:document.title,d:document.querySelector('meta[name=description]').content,ld:JSON.parse(document.getElementById('ld').textContent)}));
  assert(meta.d.includes('ساتن'),'desc');assert(meta.ld['@graph'][0].offers.priceCurrency==='IRR');assert(meta.ld['@graph'][1].itemListElement.length===4);
  // add without size -> error
  if(mob){await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await page.waitForTimeout(700);
    await page.click('.stk .btn');await page.waitForTimeout(700);
    assert(await page.locator('.note.err').count()===1,'sticky no-size error');}
  else{await page.click('.buy [data-act=add]');await page.waitForTimeout(400);assert(await page.locator('.note.err').count()===1,'no-size error')}
  // choose size 1 and add
  await page.click('.buy .opts[aria-labelledby=ls] .chip:not(.na)');await page.waitForTimeout(300);
  if(mob){
    // bar must be hidden while the main CTA is visible, shown once it scrolls away
    await page.evaluate(()=>document.querySelector('.buy [data-act=add]').scrollIntoView({block:'center'}));await page.waitForTimeout(700);
    assert(!(await page.evaluate(()=>document.querySelector('.stk').classList.contains('on'))),'bar hidden when CTA visible');
    await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await page.waitForTimeout(700);
    assert(await page.evaluate(()=>document.querySelector('.stk').classList.contains('on')),'bar shown when CTA off-screen');
    await page.click('.stk .btn')}else await page.click('.buy [data-act=add]');
  await page.waitForTimeout(1200);
  assert(await page.locator('.ov-cart').count()===1,'cart drawer');
  await page.click('.ov-cart a[href="#/checkout"]');await page.waitForTimeout(800);
  assert((await page.textContent('h1')).includes('تسویه'),'checkout h1');
  await page.fill('input[name=name]','مشتری آزمون');await page.fill('input[name=mobile]','09123456789');
  await page.selectOption('select[name=province]','تهران').catch(()=>{});
  await page.fill('input[name=city]','تهران');await page.fill('textarea[name=address]','نشانی آزمایشی، خیابان نمونه، پلاک ۱').catch(async()=>{await page.fill('input[name=address]','نشانی آزمایشی، خیابان نمونه، پلاک ۱')});
  await page.fill('input[name=postal]','1234567890');
  await page.click('form[data-form=co1] button.btn');await page.waitForTimeout(500);
  await page.click('form[data-form=co2] button.btn');await page.waitForTimeout(500);
  await page.click('form[data-form=co3] button.btn');await page.waitForTimeout(500);
  await page.click('[data-act=place]');await page.waitForTimeout(1200);
  assert(page.url().includes('/done/COA-'),'order placed '+page.url());
  // zoom
  await page.goto(BASE+'/#/product/p2');await page.waitForTimeout(800);
  await page.click('.zb');await page.waitForTimeout(500);assert(await page.locator('.ov-zoom img').count()===1,'zoom open');
  await page.keyboard.press('Escape');await page.waitForTimeout(500);assert(await page.locator('.ov-zoom').count()===0,'zoom closed');
  console.log(name,'OK errors:',errs);
  await ctx.close();
 }
 await b.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
