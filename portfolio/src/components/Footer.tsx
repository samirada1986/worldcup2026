import Link from 'next/link'
import type { Profile, SiteSetting } from '@/payload-types'
import { num, t, type Locale } from '@/lib/i18n'
import { LangSwitch } from './Header'

export function Footer({ locale, profile, settings }: { locale: Locale; profile: Profile; settings: SiteSetting }) {
  const d = t(locale)
  const year = num(locale, new Date().getFullYear())
  const href = (p: string) => `/${locale}${p}`
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="grid">
          <div className="footer-col--wide">
            <p>{profile.name || d.artistName}</p>
            {settings.footerNote && <p className="muted">{settings.footerNote}</p>}
            <p className="muted">
              © {year} {settings.copyrightHolder || profile.name}. {d.rights}
            </p>
          </div>
          <div className="footer-col">
            <ul>
              {profile.email && (
                <li>
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </li>
              )}
              {profile.instagram && (
                <li>
                  <a href={`https://www.instagram.com/${profile.instagram.replace(/^@/, '')}/`} rel="me noopener" target="_blank">
                    {d.instagram}
                  </a>
                </li>
              )}
              <li>
                <Link href={href('/contact')}>{d.contact}</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <ul>
              <li>
                <Link href={href('/cv')}>{d.cv}</Link>
              </li>
              <li>
                <Link href={href('/exhibitions')}>{d.exhibitions}</Link>
              </li>
              <li>
                <Link href={href('/publications')}>{d.publications}</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <LangSwitch locale={locale} label={d.switchTo} title={d.switchLabel} />
          </div>
        </div>
      </div>
    </footer>
  )
}
