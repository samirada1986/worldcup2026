import type { APIRequestContext } from '@playwright/test'
import sharp from 'sharp'

export const ADMIN = {
  email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
  password: process.env.SEED_ADMIN_PASSWORD || '',
}

export async function apiLogin(request: APIRequestContext, email = ADMIN.email, password = ADMIN.password) {
  const res = await request.post('/api/users/login', { data: { email, password } })
  if (!res.ok()) throw new Error(`login failed ${res.status()}`)
  const { token } = await res.json()
  return { Authorization: `JWT ${token}` }
}

/** A test photograph: plain tone with a large number (not artwork). */
export async function testJpeg(n: number, w = 1800, h = 1200, tone = '#c9c2b4') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${tone}"/><text x="50%" y="55%" font-size="${h / 4}" text-anchor="middle" font-family="Georgia" fill="#55524b">T${n}</text></svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toBuffer()
}

export async function uploadMedia(
  request: APIRequestContext,
  headers: Record<string, string>,
  buffer: Buffer,
  name: string,
  data: Record<string, unknown>,
  mimeType = 'image/jpeg',
) {
  const res = await request.post('/api/media', {
    headers,
    multipart: { file: { name, mimeType, buffer }, _payload: JSON.stringify(data) },
  })
  if (!res.ok()) throw new Error(`upload failed ${res.status()} ${await res.text()}`)
  return (await res.json()).doc as { id: number; url: string; filename: string }
}

/** Minimal valid PDF for CV download tests. */
export const tinyPdf = () =>
  Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n170\n%%EOF',
  )

let k = 0
const id = () => `t${Date.now().toString(36)}${k++}`
const text = (t: string) => ({ type: 'text', text: t, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })
const p = (...children: object[]) => ({ type: 'paragraph', format: '', indent: 0, version: 1, direction: null, textFormat: 0, children })

export function essay(lang: 'en' | 'fa', imageId: number) {
  const body =
    lang === 'en'
      ? 'This is a QA test paragraph used to check long-form reading layout, line length and rhythm on different screens. '
      : 'این بند آزمایشی برای بررسی صفحه‌آرایی متن بلند، طول سطر و ریتم خواندن در صفحه‌های گوناگون است و پس از آزمون حذف می‌شود. '
  const children: object[] = [
    p(text(body.repeat(3)), { type: 'inlineBlock', version: 1, fields: { id: id(), blockType: 'footnote', blockName: '', note: lang === 'en' ? 'First test footnote.' : 'نخستین پانویس آزمایشی.' } }),
    { type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: null, children: [text(lang === 'en' ? 'A section heading' : 'یک عنوان بخش')] },
    p(text(body.repeat(4))),
    { type: 'block', version: 2, format: '', fields: { id: id(), blockName: '', blockType: 'pullQuote', quote: lang === 'en' ? 'A pull quote for testing.' : 'نقل‌قولی برجسته برای آزمون.', attribution: 'QA' } },
    { type: 'upload', version: 3, format: '', relationTo: 'media', value: imageId, fields: { width: 'text' } },
    p(text(body.repeat(5)), { type: 'inlineBlock', version: 1, fields: { id: id(), blockType: 'footnote', blockName: '', note: lang === 'en' ? 'Second test footnote.' : 'دومین پانویس آزمایشی.' } }),
    ...Array.from({ length: 6 }, () => p(text(body.repeat(4)))),
  ]
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: null, children } }
}
