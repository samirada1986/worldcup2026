import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Img } from '@/components/Img'
import { artworkDetails } from '@/components/Sequence'
import { getProject } from '@/lib/data'
import { num, pad, t, type Locale } from '@/lib/i18n'
import { flattenSequence } from '@/lib/sequence'
import { pageMeta } from '@/lib/seo'

type P = { params: Promise<{ locale: Locale; slug: string; n: string }> }

async function load(locale: Locale, slug: string, n: string) {
  const project = await getProject(locale, slug)
  if (!project) return null
  const items = flattenSequence(project)
  const i = Number.parseInt(n, 10) - 1
  if (!Number.isInteger(i) || i < 0 || i >= items.length) return null
  return { project, items, i, item: items[i] }
}

// Rendered on first request, then cached; CMS changes revalidate the cache.
export const generateStaticParams = async () => []
export const revalidate = 3600

export async function generateMetadata({ params }: P) {
  const { locale, slug, n } = await params
  const r = await load(locale, slug, n)
  if (!r) return {}
  const title = `${r.item.caption || r.item.media.title || `${t(locale).image} ${pad(locale, r.i + 1)}`} — ${r.project.title}`
  return pageMeta(locale, `/works/${slug}/${n}`, {
    title,
    description: [r.item.media.caption, artworkDetails(locale, r.item.media)].filter(Boolean).join(' — '),
    image: r.item.media,
  })
}

/** Permalink for a single artwork – an entry point for editors and press. */
export default async function ArtworkPage({ params }: P) {
  const { locale, slug, n } = await params
  const d = t(locale)
  const r = await load(locale, slug, n)
  if (!r) notFound()
  const { project, items, i, item } = r
  const m = item.media
  const title = item.caption || m.title
  const base = `/${locale}/works/${slug}`

  return (
    <article className="artwork-page" style={{ paddingBlockStart: 'var(--s-6)' }}>
      <div className="wrap grid">
        <figure className="img artwork">
          <Img media={m} sizes="(min-width: 1024px) 72vw, 100vw" priority />
        </figure>
        <div className="info">
          <p className="label num">
            {pad(locale, i + 1)} / {pad(locale, items.length)}
          </p>
          <h1 className="h2" style={{ marginBlockStart: 'var(--s-3)' }}>
            {title || `${d.image} ${pad(locale, i + 1)}`}
          </h1>
          <dl className="project-meta" style={{ marginBlockStart: 'var(--s-5)' }}>
            <dt>{d.partOf}</dt>
            <dd>
              <Link href={base} className="italic">
                {project.title}
              </Link>
            </dd>
            {m.year && (
              <>
                <dt>{d.year}</dt>
                <dd className="num">{num(locale, m.year)}</dd>
              </>
            )}
            {m.medium && (
              <>
                <dt>{d.medium}</dt>
                <dd>{m.medium}</dd>
              </>
            )}
            {m.dimensions && (
              <>
                <dt>{d.dimensions}</dt>
                <dd className="num">{num(locale, m.dimensions)}</dd>
              </>
            )}
            {m.credit && (
              <>
                <dt>{d.edition}</dt>
                <dd>{m.credit}</dd>
              </>
            )}
          </dl>
          {m.caption && <p className="meta" style={{ marginBlockStart: 'var(--s-5)' }}>{m.caption}</p>}
          {m.isPlaceholder && <p className="placeholder-note" style={{ marginBlockStart: 'var(--s-5)' }}>{d.placeholder}</p>}
          <nav className="pager" aria-label={`${d.previous} / ${d.next}`} style={{ marginBlockStart: 'var(--s-7)' }}>
            {i > 0 && (
              <Link href={`${base}/${i}`} rel="prev">
                <span className="label">{d.previous}</span>
              </Link>
            )}
            {i < items.length - 1 && (
              <Link href={`${base}/${i + 2}`} rel="next" className="next">
                <span className="label">{d.next}</span>
              </Link>
            )}
          </nav>
          <ul className="plain-list" style={{ marginBlockStart: 'var(--s-6)' }}>
            <li>
              <Link href={base} className="link-arrow">{d.backToProject}</Link>
            </li>
            <li>
              <Link href={`/${locale}/about`} className="link-arrow">{d.about} {d.artistName}</Link>
            </li>
            <li>
              <Link href={`/${locale}/contact`} className="link-arrow">{d.contact}</Link>
            </li>
          </ul>
        </div>
      </div>
    </article>
  )
}
