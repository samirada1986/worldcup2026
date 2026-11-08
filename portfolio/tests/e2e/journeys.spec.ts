import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { apiLogin, essay, testJpeg, tinyPdf, uploadMedia } from './helpers'
import { ADMIN } from './helpers'

test.describe.configure({ mode: 'serial' })

const created = { projects: [] as number[], writings: [] as number[], media: [] as number[] }
let auth: Record<string, string>
let essaySlug = ''

test.beforeAll(async ({ request }) => {
  auth = await apiLogin(request)
  // Clean inquiries so the contact rate limit starts fresh for this run.
  await request.delete('/api/inquiries?where[id][exists]=true', { headers: auth })
})

test.afterAll(async ({ request }) => {
  for (const id of created.writings) await request.delete(`/api/writings/${id}`, { headers: auth })
  for (const id of created.projects) await request.delete(`/api/projects/${id}`, { headers: auth })
  for (const id of created.media) await request.delete(`/api/media/${id}`, { headers: auth })
  await request.post('/api/globals/profile?locale=en', { headers: auth, data: { cvPdf: null } })
})

async function axe(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  const serious = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
}

// ---------------------------------------------------------------------------
test('Visitor 1 — curator: homepage → CONATUS → full sequence in viewer → CV', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/en$/)
  await expect(page.locator('.wordmark').first()).toHaveText(/SAMIRA DADASHI/i)
  await axe(page)

  await page.locator('.hero-caption').getByRole('link', { name: 'View project' }).click()
  await expect(page).toHaveURL(/\/en\/works\/conatus$/)
  await expect(page.getByRole('heading', { level: 1, name: 'CONATUS' })).toBeVisible()
  await axe(page)

  const triggers = page.locator('.artwork-button')
  const count = await triggers.count()
  expect(count).toBeGreaterThanOrEqual(8)

  // Open the first artwork and step through the whole sequence with the keyboard.
  await triggers.first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('.lightbox-bar .num')).toHaveText(/^01 of \d+/)
  await expect(page.getByRole('button', { name: 'Close' })).toBeFocused()
  for (let i = 1; i < count; i++) await page.keyboard.press('ArrowRight')
  await expect(dialog.locator('.lightbox-bar .num')).toHaveText(new RegExp(`^${String(count).padStart(2, '0')} of`))
  await page.keyboard.press('ArrowRight') // wraps to the first
  await expect(dialog.locator('.lightbox-bar .num')).toHaveText(/^01 of/)
  // Image keeps its proportions (no stretching).
  const ratio = await dialog.locator('.lightbox-stage img').evaluate((img: HTMLImageElement) => {
    const r = img.getBoundingClientRect()
    return Math.abs(r.width / r.height - img.naturalWidth / img.naturalHeight)
  })
  expect(ratio).toBeLessThan(0.02)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(triggers.first()).toBeFocused()

  await page.getByRole('navigation').first().getByRole('link', { name: 'About' }).click()
  await expect(page).toHaveURL(/\/en\/about$/)
  await page.getByRole('main').getByRole('link', { name: 'CV', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/cv$/)
  await expect(page.getByRole('heading', { level: 1, name: 'CV' })).toBeVisible()
})

// ---------------------------------------------------------------------------
test('Visitor 2 — editor: artwork page → about → contact form (validation, spam trap, success, rate limit)', async ({ page }) => {
  await page.goto('/en/works/conatus/3')
  await expect(page.locator('.artwork-page .label').first()).toHaveText(/03 \/ \d+/)
  await expect(page.getByRole('link', { name: 'CONATUS' })).toBeVisible()
  await axe(page)
  await page.getByRole('link', { name: /About Samira Dadashi/ }).click()
  await expect(page).toHaveURL(/\/en\/about$/)
  await page.getByRole('main').getByRole('link', { name: 'Contact' }).click()
  await expect(page).toHaveURL(/\/en\/contact$/)
  await axe(page)

  // Server-side validation (client validation disabled with noValidate).
  await page.waitForTimeout(3000)
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText('Please check the highlighted fields.')).toBeVisible()
  await expect(page.locator('#c-email')).toHaveAttribute('aria-invalid', 'true')

  await page.getByLabel('Name', { exact: true }).fill('QA Editor')
  await page.getByLabel('Email', { exact: true }).fill('not-an-email')
  await page.getByLabel('Message', { exact: true }).fill('Hello, I would like to discuss a publication.')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText('Enter a valid email address')).toBeVisible()
  await page.getByLabel('Email', { exact: true }).fill('qa.editor@example.org')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('status')).toHaveText(/Thank you/)
})

test('Contact — rate limiting and inquiry stored privately', async ({ page, request }) => {
  for (let i = 0; i < 3; i++) {
    await page.goto('/en/contact')
    await page.waitForTimeout(2700)
    await page.getByLabel('Name', { exact: true }).fill(`QA ${i}`)
    await page.getByLabel('Email', { exact: true }).fill('qa@example.org')
    await page.getByLabel('Message', { exact: true }).fill('Rate limit test message number ' + i)
    await page.getByRole('button', { name: 'Send message' }).click()
    await page.waitForSelector('.form-status')
  }
  await expect(page.locator('.form-status')).toHaveText(/Too many messages/)
  const anon = await request.get('/api/inquiries', { headers: {} })
  expect([401, 403]).toContain(anon.status())
  const list = await (await request.get('/api/inquiries', { headers: auth })).json()
  expect(list.totalDocs).toBe(3) // 1 from Visitor 2 + 2 here, the 3rd in this hour was refused
})

// ---------------------------------------------------------------------------
test('Admin 2 — essay in English + Persian translation, draft then publish', async ({ request, page }) => {
  const img = await uploadMedia(request, auth, await testJpeg(1, 1600, 1000), 'qa-essay.jpg', { alt: 'QA essay image', title: 'QA essay image' })
  created.media.push(img.id)
  const title = `QA essay ${Date.now()}`
  const res = await request.post('/api/writings?locale=en&draft=true', {
    headers: auth,
    data: { title, excerpt: 'QA excerpt', availableIn: ['en'], content: essay('en', img.id), _status: 'draft' },
  })
  expect(res.ok()).toBeTruthy()
  const doc = (await res.json()).doc
  created.writings.push(doc.id)
  essaySlug = doc.slug
  expect(essaySlug).toMatch(/^qa-essay-\d+$/)

  // Draft is not public.
  expect((await request.get(`/en/writing/${essaySlug}`)).status()).toBe(404)
  const anonApi = await (await request.get(`/api/writings?where[slug][equals]=${essaySlug}`)).json()
  expect(anonApi.totalDocs).toBe(0)

  // Persian translation, then publish both languages.
  const fa = await request.patch(`/api/writings/${doc.id}?locale=fa&draft=true`, {
    headers: auth,
    data: { title: 'نوشتهٔ آزمایشی', excerpt: 'چکیدهٔ آزمایشی', content: essay('fa', img.id) },
  })
  expect(fa.ok()).toBeTruthy()
  const pub = await request.patch(`/api/writings/${doc.id}?locale=en`, { headers: auth, data: { availableIn: ['en', 'fa'], _status: 'published' } })
  expect(pub.ok()).toBeTruthy()

  await page.goto(`/en/writing/${essaySlug}`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  await expect(page.locator('article')).toHaveAttribute('dir', 'ltr')
  await expect(page.locator('.fn-ref')).toHaveCount(2)
  await expect(page.locator('.notes li')).toHaveCount(2)
  await expect(page.locator('blockquote.pull')).toContainText('A pull quote for testing.')
  await expect(page.locator('.essay figure img')).toHaveCount(1)
  await axe(page)

  await page.goto(`/fa/writing/${essaySlug}`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('نوشتهٔ آزمایشی')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('.fn-ref').first()).toHaveText('۱')
})

test('Visitor 3 — Persian long-form essay on a phone', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  await page.goto('/fa/writing')
  await page.getByRole('link', { name: /نوشتهٔ آزمایشی/ }).click()
  await expect(page).toHaveURL(new RegExp(`/fa/writing/${essaySlug}$`))
  const metrics = await page.locator('.essay p').first().evaluate((el) => {
    const cs = getComputedStyle(el)
    return { size: parseFloat(cs.fontSize), lh: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize), family: cs.fontFamily, dir: cs.direction }
  })
  expect(metrics.size).toBeGreaterThanOrEqual(17)
  expect(metrics.lh).toBeGreaterThanOrEqual(1.9)
  expect(metrics.family).toContain('Vazirmatn')
  expect(metrics.dir).toBe('rtl')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
  // Footnote link jumps to the note and back.
  await page.locator('.fn-ref').first().click()
  await expect(page).toHaveURL(/#fn-1$/)
  await axe(page)
  // Mobile menu: opens, traps focus, closes with Escape.
  await page.getByRole('button', { name: 'منو' }).click()
  await expect(page.locator('#mobile-menu')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('#mobile-menu')).toBeHidden()
  await ctx.close()
})

// ---------------------------------------------------------------------------
test('Visitor 4 — gallery representative: works index → project → CV PDF download', async ({ page, request }) => {
  const pdf = await uploadMedia(request, auth, tinyPdf(), 'qa-cv.pdf', { title: 'CV' }, 'application/pdf')
  created.media.push(pdf.id)
  await request.post('/api/globals/profile?locale=en', { headers: auth, data: { cvPdf: pdf.id } })

  await page.goto('/en/works')
  await axe(page)
  await page.getByRole('link', { name: /CONATUS/ }).first().click()
  await expect(page).toHaveURL(/\/en\/works\/conatus$/)
  await page.goto('/en/cv')
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Download CV (PDF)' }).click()])
  expect(download.suggestedFilename()).toMatch(/\.pdf$/)
})

// ---------------------------------------------------------------------------
test('Admin 1 — log in, create project, upload 8 photos, reorder, preview, publish', async ({ page, request, browser }) => {
  await page.goto('/admin/login')
  await page.locator('#field-email').fill(ADMIN.email)
  await page.locator('#field-password').fill(ADMIN.password)
  await page.getByRole('button', { name: /log ?in/i }).click()
  await expect(page.getByText('Studio overview')).toBeVisible()

  // Create the project in the admin UI (autosave creates the draft).
  await page.goto('/admin/collections/projects/create')
  await page.waitForURL(/\/admin\/collections\/projects\/\d+/, { timeout: 30_000 })
  const id = Number(page.url().match(/projects\/(\d+)/)![1])
  created.projects.push(id)
  const title = `QA Project ${Date.now()}`
  await page.locator('#field-title').fill(title)
  await expect
    .poll(async () => (await (await request.get(`/api/projects/${id}?draft=true`, { headers: auth })).json()).title, { timeout: 20_000 })
    .toBe(title)

  // Upload eight photographs with metadata.
  const ids: number[] = []
  for (let i = 1; i <= 8; i++) {
    const m = await uploadMedia(request, auth, await testJpeg(i, i % 2 ? 1500 : 2000, i % 2 ? 2000 : 1300), `qa-${i}.jpg`, {
      alt: `QA photograph ${i}`,
      title: `QA photograph ${i}`,
      year: '2025',
    })
    ids.push(m.id)
    created.media.push(m.id)
  }
  const reordered = [...ids].reverse()
  const upd = await request.patch(`/api/projects/${id}?draft=true`, {
    headers: auth,
    data: { sequence: [{ blockType: 'series', layout: 'single', images: reordered }], cover: reordered[0] },
  })
  expect(upd.ok()).toBeTruthy()
  const slug = (await upd.json()).doc.slug

  // Unpublished: hidden from the public, visible in the editor's preview.
  expect((await request.get(`/en/works/${slug}`)).status()).toBe(404)
  await page.goto(`/preview?path=/en/works/${slug}`)
  await expect(page.locator('.preview-bar')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  const alts = await page.locator('.sequence img').evaluateAll((els) => els.map((e) => e.getAttribute('alt')))
  expect(alts).toEqual(reordered.map((_, i) => `QA photograph ${8 - i}`))
  await page.goto('/preview/exit?path=/en')

  // Publish and check as an anonymous visitor.
  const pub = await request.patch(`/api/projects/${id}`, { headers: auth, data: { _status: 'published' } })
  expect(pub.ok()).toBeTruthy()
  const anon = await browser.newPage()
  await anon.goto(`/en/works/${slug}`)
  await expect(anon.locator('.sequence img')).toHaveCount(8)
  await anon.goto('/en/works')
  await expect(anon.getByRole('link', { name: new RegExp(title) })).toBeVisible()
  await anon.close()
})

// ---------------------------------------------------------------------------
test('Admin 3 — replace a photograph, keep URL, ID and metadata', async ({ request, page }) => {
  const project = (await (await request.get('/api/projects?where[slug][equals]=conatus&depth=2', { headers: auth })).json()).docs[0]
  const series = project.sequence.find((b: { blockType: string }) => b.blockType === 'singleImage')
  const media = series.image
  const before = { id: media.id, title: media.title, alt: media.alt, filename: media.filename }
  // Keep the exact original bytes so the suite can restore them afterwards.
  const originalBytes = await (await request.get(media.url)).body()

  const res = await request.patch(`/api/media/${media.id}`, {
    headers: auth,
    multipart: {
      file: { name: 'replacement-original.jpg', mimeType: 'image/jpeg', buffer: await testJpeg(99, 2000, 2500, '#b8b0a0') },
      _payload: JSON.stringify({}),
    },
  })
  expect(res.ok()).toBeTruthy()
  const after = (await res.json()).doc
  expect(after.id).toBe(before.id)
  expect(after.title).toBe(before.title)
  expect(after.alt).toBe(before.alt)
  expect(after.filename).not.toBe(before.filename)

  await page.goto('/en/works/conatus')
  const srcs = await page.locator('.sequence img').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src))
  expect(srcs.some((s) => s.includes('replacement-original'))).toBeTruthy()
  // The artwork permalink still resolves.
  expect((await request.get('/en/works/conatus/1')).status()).toBe(200)

  // Restore the seeded placeholder so the suite is repeatable.
  const restore = await request.patch(`/api/media/${media.id}`, {
    headers: auth,
    multipart: { file: { name: before.filename, mimeType: media.mimeType, buffer: originalBytes }, _payload: '{}' },
  })
  expect(restore.ok()).toBeTruthy()
})

// ---------------------------------------------------------------------------
test('Access control — drafts hidden, editor role limited', async ({ request }) => {
  const drafts = await (await request.get('/api/projects?draft=true&where[_status][equals]=draft')).json()
  expect(drafts.totalDocs).toBe(0)
  expect((await request.get('/en/works/trauma-memory-and-the-body')).status()).toBe(404)

  const email = `editor.${Date.now()}@example.org`
  const u = await request.post('/api/users', { headers: auth, data: { email, password: 'editor-pass-123', role: 'editor', name: 'QA Editor' } })
  expect(u.ok()).toBeTruthy()
  const userId = (await u.json()).doc.id
  const ed = await apiLogin(request, email, 'editor-pass-123')
  expect((await request.post('/api/globals/site-settings', { headers: ed, data: { footerNote: 'x' } })).status()).toBe(403)
  expect((await request.post('/api/users', { headers: ed, data: { email: 'x@example.org', password: 'abcdefgh1', role: 'admin' } })).status()).toBe(403)
  const self = await request.patch(`/api/users/${userId}`, { headers: ed, data: { role: 'admin' } })
  expect((await (await request.get(`/api/users/${userId}`, { headers: auth })).json()).role).toBe('editor')
  expect([200, 403]).toContain(self.status())
  expect((await request.post('/api/globals/profile', { headers: ed, data: { discipline: 'Contemporary photography · Lens-based practice' } })).ok()).toBeTruthy()
  await request.delete(`/api/users/${userId}`, { headers: auth })
})
