import type { Metadata } from 'next'
import type { Media } from '@/payload-types'
import { mediaUrl } from '@/components/media'
import { getSettings } from './data'
import { t, type Locale } from './i18n'

type Opts = {
  title?: string | null
  description?: string | null
  image?: Media | null
  absoluteTitle?: boolean
  /** Locales in which this page exists (defaults to both). */
  locales?: Locale[]
  type?: 'website' | 'article'
}

/** Canonical + hreflang alternates + Open Graph for a page path (without locale prefix). */
export async function pageMeta(locale: Locale, path: string, opts: Opts = {}): Promise<Metadata> {
  const settings = await getSettings(locale)
  const siteTitle = settings.siteTitle || t(locale).artistName
  const available = opts.locales ?? ['en', 'fa']
  const languages: Record<string, string> = {}
  for (const l of available) languages[l] = `/${l}${path}`
  if (available.includes('en')) languages['x-default'] = `/en${path}`
  const img = opts.image?.url ? mediaUrl(opts.image.sizes?.large?.url || opts.image.sizes?.display?.url || opts.image.url) : undefined
  const description = opts.description || settings.siteDescription || undefined
  return {
    title: opts.absoluteTitle || !opts.title ? { absolute: opts.title ? `${opts.title} — ${siteTitle}` : siteTitle } : opts.title,
    description,
    alternates: { canonical: `/${locale}${path}`, languages },
    openGraph: {
      title: opts.title ?? siteTitle,
      description,
      url: `/${locale}${path}`,
      type: opts.type ?? 'website',
      ...(img ? { images: [{ url: img, alt: opts.image?.alt ?? '' }] } : {}),
    },
  }
}
