import Link from 'next/link'
import { getCategories, getWritings } from '@/lib/data'
import { formatDate, num, t, type Locale } from '@/lib/i18n'
import { readingMinutes } from '@/lib/lexical'
import { pageMeta } from '@/lib/seo'
import type { Category } from '@/payload-types'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return pageMeta(locale, '/writing', { title: t(locale).writing })
}

export default async function WritingIndex({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ topic?: string }>
}) {
  const { locale } = await params
  const { topic } = await searchParams
  const d = t(locale)
  const [writings, allWritings, categories] = await Promise.all([
    getWritings(locale, { topic }),
    getWritings(locale),
    getCategories(locale),
  ])
  const used = new Set(allWritings.flatMap((w) => (w.categories ?? []).map((c) => (typeof c === 'object' ? c.id : c))))
  const topics = categories.filter((c) => used.has(c.id))

  return (
    <>
      <header className="page-head">
        <div className="wrap grid">
          <h1 className="display t">{d.writing}</h1>
        </div>
      </header>
      <div className="wrap">
        {topics.length > 1 && (
          <ul className="filters" aria-label={d.topics}>
            <li>
              <Link href={`/${locale}/writing`} aria-current={!topic ? 'true' : undefined}>
                {d.all}
              </Link>
            </li>
            {topics.map((c) => (
              <li key={c.id}>
                <Link href={`/${locale}/writing?topic=${c.slug}`} aria-current={topic === c.slug ? 'true' : undefined}>
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {writings.length === 0 ? (
          <p className="muted">{d.nothingYet}</p>
        ) : (
          <ul className="index">
            {writings.map((w) => {
              const native = (w.availableIn ?? []).includes(locale)
              const lang: Locale = native ? locale : locale === 'fa' ? 'en' : 'fa'
              const cats = (w.categories ?? []).filter((c): c is Category => typeof c === 'object')
              return (
                <li key={w.id}>
                  <Link className="index-row writing-row" href={`/${locale}/writing/${w.slug}`}>
                    <span className="d meta num">{formatDate(locale, w.publishedDate)}</span>
                    <span className="index-title h2" lang={lang} dir={lang === 'fa' ? 'rtl' : 'ltr'}>
                      {w.title}
                      {!native && <span className="lang-badge">{lang === 'fa' ? 'فارسی' : 'English'}</span>}
                    </span>
                    {w.excerpt && (
                      <span className="x muted" lang={lang} dir={lang === 'fa' ? 'rtl' : 'ltr'} style={{ maxWidth: '40rem' }}>
                        {w.excerpt}
                      </span>
                    )}
                    <span className="tp caption">
                      {cats.map((c) => c.title).join(', ')}
                      {cats.length > 0 && ' · '}
                      {num(locale, readingMinutes(w.content, lang))} {d.minRead}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}
