/**
 * QA only: creates (or removes) a clearly labelled test essay in EN + FA so
 * the Writing layouts can be reviewed. Never run against production.
 *   npx tsx qa/demo-content.ts create | remove
 */
import { request } from '@playwright/test'
import 'dotenv/config'
import { apiLogin, essay, testJpeg, uploadMedia } from '../tests/e2e/helpers'

const base = process.env.BASE_URL || 'http://localhost:3000'
const ctx = await request.newContext({ baseURL: base })
const auth = await apiLogin(ctx)
if (process.argv[2] === 'remove') {
  for (const c of ['writings', 'media'] as const) {
    const field = c === 'writings' ? 'title' : 'filename'
    await ctx.delete(`/api/${c}?where[${field}][like]=qa`, { headers: auth })
  }
  console.log('removed')
} else {
  const img = await uploadMedia(ctx, auth, await testJpeg(7, 1800, 1200), 'qa-cover.jpg', { alt: 'QA cover', title: 'QA cover' })
  const res = await ctx.post('/api/writings?locale=en', {
    headers: auth,
    data: { title: 'QA layout test — On returning images', subtitle: 'A test text for typography review', excerpt: 'QA excerpt used to review the listing layout.', availableIn: ['en', 'fa'], content: essay('en', img.id), cover: img.id, _status: 'published' },
  })
  const doc = (await res.json()).doc
  await ctx.patch(`/api/writings/${doc.id}?locale=fa`, {
    headers: auth,
    data: { title: 'QA آزمون صفحه‌آرایی — دربارهٔ تصویرهایی که بازمی‌گردند', subtitle: 'متنی آزمایشی برای بررسی تایپوگرافی', excerpt: 'چکیدهٔ آزمایشی برای بررسی فهرست.', content: essay('fa', img.id), _status: 'published' },
  })
  console.log('created', doc.slug)
}
await ctx.dispose()
