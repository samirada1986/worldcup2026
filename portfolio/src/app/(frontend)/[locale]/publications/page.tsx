import { Img } from '@/components/Img'
import { isImage, mediaUrl } from '@/components/media'
import { asMedia, getPublications } from '@/lib/data'
import { num, t, type Locale } from '@/lib/i18n'
import { pageMeta } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return pageMeta(locale, '/publications', { title: t(locale).publications })
}

export default async function Publications({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const d = t(locale)
  const pubs = await getPublications(locale)
  return (
    <>
      <header className="page-head">
        <div className="wrap grid">
          <h1 className="display t">{d.publications}</h1>
        </div>
      </header>
      <div className="wrap">
        {pubs.length === 0 ? (
          <p className="muted">{d.nothingYet}</p>
        ) : (
          <ul className="pub-grid">
            {pubs.map((p) => {
              const cover = asMedia(p.cover)
              const file = asMedia(p.file)
              const href = p.link || (file?.url ? mediaUrl(file.url) : null)
              return (
                <li key={p.id}>
                  {cover && isImage(cover) && <Img media={cover} sizes="(min-width: 768px) 22vw, 45vw" max="card" />}
                  <p className="italic">{href ? <a href={href}>{p.title}</a> : p.title}</p>
                  <p className="caption">{[p.publisher, num(locale, p.year)].filter(Boolean).join(', ')}</p>
                  {p.description && <p className="caption">{p.description}</p>}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}
