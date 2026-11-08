import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource-variable/inter'
import '@fontsource-variable/source-serif-4'
import '@fontsource-variable/source-serif-4/wght-italic.css'
import '@fontsource-variable/vazirmatn'
import '@/styles/site.css'

import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { RefreshRouteOnSave } from '@/components/RefreshRouteOnSave'
import { Footer } from '@/components/Footer'
import { Header, type NavItem } from '@/components/Header'
import { RevealObserver } from '@/components/Reveal'
import { getProfile, getSettings } from '@/lib/data'
import { dirOf, isLocale, locales, t, type Locale } from '@/lib/i18n'
import { isPreview } from '@/lib/payload'
import { mediaUrl } from '@/components/media'

// With BUILD_WITHOUT_DB=1 (e.g. Docker image builds) nothing is prerendered:
// pages render on first request and are then cached (ISR).
export const generateStaticParams = () => (process.env.BUILD_WITHOUT_DB ? [] : locales.map((locale) => ({ locale })))
export const revalidate = 3600

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const viewport: Viewport = { themeColor: '#f7f6f2', width: 'device-width', initialScale: 1 }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const s = await getSettings(locale)
  const share = s.shareImage && typeof s.shareImage === 'object' ? s.shareImage : null
  const title = s.siteTitle || t(locale).artistName
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s — ${title}` },
    description: s.siteDescription || undefined,
    openGraph: {
      siteName: title,
      locale: locale === 'fa' ? 'fa_IR' : 'en_GB',
      type: 'website',
      images: share?.url ? [{ url: mediaUrl(share.sizes?.large?.url || share.url) }] : undefined,
    },
    twitter: { card: 'summary_large_image' },
    icons: { icon: '/favicon.svg' },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: l } = await params
  if (!isLocale(l)) notFound()
  const locale = l as Locale
  const d = t(locale)
  const [settings, profile, preview] = await Promise.all([getSettings(locale), getProfile(locale), isPreview()])

  const nav: NavItem[] = settings.navigation?.length
    ? settings.navigation.map((n) => ({ label: n.label, path: n.path }))
    : [
        { label: d.works, path: '/works' },
        { label: d.writing, path: '/writing' },
        { label: d.about, path: '/about' },
        { label: d.contact, path: '/contact' },
      ]
  const secondary: NavItem[] = [
    { label: d.cv, path: '/cv' },
    { label: d.exhibitions, path: '/exhibitions' },
    { label: d.publications, path: '/publications' },
  ]

  return (
    <html lang={locale} dir={dirOf(locale)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        {preview && (
          <div className="preview-bar" role="status">
            <span>{d.preview}</span>
            <a href={`/preview/exit?path=/${locale}`}>{d.exitPreview}</a>
            <RefreshRouteOnSave serverURL={process.env.NEXT_PUBLIC_SERVER_URL || ''} />
          </div>
        )}
        <a href="#main" className="skip-link">
          {d.skip}
        </a>
        <div id="page" style={{ display: 'contents' }}>
          <Header
            locale={locale}
            wordmark={profile.name || d.artistName}
            nav={nav}
            secondary={secondary}
            labels={{ menu: d.menu, close: d.close, switchTo: d.switchTo, switchLabel: d.switchLabel, nav: d.menu }}
          />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer locale={locale} profile={profile} settings={settings} />
        </div>
        <RevealObserver />
      </body>
    </html>
  )
}
