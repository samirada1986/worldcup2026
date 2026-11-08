/**
 * Seeds a fresh database with the site structure.
 *
 *   npm run seed            – idempotent: skips anything that already exists
 *
 * IMPORTANT: no biographical facts, exhibitions, awards or artwork metadata are
 * invented here. Every text that must come from the artist is a visible
 * [bracketed placeholder]; every image is a labelled placeholder that the
 * artist replaces in the media library ("Replace file") with the original.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import sharp from 'sharp'
import config from '../payload.config'

const RATIOS: [number, number][] = [
  [4, 5], [3, 2], [4, 5], [1, 1], [2, 3], [3, 2], [5, 4], [4, 5], [16, 10], [2, 3], [1, 1], [3, 2],
]
const TONES = ['#e3e0d8', '#dcd9d0', '#e8e5de', '#d6d3ca', '#e1ded6', '#d9d6cd']

const placeholderSvg = (w: number, h: number, label: string, n: string, tone: string) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="${tone}"/>
  <rect x="${w * 0.04}" y="${w * 0.04}" width="${w - w * 0.08}" height="${h - w * 0.08}" fill="none" stroke="#a9a59b" stroke-width="${Math.max(2, w / 600)}" stroke-dasharray="${w / 80} ${w / 120}"/>
  <text x="50%" y="46%" text-anchor="middle" font-family="Georgia, serif" font-size="${w / 11}" fill="#7d796f">${n}</text>
  <text x="50%" y="56%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${w / 42}" letter-spacing="${w / 300}" fill="#7d796f">${label}</text>
  <text x="50%" y="61%" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${w / 52}" fill="#8f8b81">PLACEHOLDER — AWAITING ORIGINAL PHOTOGRAPH</text>
</svg>`

async function makePlaceholder(i: number, label: string) {
  const [rw, rh] = RATIOS[i % RATIOS.length]
  const long = 2400
  const w = rw >= rh ? long : Math.round((long * rw) / rh)
  const h = rw >= rh ? Math.round((long * rh) / rw) : long
  const n = String(i + 1).padStart(2, '0')
  const svg = placeholderSvg(w, h, label, n, TONES[i % TONES.length])
  return sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toBuffer()
}

const para = (text: string, direction: 'ltr' | 'rtl' = 'ltr') => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction,
        textFormat: 0,
        children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
      },
    ],
  },
})

async function run() {
  const payload = await getPayload({ config })

  // ---- Administrator -------------------------------------------------------
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.SEED_ADMIN_PASSWORD
  const users = await payload.count({ collection: 'users' })
  if (users.totalDocs === 0) {
    if (!password) throw new Error('Set SEED_ADMIN_PASSWORD (and SEED_ADMIN_EMAIL) to create the first administrator.')
    await payload.create({ collection: 'users', data: { email, password, name: 'Administrator', role: 'admin' } })
    payload.logger.info(`Created administrator ${email}`)
  }

  // ---- CONATUS -------------------------------------------------------------
  const existing = await payload.find({ collection: 'projects', where: { slug: { equals: 'conatus' } }, limit: 1, draft: true })
  if (existing.totalDocs === 0) {
    const ids: number[] = []
    for (let i = 0; i < 12; i++) {
      const data = await makePlaceholder(i, 'CONATUS')
      const n = String(i + 1).padStart(2, '0')
      const doc = await payload.create({
        collection: 'media',
        data: {
          alt: `Placeholder for CONATUS image ${n} — original photograph not yet uploaded`,
          title: `[CONATUS ${n} — title to be provided]`,
          isPlaceholder: true,
        },
        file: { data, mimetype: 'image/jpeg', name: `conatus-placeholder-${n}.jpg`, size: data.length },
      })
      const faN = n.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])
      await payload.update({
        collection: 'media',
        id: doc.id,
        locale: 'fa',
        data: {
          alt: `جایگزین موقت تصویر ${faN} کوناتوس — عکس اصلی هنوز بارگذاری نشده است`,
          title: `[کوناتوس ${faN} — عنوان را هنرمند وارد می‌کند]`,
        },
      })
      ids.push(doc.id as number)
    }

    const project = await payload.create({
      collection: 'projects',
      draft: false,
      data: {
        _status: 'published',
        title: 'CONATUS',
        slug: 'conatus',
        projectState: 'completed',
        featured: true,
        // Wording taken from the project brief; replace with the artist's own text.
        summary:
          'CONATUS explores persistence, transformation, natural forms, and the complex relationship between continuity and change.',
        statement: para(
          '[Project statement — to be copied from the CONATUS documentation provided by the artist. Year, medium and image titles are left empty until the original materials are supplied.]',
        ),
        cover: ids[0],
        // A demonstration composition using every layout. Rebuild it to follow
        // the sequence of the original CONATUS documentation.
        sequence: [
          { blockType: 'singleImage', image: ids[0], size: 'large', align: 'center' },
          { blockType: 'spread', left: ids[1], right: ids[2], variant: 'firstLarge', valign: 'end' },
          { blockType: 'singleImage', image: ids[3], size: 'medium', align: 'end' },
          { blockType: 'fullBleed', image: ids[8], margins: false },
          { blockType: 'series', images: [ids[4], ids[5], ids[6], ids[7]], layout: 'alternate' },
          { blockType: 'spacer', size: 'm' },
          { blockType: 'spread', left: ids[9], right: ids[10], variant: 'equal', valign: 'start' },
          { blockType: 'singleImage', image: ids[11], size: 'wide', align: 'center' },
        ],
      },
    })
    await payload.update({
      collection: 'projects',
      id: project.id,
      locale: 'fa',
      draft: false,
      data: {
        _status: 'published',
        title: 'کوناتوس',
        // Draft translation of the brief – to be reviewed by the artist.
        summary: 'کوناتوس به ماندگاری، دگرگونی، فرم‌های طبیعی و رابطهٔ پیچیدهٔ میان پیوستگی و تغییر می‌پردازد.',
        statement: para('[بیانیهٔ پروژه — از مستندات کوناتوس که هنرمند ارائه می‌دهد وارد شود.]', 'rtl'),
      },
    })
    payload.logger.info('Created CONATUS with 12 labelled placeholder images')
  }

  // ---- Future project: unpublished draft --------------------------------------
  const future = await payload.find({ collection: 'projects', where: { slug: { equals: 'trauma-memory-and-the-body' } }, limit: 1, draft: true })
  if (future.totalDocs === 0) {
    await payload.create({
      collection: 'projects',
      draft: true,
      data: {
        _status: 'draft',
        title: 'Trauma, Memory and the Body',
        slug: 'trauma-memory-and-the-body',
        projectState: 'inDevelopment',
        summary: '[Working title — a body of work in development. Not public until published by the artist.]',
      },
    })
    payload.logger.info('Created unpublished draft for the future project')
  }

  // ---- Profile ----------------------------------------------------------------
  const profile = await payload.findGlobal({ slug: 'profile' })
  if (!profile.shortBio) {
    await payload.updateGlobal({
      slug: 'profile',
      locale: 'en',
      data: {
        name: 'Samira Dadashi',
        discipline: 'Contemporary photography · Lens-based practice',
        shortBio: '[Short introduction — to be written by the artist. It appears on the homepage and the About page.]',
        longBio: para('[Extended biography — to be provided by the artist.]'),
        statement: para('[Artist statement — to be provided by the artist.]'),
      },
    })
    await payload.updateGlobal({
      slug: 'profile',
      locale: 'fa',
      data: {
        name: 'سمیرا داداشی',
        discipline: 'عکاسی معاصر · هنر مبتنی بر لنز',
        shortBio: '[معرفی کوتاه — هنرمند می‌نویسد. در صفحهٔ اصلی و صفحهٔ درباره نمایش داده می‌شود.]',
        longBio: para('[زندگی‌نامهٔ کامل — هنرمند ارائه می‌دهد.]', 'rtl'),
        statement: para('[بیانیهٔ هنری — هنرمند ارائه می‌دهد.]', 'rtl'),
      },
    })
  }

  // ---- Site settings --------------------------------------------------------
  const conatus = await payload.find({ collection: 'projects', where: { slug: { equals: 'conatus' } }, limit: 1, depth: 0 })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  if (!settings.heroProject && conatus.docs[0]) {
    await payload.updateGlobal({
      slug: 'site-settings',
      locale: 'en',
      data: {
        heroProject: conatus.docs[0].id,
        siteTitle: 'Samira Dadashi',
        siteDescription: 'Samira Dadashi — contemporary photographic artist. Projects, writing and CV.',
        copyrightHolder: 'Samira Dadashi',
        contactFormEnabled: true,
      },
    })
    await payload.updateGlobal({
      slug: 'site-settings',
      locale: 'fa',
      data: {
        siteTitle: 'سمیرا داداشی',
        siteDescription: 'سمیرا داداشی — هنرمند عکاس معاصر. پروژه‌ها، نوشته‌ها و رزومه.',
        copyrightHolder: 'سمیرا داداشی',
      },
    })
  }

  payload.logger.info('Seed complete.')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
