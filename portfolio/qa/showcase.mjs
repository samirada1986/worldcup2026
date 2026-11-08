// Captures the screenshots used in docs/QA-REPORT.md (viewport-sized, 2x).
import { chromium } from 'playwright'
const base = process.env.BASE_URL || 'http://localhost:3000'
const out = process.argv[2] || 'docs/screenshots'
const b = await chromium.launch()
const shot = async (name, path, width, height, act) => {
  const p = await b.newPage({ viewport: { width, height }, deviceScaleFactor: 2 })
  await p.goto(base + path, { waitUntil: 'networkidle' })
  await p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => (e.dataset.in = 'true')))
  if (act) await act(p)
  await p.waitForTimeout(700)
  await p.screenshot({ path: `${out}/${name}.png` })
  await p.close()
}
await shot('01-home-desktop', '/en', 1440, 900)
await shot('02-home-fa-desktop', '/fa', 1440, 900)
await shot('03-project-desktop', '/en/works/conatus', 1440, 900)
await shot('04-sequence-spread', '/en/works/conatus', 1440, 900, (p) => p.evaluate(() => document.querySelector('.seq-spread')?.scrollIntoView({ block: 'center' })))
await shot('05-lightbox-desktop', '/en/works/conatus', 1440, 900, (p) => p.locator('.artwork-button').nth(1).click())
await shot('06-works-index', '/en/works', 1440, 900)
await shot('07-essay-desktop', '/en/writing/qa-layout-test-on-returning-images', 1440, 900)
await shot('08-home-mobile', '/en', 390, 844)
await shot('09-project-fa-mobile', '/fa/works/conatus', 390, 844)
await shot('10-lightbox-mobile', '/en/works/conatus', 390, 844, (p) => p.locator('.artwork-button').first().click())
await shot('11-menu-mobile', '/fa', 390, 844, (p) => p.getByRole('button', { name: 'منو' }).click())
await shot('12-essay-fa-mobile', '/fa/writing/qa-layout-test-on-returning-images', 390, 844, (p) => p.evaluate(() => window.scrollTo(0, 620)))
await shot('13-contact-desktop', '/en/contact', 1440, 900)
await shot('14-artwork-page', '/en/works/conatus/2', 1440, 900)
await b.close()
