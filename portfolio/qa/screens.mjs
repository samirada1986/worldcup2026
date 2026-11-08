// Usage: node qa/screens.mjs <outDir> <scale> <path>@<width>[,...]
import { chromium } from 'playwright'
const [out = 'qa/screenshots', scale = '1', list = '/en@1440'] = process.argv.slice(2)
const base = process.env.BASE_URL || 'http://localhost:3000'
const b = await chromium.launch()
for (const item of list.split(',')) {
  const [path, w = '1440', full = 'full'] = item.split('@').flatMap((x) => x.split(':'))
  const width = Number(w)
  const page = await b.newPage({ viewport: { width, height: width < 800 ? 844 : 900 }, deviceScaleFactor: Number(scale) })
  await page.goto(base + path, { waitUntil: 'networkidle' })
  // Load lazy images before full-page capture.
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'))
    document.querySelectorAll('.reveal').forEach((e) => (e.dataset.in = 'true'))
    await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r }))))
  })
  await page.waitForTimeout(400)
  const name = `${path.replace(/\//g, '_') || 'root'}-${width}.png`
  await page.screenshot({ path: `${out}/${name}`, fullPage: full === 'full' })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  console.log(name, overflow > 0 ? `HORIZONTAL OVERFLOW ${overflow}px` : 'ok')
  await page.close()
}
await b.close()
