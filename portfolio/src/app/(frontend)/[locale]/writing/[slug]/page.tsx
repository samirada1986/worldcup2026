import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Img } from '@/components/Img'
import { isImage } from '@/components/media'
import { Footnotes, RichText } from '@/components/RichText'
import { asMedia, getWriting } from '@/lib/data'
import { formatDate, num, t, type Locale } from '@/lib/i18n'
import { readingMinutes } from '@/lib/lexical'
import { pageMeta } from '@/lib/seo'
import type { Category, Project, Writing } from '@/payload-types'

type P = { params: Promise<{ locale: Locale; slug: string }> }

/**
 * A text written in one language only is shown in that language on both
 * sites (with a note), so the Persian archive never shows fallback English
 * mislabelled as Persian, and vice-versa.
 */
async function load(locale: Locale, slug: string) {
  const w = await getWriting(locale, slug)
  if (!w) return null
  const langs = (w.availableIn ?? []) as Locale[]
  if (langs.includes(locale) || langs.length === 0) return { w, lang: locale, langs }
  const lang = langs[0]
  const native = await getWriting(lang, slug)
  return native ? { w: native, lang, langs } : null
}

// Rendered on first request, then cached; CMS changes revalidate the cache.
export const generateStaticParams = async () => []
export const revalidate = 3600

export async function generateMetadata({ params }: P) {
  const { locale, slug } = await params
  const r = await load(locale, slug)
  if (!r) return {}
  return pageMeta(locale, `/writing/${slug}`, {
    title: r.w.meta?.title || r.w.title,
    description: r.w.meta?.description || r.w.excerpt,
    image: asMedia(r.w.meta?.image) ?? asMedia(r.w.cover),
    locales: r.langs.length ? r.langs : undefined,
    type: 'article',
  })
}

export default async function WritingPage({ params }: P) {
  const { locale, slug } = await params
  const r = await load(locale, slug)
  if (!r) notFound()
  const { w, lang, langs } = r
  const d = t(locale)
  const dl = t(lang)
  const dir = lang === 'fa' ? 'rtl' : 'ltr'
  const cover = asMedia(w.cover)
  const cats = (w.categories ?? []).filter((c): c is Category => typeof c === 'object')
  const other: Locale = locale === 'fa' ? 'en' : 'fa'
  const related = (w.relatedWritings ?? []).filter((x): x is Writing => typeof x === 'object' && !!x && x._status !== 'draft')
  const projects = (w.relatedProjects ?? []).filter((x): x is Project => typeof x === 'object' && !!x && x._status !== 'draft')
  const minutes = readingMinutes(w.content, lang)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: w.title,
    datePublished: w.publishedDate,
    inLanguage: lang,
    author: { '@type': 'Person', name: d.artistName },
  }

  return (
    <article lang={lang} dir={dir}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="essay-head wrap">
        {cats.length > 0 && <p className="label" style={{ marginBlockEnd: 'var(--s-5)' }}>{cats.map((c) => c.title).join(' · ')}</p>}
        <h1 className="title">{w.title}</h1>
        {w.subtitle && <p className="sub lead muted">{w.subtitle}</p>}
        <p className="meta">
          <time dateTime={w.publishedDate}>{formatDate(lang, w.publishedDate)}</time>
          <span aria-hidden="true">·</span>
          <span>
            {num(lang, minutes)} {dl.minRead}
          </span>
          {lang === locale && langs.includes(other) && (
            <>
              <span aria-hidden="true">·</span>
              <Link href={`/${other}/writing/${slug}`} hrefLang={other} lang={other}>
                {other === 'fa' ? 'فارسی' : 'English'}
              </Link>
            </>
          )}
        </p>
      </header>

      {lang !== locale && (
        <p className="notice" lang={locale} dir={locale === 'fa' ? 'rtl' : 'ltr'}>
          {dl.onlyIn}
        </p>
      )}

      {cover && isImage(cover) && (
        <figure className="essay-cover wrap artwork">
          <Img media={cover} sizes="(min-width: 1024px) 64rem, 100vw" priority />
          {cover.caption && <figcaption className="caption">{cover.caption}</figcaption>}
        </figure>
      )}

      <div className="wrap">
        <RichText data={w.content} locale={lang} className="essay" footnotes />

        <div className="essay-foot" style={{ marginBlockStart: 'var(--s-8)' }}>
          <Footnotes data={w.content} locale={lang} heading={dl.notes} />
          {w.references && w.references.length > 0 && (
            <section className="notes" aria-labelledby="refs-h">
              <h2 id="refs-h" className="label" style={{ marginBlockEnd: 'var(--s-4)' }}>
                {dl.references}
              </h2>
              <ul className="plain-list">
                {w.references.map((ref) => (
                  <li key={ref.id}>
                    {ref.citation}
                    {ref.url && (
                      <>
                        {' '}
                        <a href={ref.url} rel="noopener" target="_blank">
                          ↗
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {(related.length > 0 || projects.length > 0) && (
          <div lang={locale} dir={locale === 'fa' ? 'rtl' : 'ltr'} style={{ marginBlockStart: 'var(--section)' }}>
            {projects.length > 0 && (
              <section className="context-block" aria-labelledby="rp-h">
                <h2 id="rp-h" className="label">{d.relatedProjects}</h2>
                <ul className="body plain-list">
                  {projects.map((p) => (
                    <li key={p.id}>
                      <Link href={`/${locale}/works/${p.slug}`} className="h3" style={{ textDecoration: 'none' }}>
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {related.length > 0 && (
              <section className="context-block" aria-labelledby="rw-h">
                <h2 id="rw-h" className="label">{d.relatedWriting}</h2>
                <ul className="body plain-list">
                  {related.map((x) => (
                    <li key={x.id}>
                      <Link href={`/${locale}/writing/${x.slug}`} className="h3" style={{ textDecoration: 'none' }}>
                        {x.title}
                      </Link>{' '}
                      <span className="caption">{formatDate(locale, x.publishedDate, { year: 'numeric', month: 'long' })}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
