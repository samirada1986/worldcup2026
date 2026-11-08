import Link from 'next/link'
import { Img } from '@/components/Img'
import { isImage } from '@/components/media'
import { stateLabel } from '@/components/ProjectBits'
import { asMedia, getProfile, getProjects, getSettings, getWritings } from '@/lib/data'
import { formatDate, num, pad, t, type Locale } from '@/lib/i18n'
import type { Project } from '@/payload-types'
import { pageMeta } from '@/lib/seo'
import { flattenSequence } from '@/lib/sequence'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return pageMeta(locale, '', { absoluteTitle: true })
}

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const d = t(locale)
  const [settings, profile, projects] = await Promise.all([getSettings(locale), getProfile(locale), getProjects(locale)])
  const writingCount = settings.writingCount ?? 3
  const writings = writingCount > 0 ? await getWritings(locale, { limit: writingCount }) : []

  const visible = new Map(projects.map((p) => [p.id, p]))
  const chosen = (settings.selectedProjects ?? [])
    .map((p) => (typeof p === 'object' && p ? visible.get(p.id) : visible.get(p as number)))
    .filter(Boolean) as Project[]
  const selected = chosen.length ? chosen : projects.filter((p) => p.featured)
  const selectedList = selected.length ? selected : projects.slice(0, 3)

  const heroProject = typeof settings.heroProject === 'object' && settings.heroProject ? settings.heroProject : selectedList[0]
  const heroImage = asMedia(settings.heroImage) ?? asMedia(heroProject?.cover)

  return (
    <>
      <h1 className="visually-hidden">{profile.name || d.artistName}</h1>
      {heroImage && isImage(heroImage) && (
        <section className="hero" aria-label={heroProject?.title ?? ''}>
          <div className="wrap grid">
            <figure className="hero-image artwork">
              <Link href={heroProject?.slug ? `/${locale}/works/${heroProject.slug}` : `/${locale}/works`}>
                <Img media={heroImage} sizes="(min-width: 1024px) 75vw, 100vw" priority />
              </Link>
            </figure>
            <div className="hero-caption">
              {heroProject && (
                <>
                  <p className="h3 italic">{heroProject.title}</p>
                  <p className="caption">
                    {[heroImage.title, num(locale, heroImage.year || heroProject.year)].filter(Boolean).join(', ')}
                  </p>
                  <p style={{ marginBlockStart: 'var(--s-4)' }}>
                    <Link className="link-arrow" href={`/${locale}/works/${heroProject.slug}`}>
                      {d.viewProject}
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {selectedList.length > 0 && (
        <section className="section" aria-labelledby="selected-h">
          <div className="wrap">
            <div className="section-head">
              <h2 id="selected-h" className="label">
                {d.selectedWorks}
              </h2>
              <Link href={`/${locale}/works`}>{d.allWorks}</Link>
            </div>
            {selectedList.map((p, i) => {
              // Avoid repeating the opening artwork directly below it.
              let cover = asMedia(p.cover)
              if (cover && heroImage && cover.id === heroImage.id) {
                cover = flattenSequence(p).find((x) => x.media.id !== heroImage.id)?.media ?? cover
              }
              return (
                <article key={p.id} className="grid selected-row">
                  <div className="img reveal">
                    {cover && isImage(cover) && (
                      <Link href={`/${locale}/works/${p.slug}`} tabIndex={-1} aria-hidden="true">
                        <Img media={cover} sizes="(min-width: 1024px) 58vw, (min-width: 768px) 62vw, 100vw" max="display" />
                      </Link>
                    )}
                  </div>
                  <div className="txt">
                    <p className="idx label num">{pad(locale, i + 1)}</p>
                    <h3 className="h2">
                      <Link href={`/${locale}/works/${p.slug}`} style={{ textDecoration: 'none' }}>
                        {p.title}
                      </Link>
                    </h3>
                    <p className="meta" style={{ marginBlockStart: 'var(--s-3)' }}>
                      {[num(locale, p.year), p.medium, stateLabel(locale, p.projectState)].filter(Boolean).join(' · ')}
                    </p>
                    {p.summary && <p style={{ marginBlockStart: 'var(--s-4)' }}>{p.summary}</p>}
                    <p style={{ marginBlockStart: 'var(--s-5)' }}>
                      <Link className="link-arrow" href={`/${locale}/works/${p.slug}`} aria-label={`${d.viewProject}: ${p.title}`}>
                        {d.viewProject}
                      </Link>
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {settings.showIntro !== false && profile.shortBio && (
        <section className="section intro" aria-labelledby="intro-h">
          <div className="wrap">
            <div className="section-head">
              <h2 id="intro-h" className="label">
                {d.about}
              </h2>
            </div>
            <div className="grid">
              <p className="lead">{profile.shortBio}</p>
              <p className="more">
                <Link className="link-arrow" href={`/${locale}/about`}>
                  {d.biographyCv}
                </Link>
              </p>
            </div>
          </div>
        </section>
      )}

      {writings.length > 0 && (
        <section className="section" aria-labelledby="writing-h">
          <div className="wrap">
            <div className="section-head">
              <h2 id="writing-h" className="label">
                {d.latestWriting}
              </h2>
              <Link href={`/${locale}/writing`}>{d.allWriting}</Link>
            </div>
            <ul className="index" style={{ borderBlockStart: 0 }}>
              {writings.map((w) => {
                const native = (w.availableIn ?? []).includes(locale)
                const lang = native ? locale : locale === 'fa' ? 'en' : 'fa'
                return (
                  <li key={w.id}>
                    <Link className="index-row writing-row" href={`/${locale}/writing/${w.slug}`}>
                      <span className="d meta num">{formatDate(locale, w.publishedDate, { year: 'numeric', month: 'short' })}</span>
                      <span className="index-title h3" lang={lang} dir={lang === 'fa' ? 'rtl' : 'ltr'}>
                        {w.title}
                      </span>
                      {w.excerpt && <span className="x muted" lang={lang}>{w.excerpt}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
