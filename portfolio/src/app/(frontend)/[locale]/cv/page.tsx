import { CvSection } from '@/components/CvSection'
import { mediaUrl } from '@/components/media'
import { asMedia, getExhibitions, getProfile, getPublications } from '@/lib/data'
import { exhibitionGroups, exhibitionItems } from '@/lib/exhibitionGroups'
import { t, type Locale } from '@/lib/i18n'
import { pageMeta } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return pageMeta(locale, '/cv', { title: t(locale).cv })
}

export default async function Cv({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const d = t(locale)
  const [p, exhibitions, publications] = await Promise.all([getProfile(locale), getExhibitions(locale), getPublications(locale)])
  const cv = asMedia(locale === 'fa' ? p.cvPdfFa || p.cvPdf : p.cvPdf)
  const list = (xs?: { id?: string | null; year?: string | null; title: string; detail?: string | null }[] | null) => xs ?? []

  const sections = [
    { id: 'education', heading: d.education, items: list(p.education) },
    ...exhibitionGroups(d, exhibitions).map((g) => ({ ...g, items: exhibitionItems(locale, g.items) })),
    { id: 'awards', heading: d.awards, items: list(p.awards) },
    { id: 'residencies', heading: d.residencies, items: list(p.residencies) },
    {
      id: 'publications',
      heading: d.publications,
      items: publications.map((x) => ({ id: x.id, year: x.year, title: x.title, italic: true, detail: x.publisher, href: x.link })),
    },
    { id: 'collections', heading: d.collections, items: list(p.collections) },
    { id: 'talks', heading: d.talks, items: list(p.talks) },
  ].filter((s) => s.items.length)

  return (
    <>
      <header className="page-head">
        <div className="wrap grid">
          <h1 className="display t">{d.cv}</h1>
          <div className="aside">
            <p className="meta">{p.name}</p>
            {cv?.url && (
              <a className="button" href={mediaUrl(cv.url)} download style={{ marginBlockStart: 'var(--s-4)' }}>
                {d.downloadCv}
              </a>
            )}
          </div>
        </div>
      </header>
      <div className="wrap">
        {sections.length === 0 ? (
          <p className="muted">{d.cvEmpty}</p>
        ) : (
          sections.map((s) => <CvSection key={s.id} id={`cv-${s.id}`} heading={s.heading} items={s.items} locale={locale} />)
        )}
      </div>
    </>
  )
}
