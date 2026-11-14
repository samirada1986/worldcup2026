'use strict';
/* WCAG 2.2 AA + best-practice scan with axe-core over every storefront route at 390 and 1440 px (dev-only).
 *   npm i --no-save axe-core playwright && BASE=http://localhost:3000 node test/ui/a11y.js */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const axe=require('fs').readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
const R=['/','/shop','/product/p1','/product/p4','/cart','/collection','/journal','/about','/faq','/size-guide'];
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROME||undefined,args:['--no-sandbox']});
 const res={};
 for(const w of [390,1440]){
  const page=await (await b.newContext({viewport:{width:w,height:900}})).newPage();
  await page.goto((process.env.BASE||'http://localhost:3000')+'/#/');await page.waitForTimeout(600);
  for(const r of R){
   await page.evaluate(h=>{location.hash=h},r);await page.waitForTimeout(600);
   await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}window.scrollTo(0,0)});
   await page.evaluate(()=>{document.querySelectorAll('[data-rv]').forEach(e=>e.classList.add('seen'))});await page.waitForTimeout(1300);
   await page.addScriptTag({content:axe});
   const v=await page.evaluate(()=>axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']}).then(r=>r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,2).map(n=>n.target.join(' ')+' :: '+(n.any[0]||n.all[0]||n.none[0]||{}).message?.slice(0,110))}))));
   res[w+r]=v;
  }
 }
 const agg={};
 for(const k in res)for(const v of res[k]){const a=agg[v.id]=agg[v.id]||{impact:v.impact,pages:[],ex:v.ex};a.pages.push(k)}
 for(const id in agg)console.log(id,agg[id].impact,agg[id].pages.length+' pages',JSON.stringify(agg[id].ex),agg[id].pages.slice(0,4).join(','));
 await b.close();
})();
