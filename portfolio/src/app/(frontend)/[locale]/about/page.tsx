import Link from 'next/link'
import { Img } from '@/components/Img'
import { isImage, mediaUrl } from '@/components/media'
import { RichText } from '@/components/RichText'
import { asMedia, getProfile } from '@/lib/data'
import { t, type Locale } from '@/lib/i18n'
import { pageMeta } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const p = await getProfile(locale)
  return pageMeta(locale, '/about', { title: t(locale).about, description: p.shortBio, image: asMedia(p.portrait) })
}

export default async function About({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const d = t(locale)
  const p = await getProfile(locale)
  const portrait = asMedia(p.portrait)
  const cv = asMedia(locale === 'fa' ? p.cvPdfFa || p.cvPdf : p.cvPdf)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.name,
    jobTitle: p.discipline || undefined,
    email: p.email || undefined,
    sameAs: [p.instagram ? `https://www.instagram.com/${p.instagram}/` : null, ...(p.links ?? []).map((l) => l.url)].filter(Boolean),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="page-head">
        <div className="wrap grid">
          <h1 className="display t">{p.name || d.artistName}</h1>
          <p className="aside meta">
            {[p.discipline, p.basedIn].filter(Boolean).map((x, i) => (
              <span key={i} style={{ display: 'block' }}>
                {x}
              </span>
            ))}
          </p>
        </div>
      </header>
      <div className="wrap">
        <div className="grid about-grid">
          <div className="portrait">
            {portrait && isImage(portrait) && (
              <figure className="artwork">
                <Img media={portrait} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 35vw, 100vw" max="display" priority />
                {portrait.caption && <figcaption className="caption">{portrait.caption}</figcaption>}
              </figure>
            )}
          </div>
          <div className="bio">
            {p.shortBio && <p className="lead">{p.shortBio}</p>}
            {p.longBio && (
              <section aria-labelledby="bio-h" style={{ marginBlockStart: 'var(--s-7)' }}>
                <h2 id="bio-h" className="label" style={{ marginBlockEnd: 'var(--s-4)' }}>
                  {d.biography}
                </h2>
                <RichText data={p.longBio} locale={locale} className="prose" />
              </section>
            )}
            {p.statement && (
              <section aria-labelledby="st-h" style={{ marginBlockStart: 'var(--s-7)' }}>
                <h2 id="st-h" className="label" style={{ marginBlockEnd: 'var(--s-4)' }}>
                  {d.artistStatement}
                </h2>
                <RichText data={p.statement} locale={locale} className="prose" />
              </section>
            )}
            {p.representation && (
              <section aria-labelledby="rep-h" style={{ marginBlockStart: 'var(--s-7)' }}>
                <h2 id="rep-h" className="label" style={{ marginBlockEnd: 'var(--s-4)' }}>
                  {d.representation}
                </h2>
                <p style={{ whiteSpace: 'pre-line' }}>{p.representation}</p>
              </section>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-4)', marginBlockStart: 'var(--s-7)' }}>
              <Link className="button" href={`/${locale}/cv`}>
                {d.cv}
              </Link>
              {cv?.url && (
                <a className="button button--ghost" href={mediaUrl(cv.url)} download>
                  {d.downloadCv}
                </a>
              )}
              <Link className="button button--ghost" href={`/${locale}/contact`}>
                {d.contact}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
