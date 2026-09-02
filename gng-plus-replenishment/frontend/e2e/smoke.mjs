/**
 * آزمون دود (smoke test) از انتها تا انتها.
 *
 * پیش‌نیاز: بک‌اند روی http://localhost:5220 و فرانت‌اند روی http://127.0.0.1:4200 در حال اجرا باشند.
 * اجرا:  node e2e/smoke.mjs
 *
 * مسیر بررسی‌شده: محاسبه نیاز سفارش ← انتخاب ردیف ← بازبینی ←
 * ایجاد پیش‌نویس ← ارسال به گردش‌کار ← پارامترها و اعتبارسنجی ←
 * اجرای اتوماسیون ← تاریخچه و رویدادها ← درخواست‌های خرید.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4200';
const SHOTS = process.env.E2E_SHOT_DIR ?? 'e2e/screenshots';

mkdirSync(SHOTS, { recursive: true });
const errors = [];

// CHROME_BIN را تنظیم کنید تا از یک مرورگر نصب‌شده استفاده شود؛
// در غیر این صورت مرورگر پیش‌فرض Playwright به کار می‌رود.
const browser = await chromium.launch({
  ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}),
  headless: false,
  args: ['--headless=new', '--no-sandbox', '--disable-gpu']
});
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });

page.on('console', m => { if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`); });
page.on('pageerror', e => errors.push(`PAGEERROR: ${e.message}`));

async function shot(name) {
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });
  console.log(`  screenshot: ${name}.png`);
}

// ---------------------------------------------------------------
console.log('\n[1] صفحه سفارش‌دهی کالا');
await page.goto(`${BASE}/replenishment`, { waitUntil: 'networkidle' });
await page.waitForSelector('.dx-datagrid-rowsview .dx-data-row', { timeout: 30000 });

const title = await page.locator('.page-header__title').textContent();
const rowCount = await page.locator('.dx-datagrid-rowsview .dx-data-row').count();
const summaryVals = await page.locator('.gng-summary__value').allTextContents();
console.log(`  title="${title.trim()}" rows=${rowCount}`);
console.log(`  summary=${JSON.stringify(summaryVals)}`);

const dir = await page.evaluate(() => document.documentElement.dir);
const badges = await page.locator('.gng-badge').allTextContents();
console.log(`  dir=${dir}`);
console.log(`  statuses=${JSON.stringify([...new Set(badges)])}`);
await shot('01-replenishment');

// ---------------------------------------------------------------
console.log('\n[2] محاسبه نیاز سفارش');
await page.getByRole('button', { name: 'محاسبه نیاز سفارش' }).click();
await page.waitForTimeout(2500);
const afterCalc = await page.locator('.gng-summary__value').allTextContents();
console.log(`  summary after recalc=${JSON.stringify(afterCalc)}`);

// ---------------------------------------------------------------
console.log('\n[3] انتخاب ردیف و باز کردن بازبینی');
const sendBtn = page.locator('.dx-button', { hasText: 'ارسال درخواست خرید' });
console.log(`  send button disabled before selection: ${await sendBtn.evaluate(el => el.classList.contains('dx-state-disabled'))}`);

const checkboxes = page.locator('.dx-datagrid-rowsview .dx-data-row .dx-select-checkbox');
const n = await checkboxes.count();
let selected = 0;
for (let i = 0; i < n && selected < 2; i++) {
  const cb = checkboxes.nth(i);
  if (await cb.evaluate(el => !el.classList.contains('dx-state-disabled'))) {
    await cb.click(); selected++;
    await page.waitForTimeout(250);
  }
}
console.log(`  selected ${selected} rows`);
console.log(`  send button disabled after selection: ${await sendBtn.evaluate(el => el.classList.contains('dx-state-disabled'))}`);
await shot('02-selected');

await sendBtn.click();
await page.waitForSelector('.dx-popup-content', { timeout: 10000 });
await page.waitForTimeout(800);
console.log(`  review dialog title="${(await page.locator('.dx-popup-title .dx-toolbar-label').first().textContent()).trim()}"`);
await shot('03-review-dialog');

// ---------------------------------------------------------------
console.log('\n[4] ایجاد پیش‌نویس درخواست خرید');
await page.locator('.dx-overlay-content .dx-button', { hasText: 'ایجاد پیش‌نویس درخواست خرید' }).click();
await page.waitForTimeout(3000);
const resultText = await page.locator('.review__result').textContent().catch(() => '(none)');
const prNumber = (resultText.match(/PR-\d+-\d+/) || ['(not found)'])[0];
console.log(`  created purchase request: ${prNumber}`);
await shot('04-draft-created');

// ---------------------------------------------------------------
console.log('\n[5] ارسال به گردش‌کار');
const wfBtn = page.locator('.dx-overlay-content .dx-button', { hasText: 'ارسال به گردش‌کار' });
if (await wfBtn.count() > 0) {
  await wfBtn.click();
  await page.waitForTimeout(2500);
  const after = await page.locator('.review__result').textContent();
  console.log(`  status now: ${(after.match(/وضعیت فعلی:\s*(\S+)/) || [])[1] ?? '?'}`);
  console.log(`  workflow:   ${(after.match(/WF-[\w-]+/) || ['(none)'])[0]}`);
  await shot('05-submitted');
}
await page.locator('.dx-overlay-content .dx-button', { hasText: 'بستن' }).click().catch(() => {});
await page.waitForTimeout(2500);

// ---------------------------------------------------------------
console.log('\n[6] پارامترهای سفارش‌دهی کالا');
await page.goto(`${BASE}/parameters`, { waitUntil: 'networkidle' });
await page.waitForSelector('.dx-datagrid-rowsview .dx-data-row', { timeout: 20000 });
console.log(`  title="${(await page.locator('.page-header__title').textContent()).trim()}" rows=${await page.locator('.dx-datagrid-rowsview .dx-data-row').count()}`);
await shot('06-parameters');

await page.getByRole('button', { name: 'پارامتر جدید' }).click();
await page.waitForSelector('.dx-popup-content', { timeout: 10000 });
await page.waitForTimeout(800);
const labels = await page.locator('.dx-overlay-content .gng-field__label').allTextContents();
console.log(`  form fields (${labels.length}): ${labels.slice(0, 8).join(' | ')} …`);
await shot('07-parameter-form');

console.log('\n[7] اعتبارسنجی فرم');
await page.locator('.dx-overlay-content .dx-button', { hasText: 'ذخیره' }).first().click();
await page.waitForTimeout(1200);
const fieldErrors = (await page.locator('.dx-overlay-content .gng-field__error').allTextContents()).filter(t => t.trim());
console.log(`  validation messages shown: ${fieldErrors.length}`);
console.log(`  sample: ${JSON.stringify(fieldErrors.slice(0, 3))}`);
await shot('08-validation');
await page.locator('.dx-overlay-content .dx-button', { hasText: 'انصراف' }).click();
await page.waitForTimeout(600);

// ---------------------------------------------------------------
console.log('\n[8] اتوماسیون سفارش‌دهی');
await page.goto(`${BASE}/automation`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
console.log(`  status fields: ${JSON.stringify((await page.locator('.status-grid__value').allTextContents()).map(t => t.trim()))}`);
await shot('09-automation');

await page.getByRole('button', { name: 'اجرای الآن' }).click();
await page.waitForTimeout(3500);
const runStats = await page.locator('.run-result .gng-summary__value').allTextContents();
console.log(`  run result: ${JSON.stringify(runStats)}`);
console.log(`  times: ${(await page.locator('.run-result__times').textContent().catch(() => '')).replace(/\s+/g, ' ').trim().slice(0, 120)}`);
await shot('10-automation-run');

console.log('\n[9] تاریخچه اجرا');
await page.locator('.dx-tab', { hasText: 'تاریخچه اجرا' }).click();
await page.waitForTimeout(2000);
const runRows = await page.locator('.dx-datagrid-rowsview .dx-data-row').count();
console.log(`  runs listed: ${runRows}`);
await shot('11-run-history');

await page.locator('.dx-datagrid-rowsview .dx-data-row').first().dblclick();
await page.waitForTimeout(2500);
console.log(`  detail title="${(await page.locator('.page-header__title').textContent()).trim()}"`);
await shot('12-run-detail');

await page.locator('.dx-tab', { hasText: 'رویدادهای اجرا' }).click();
await page.waitForTimeout(2000);
const auditRows = await page.locator('.dx-datagrid-rowsview .dx-data-row').count();
const firstMessages = await page.locator('.dx-datagrid-rowsview .dx-data-row td').allTextContents();
console.log(`  audit rows on page: ${auditRows}`);
console.log(`  sample event: ${firstMessages.slice(0, 6).map(t => t.trim()).filter(Boolean).join(' | ').slice(0, 160)}`);
await shot('13-audit');

// ---------------------------------------------------------------
console.log('\n[10] درخواست‌های خرید');
await page.goto(`${BASE}/purchase-requests`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
console.log(`  purchase requests: ${await page.locator('.dx-datagrid-rowsview .dx-data-row').count()}`);
await shot('14-purchase-requests');

await page.locator('.dx-datagrid-rowsview .dx-data-row').first().dblclick();
await page.waitForTimeout(2500);
console.log(`  detail title="${(await page.locator('.page-header__title').textContent()).trim()}"`);
await shot('15-purchase-request-detail');

console.log(`\n=== console/page errors: ${errors.length} ===`);
errors.slice(0, 10).forEach(e => console.log('  ' + e.slice(0, 200)));

await browser.close();

process.exit(errors.length === 0 ? 0 : 1);
