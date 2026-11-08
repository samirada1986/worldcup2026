import type { Payload } from 'payload'
import Link from 'next/link'

type Props = { payload: Payload; i18n?: { language?: string } }

const box: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  padding: '16px 20px',
  borderRadius: 4,
  minWidth: 150,
  flex: '1 1 150px',
}

export async function Dashboard({ payload, i18n }: Props) {
  const fa = i18n?.language === 'fa'
  const t = (en: string, f: string) => (fa ? f : en)
  const count = async (collection: 'projects' | 'writings' | 'media' | 'inquiries', where?: object) =>
    (await payload.count({ collection, where: where as never, overrideAccess: true })).totalDocs

  const [pubProjects, draftProjects, pubWritings, draftWritings, media, newInquiries] = await Promise.all([
    count('projects', { _status: { equals: 'published' } }),
    count('projects', { _status: { equals: 'draft' } }),
    count('writings', { _status: { equals: 'published' } }),
    count('writings', { _status: { equals: 'draft' } }),
    count('media'),
    count('inquiries', { handled: { not_equals: true } }),
  ])
  const placeholders = await count('media', { isPlaceholder: { equals: true } })

  const [recentProjects, recentWritings] = await Promise.all([
    payload.find({ collection: 'projects', sort: '-updatedAt', limit: 5, draft: true, overrideAccess: true, depth: 0 }),
    payload.find({ collection: 'writings', sort: '-updatedAt', limit: 5, draft: true, overrideAccess: true, depth: 0 }),
  ])
  const recent = [
    ...recentProjects.docs.map((d) => ({ ...d, c: 'projects' as const })),
    ...recentWritings.docs.map((d) => ({ ...d, c: 'writings' as const })),
  ]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 6)

  const stats = [
    { label: t('Published projects', 'پروژه‌های منتشرشده'), value: pubProjects, href: '/admin/collections/projects?where[_status][equals]=published' },
    { label: t('Draft projects', 'پروژه‌های پیش‌نویس'), value: draftProjects, href: '/admin/collections/projects?where[_status][equals]=draft' },
    { label: t('Published texts', 'نوشته‌های منتشرشده'), value: pubWritings, href: '/admin/collections/writings?where[_status][equals]=published' },
    { label: t('Draft texts', 'نوشته‌های پیش‌نویس'), value: draftWritings, href: '/admin/collections/writings?where[_status][equals]=draft' },
    { label: t('Media files', 'فایل‌های رسانه'), value: media, href: '/admin/collections/media' },
    { label: t('New messages', 'پیام‌های تازه'), value: newInquiries, href: '/admin/collections/inquiries' },
  ]

  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ marginBottom: 16 }}>{t('Studio overview', 'نمای کلی استودیو')}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        {stats.map((s) => (
          <Link key={s.label} href={s.href} style={{ ...box, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: 32, lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ opacity: 0.7, fontSize: 13 }}>{s.label}</div>
          </Link>
        ))}
      </div>
      {placeholders > 0 && (
        <p style={{ ...box, borderColor: 'var(--theme-warning-500)', marginBottom: 24 }}>
          {t(
            `${placeholders} placeholder image(s) are waiting for original photographs. Open each one in the media library and use "Replace file" – the project pages keep working.`,
            `${placeholders} تصویر موقت در انتظار عکس اصلی است. هر کدام را در کتابخانه رسانه باز کنید و فایل را جایگزین کنید – صفحه‌های پروژه بدون تغییر کار می‌کنند.`,
          )}
        </p>
      )}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <Link className="btn btn--style-primary btn--size-medium" href="/admin/collections/projects/create">
          {t('New project', 'پروژه جدید')}
        </Link>
        <Link className="btn btn--style-secondary btn--size-medium" href="/admin/collections/writings/create">
          {t('New text', 'نوشته جدید')}
        </Link>
        <Link className="btn btn--style-secondary btn--size-medium" href="/admin/collections/media">
          {t('Upload media', 'بارگذاری رسانه')}
        </Link>
        <a className="btn btn--style-secondary btn--size-medium" href={fa ? '/fa' : '/en'} target="_blank" rel="noreferrer">
          {t('View site ↗', 'مشاهده سایت ↗')}
        </a>
      </div>
      <h3 style={{ marginBottom: 8 }}>{t('Recently updated', 'آخرین تغییرات')}</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {recent.map((d) => (
          <li key={`${d.c}-${d.id}`} style={{ padding: '8px 0', borderBottom: '1px solid var(--theme-elevation-100)' }}>
            <Link href={`/admin/collections/${d.c}/${d.id}`}>{String(d.title ?? '—')}</Link>{' '}
            <span style={{ opacity: 0.6, fontSize: 12 }}>
              · {d.c === 'projects' ? t('project', 'پروژه') : t('text', 'نوشته')} ·{' '}
              {d._status === 'published' ? t('published', 'منتشرشده') : t('draft', 'پیش‌نویس')} ·{' '}
              {new Date(d.updatedAt).toLocaleDateString(fa ? 'fa-IR' : 'en-GB')}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
