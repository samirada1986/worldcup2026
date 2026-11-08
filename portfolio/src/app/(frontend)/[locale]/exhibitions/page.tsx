import { CvSection } from '@/components/CvSection'
import { getExhibitions } from '@/lib/data'
import { exhibitionGroups, exhibitionItems } from '@/lib/exhibitionGroups'
import { t, type Locale } from '@/lib/i18n'
import { pageMeta } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return pageMeta(locale, '/exhibitions', { title: t(locale).exhibitions })
}

export default async function Exhibitions({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const d = t(locale)
  const all = await getExhibitions(locale)
  const groups = exhibitionGroups(d, all)
  return (
    <>
      <header className="page-head">
        <div className="wrap grid">
          <h1 className="display t">{d.exhibitions}</h1>
        </div>
      </header>
      <div className="wrap">
        {groups.length === 0 ? (
          <p className="muted">{d.nothingYet}</p>
        ) : (
          groups.map((g) => (
            <CvSection key={g.id} id={`ex-${g.id}`} heading={g.heading} items={exhibitionItems(locale, g.items)} locale={locale} />
          ))
        )}
      </div>
    </>
  )
}
