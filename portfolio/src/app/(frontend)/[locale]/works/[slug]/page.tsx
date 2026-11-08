import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Img } from '@/components/Img'
import { ArtworkTrigger as ViewTrigger, LightboxProvider } from '@/components/Lightbox'
import { fileSize, isImage, mediaUrl } from '@/components/media'
import { stateLabel } from '@/components/ProjectBits'
import { RichText } from '@/components/RichText'
import { lightboxItems, Sequence } from '@/components/Sequence'
import { asMedia, getExhibitionsForProject, getProject, getProjects } from '@/lib/data'
import { dirOf, formatDate, num, t, type Locale } from '@/lib/i18n'
import { flattenSequence } from '@/lib/sequence'
import { pageMeta } from '@/lib/seo'
import type { Writing } from '@/payload-types'

type P = { params: Promise<{ locale: Locale; slug: string }> }

// Rendered on first request, then cached; CMS changes revalidate the cache.
export const generateStaticParams = async () => []
export const revalidate = 3600

export async function generateMetadata({ params }: P) {
  const { locale, slug } = await params
  const p = await getProject(locale, slug)
  if (!p) return {}
  return pageMeta(locale, `/works/${slug}`, {
    title: p.meta?.title || p.title,
    description: p.meta?.description || p.summary,
    image: asMedia(p.meta?.image) ?? asMedia(p.cover),
  })
}

export default async function ProjectPage({ params }: P) {
  const { locale, slug } = await params
  const d = t(locale)
  const project = await getProject(locale, slug)
  if (!project) notFound()

  const [all, exhibitions] = await Promise.all([getProjects(locale), getExhibitionsForProject(locale, project.id)])
  const flat = flattenSequence(project)
  const items = lightboxItems(locale, slug, flat)

  const views = (project.installationViews ?? []).map(asMedia).filter(isImage)
  const viewItems = lightboxItems(locale, slug, views.map((media) => ({ media }))).map((it) => ({ ...it, href: undefined }))
  const pos = all.findIndex((p) => p.id === project.id)
  const prev = pos > 0 ? all[pos - 1] : null
  const next = pos >= 0 && pos < all.length - 1 ? all[pos + 1] : null
  const related = (project.relatedWritings ?? []).filter((w): w is Writing => typeof w === 'object' && w !== null && w._status !== 'draft')
  const docs = (project.documents ?? []).filter((x) => typeof x.file === 'object' && x.file)
  const labels = {
    close: d.close,
    previous: d.previous,
    next: d.next,
    of: d.of,
    image: d.image,
    artworkPage: d.artworkPage,
    openImage: d.openImage,
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    dateCreated: project.year,
    artMedium: project.medium,
    creator: { '@type': 'Person', name: d.artistName },
    inLanguage: locale,
  }

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="page-head">
        <div className="wrap grid">
          <h1 className="display t">{project.title}</h1>
          <dl className="aside project-meta">
            {project.year && (
              <>
                <dt>{d.year}</dt>
                <dd className="num">{num(locale, project.year)}</dd>
              </>
            )}
            {project.medium && (
              <>
                <dt>{d.medium}</dt>
                <dd>{project.medium}</dd>
              </>
            )}
            <dt>{d.status}</dt>
            <dd>{stateLabel(locale, project.projectState)}</dd>
            {flat.length > 0 && (
              <>
                <dt>{d.works_count}</dt>
                <dd className="num">{num(locale, flat.length)}</dd>
              </>
            )}
          </dl>
          {project.summary && <p className="lead project-summary">{project.summary}</p>}
        </div>
      </header>

      {project.statement && (
        <section className="statement wrap" aria-labelledby="statement-h">
          <div className="grid">
            <h2 id="statement-h" className="label">
              {d.statement}
            </h2>
            <RichText data={project.statement} locale={locale} className="prose" />
          </div>
        </section>
      )}

      <LightboxProvider items={items} labels={labels} rtl={dirOf(locale) === 'rtl'}>
        {project.sequence && project.sequence.length > 0 && <Sequence blocks={project.sequence} locale={locale} />}
      </LightboxProvider>

      <div className="wrap" style={{ paddingBlockStart: 'var(--section)' }}>
        {views.length > 0 && (
          <LightboxProvider items={viewItems} labels={labels} rtl={dirOf(locale) === 'rtl'}>
            <section className="context-block" aria-labelledby="views-h">
              <h2 id="views-h" className="label">
                {d.installationViews}
              </h2>
              <div className="body views">
                {views.map((m, i) => (
                  <figure key={m.id} className="artwork">
                    <ViewTrigger index={i}>
                      <Img media={m} sizes="(min-width: 1024px) 25vw, 50vw" max="card" />
                    </ViewTrigger>
                    {m.caption && <figcaption className="caption">{m.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </section>
          </LightboxProvider>
        )}

        {exhibitions.length > 0 && (
          <section className="context-block" aria-labelledby="ex-h">
            <h2 id="ex-h" className="label">
              {d.exhibitedAt}
            </h2>
            <ul className="body plain-list">
              {exhibitions.map((e) => (
                <li key={e.id}>
                  <span className="num muted">{num(locale, e.year)}</span>&ensp;
                  <span className="italic">{e.title}</span>
                  {[e.venue, e.city].filter(Boolean).length > 0 && `, ${[e.venue, e.city].filter(Boolean).join(', ')}`}
                </li>
              ))}
            </ul>
          </section>
        )}

        {docs.length > 0 && (
          <section className="context-block" aria-labelledby="docs-h">
            <h2 id="docs-h" className="label">
              {d.documents}
            </h2>
            <ul className="body plain-list">
              {docs.map((x) => {
                const f = x.file as { url?: string | null; filesize?: number | null }
                return (
                  <li key={x.id}>
                    <a href={mediaUrl(f.url)} download className="link-arrow">
                      {x.label}
                    </a>{' '}
                    <span className="caption">PDF {fileSize(f.filesize)}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="context-block" aria-labelledby="rel-h">
            <h2 id="rel-h" className="label">
              {d.relatedWriting}
            </h2>
            <ul className="body plain-list">
              {related.map((w) => (
                <li key={w.id}>
                  <Link href={`/${locale}/writing/${w.slug}`} className="h3" style={{ textDecoration: 'none' }}>
                    {w.title}
                  </Link>{' '}
                  <span className="caption">{formatDate(locale, w.publishedDate, { year: 'numeric', month: 'long' })}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {project.credits && (
          <section className="context-block" aria-labelledby="cr-h">
            <h2 id="cr-h" className="label">
              {d.credits}
            </h2>
            <p className="body meta" style={{ whiteSpace: 'pre-line' }}>
              {project.credits}
            </p>
          </section>
        )}

        {(prev || next) && (
          <nav className="pager" aria-label={`${d.previousProject} / ${d.nextProject}`} style={{ marginBlockStart: 'var(--section)' }}>
            {prev && (
              <Link href={`/${locale}/works/${prev.slug}`} rel="prev">
                <span className="label">{d.previousProject}</span>
                <span className="h3" style={{ display: 'block', marginBlockStart: 'var(--s-2)' }}>
                  {prev.title}
                </span>
              </Link>
            )}
            {next && (
              <Link href={`/${locale}/works/${next.slug}`} rel="next" className="next">
                <span className="label">{d.nextProject}</span>
                <span className="h3" style={{ display: 'block', marginBlockStart: 'var(--s-2)' }}>
                  {next.title}
                </span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </article>
  )
}

