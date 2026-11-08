import { expect, test } from '@playwright/test'

const WIDTHS = [375, 390, 768, 1024, 1440, 1920]
const PATHS = ['/en', '/fa', '/en/works', '/en/works/conatus', '/fa/works/conatus', '/en/works/conatus/2', '/en/writing', '/en/about', '/fa/about', '/en/cv', '/en/contact', '/fa/contact', '/en/exhibitions', '/en/publications']

for (const width of WIDTHS) {
  test(`no horizontal overflow, tap targets and image ratios @${width}px`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height: width < 800 ? 844 : 900 } })
    const page = await ctx.newPage()
    for (const path of PATHS) {
      const res = await page.goto(path)
      expect(res?.status(), path).toBe(200)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, `${path} overflow`).toBeLessThanOrEqual(0)
      // Artwork images are never distorted (rendered ratio == file ratio).
      const distorted = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLImageElement>('.artwork img, .hero-image img')]
          .filter((i) => i.width > 0 && i.height > 0 && i.getAttribute('width'))
          .filter((i) => {
            const declared = Number(i.getAttribute('width')) / Number(i.getAttribute('height'))
            const r = i.getBoundingClientRect()
            const style = getComputedStyle(i)
            return style.objectFit !== 'contain' && style.objectFit !== 'cover' && Math.abs(r.width / r.height - declared) > 0.02
          })
          .map((i) => i.alt),
      )
      expect(distorted, `${path} distorted images`).toEqual([])
      // Header controls are comfortable touch targets.
      const small = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('.site-header a, .site-header button')]
          .filter((e) => e.offsetParent !== null)
          .filter((e) => e.getBoundingClientRect().height < 24)
          .map((e) => e.textContent),
      )
      expect(small, `${path} small targets`).toEqual([])
    }
    await ctx.close()
  })
}
