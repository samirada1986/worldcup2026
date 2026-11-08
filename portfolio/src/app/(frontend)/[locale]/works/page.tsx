import Link from 'next/link'
import { Img } from '@/components/Img'
import { isImage } from '@/components/media'
import { stateLabel } from '@/components/ProjectBits'
import { asMedia, getProjects } from '@/lib/data'
import { num, pad, t, type Locale } from '@/lib/i18n'
import { flattenSequence } from '@/lib/sequence'
import { pageMeta } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return pageMeta(locale, '/works', { title: t(locale).works })
}

const STATES = ['completed', 'ongoing', 'inDevelopment'] as const

export default async function Works({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ status?: string }>
}) {
  const { locale } = await params
  const { status } = await searchParams
  const d = t(locale)
  const all = await getProjects(locale)
  // Filters appear only once the archive is large enough to need them.
  const usedStates = STATES.filter((s) => all.some((p) => (p.projectState ?? 'completed') === s))
  const showFilters = all.length >= 6 && usedStates.length > 1
  const projects = showFilters && status ? all.filter((p) => (p.projectState ?? 'completed') === status) : all

  return (
    <>
      <header className="page-head">
        <div className="wrap grid">
          <h1 className="display t">{d.works}</h1>
          <p className="aside meta num">
            {locale === 'fa' ? `${num(locale, all.length)} پروژه` : `${all.length} ${all.length === 1 ? 'project' : 'projects'}`}
          </p>
        </div>
      </header>
      <div className="wrap">
        {showFilters && (
          <ul className="filters" aria-label={d.status}>
            <li>
              <Link href={`/${locale}/works`} aria-current={!status ? 'true' : undefined}>
                {d.all}
              </Link>
            </li>
            {usedStates.map((s) => (
              <li key={s}>
                <Link href={`/${locale}/works?status=${s}`} aria-current={status === s ? 'true' : undefined}>
                  {stateLabel(locale, s)}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {projects.length === 0 ? (
          <p className="muted">{d.nothingYet}</p>
        ) : (
          <ol className="index">
            {projects.map((p, i) => {
              const cover = asMedia(p.cover)
              const count = flattenSequence(p).length
              return (
                <li key={p.id}>
                  <Link className="index-row works-row" href={`/${locale}/works/${p.slug}`}>
                    <span className="n label num">{pad(locale, i + 1)}</span>
                    <span className="thumb">
                      {cover && isImage(cover) && (
                        <Img media={cover} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 36vw, 80vw" max="card" alt="" />
                      )}
                    </span>
                    <span className="index-title h2">{p.title}</span>
                    <span className="m meta">
                      {[num(locale, p.year), p.medium].filter(Boolean).join(' · ')}
                      {count > 0 && (
                        <>
                          <br />
                          {d.imagesCount(count)}
                        </>
                      )}
                    </span>
                    <span className="s label">{stateLabel(locale, p.projectState)}</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </>
  )
}
