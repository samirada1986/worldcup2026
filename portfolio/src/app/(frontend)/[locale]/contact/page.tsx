import { ContactForm } from '@/components/ContactForm'
import { getProfile, getSettings } from '@/lib/data'
import { issueFormToken } from '@/lib/contact'
import { t, type Locale } from '@/lib/i18n'
import { pageMeta } from '@/lib/seo'
import { sendInquiry } from './actions'

export const dynamic = 'force-dynamic' // fresh anti-spam token per visit

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  return pageMeta(locale, '/contact', { title: t(locale).contact })
}

export default async function Contact({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const d = t(locale)
  const [p, s] = await Promise.all([getProfile(locale), getSettings(locale)])
  return (
    <>
      <header className="page-head">
        <div className="wrap grid">
          <h1 className="display t">{d.contact}</h1>
        </div>
      </header>
      <div className="wrap grid contact-grid">
        <div className="info">
          <p className="lead" style={{ marginBlockEnd: 'var(--s-7)' }}>{d.contactIntro}</p>
          {p.email && (
            <p style={{ marginBlockEnd: 'var(--s-6)' }}>
              <span className="label" style={{ display: 'block', marginBlockEnd: 'var(--s-2)' }}>{d.email}</span>
              <a className="contact-email" href={`mailto:${p.email}`} dir="ltr">
                {p.email}
              </a>
            </p>
          )}
          {p.instagram && (
            <p style={{ marginBlockEnd: 'var(--s-6)' }}>
              <span className="label" style={{ display: 'block', marginBlockEnd: 'var(--s-2)' }}>{d.instagram}</span>
              <a href={`https://www.instagram.com/${p.instagram.replace(/^@/, '')}/`} rel="me noopener" target="_blank" dir="ltr">
                @{p.instagram.replace(/^@/, '')}
              </a>
            </p>
          )}
          {p.representation && (
            <p>
              <span className="label" style={{ display: 'block', marginBlockEnd: 'var(--s-2)' }}>{d.representation}</span>
              <span style={{ whiteSpace: 'pre-line' }}>{p.representation}</span>
            </p>
          )}
          {(p.links ?? []).length > 0 && (
            <ul className="plain-list" style={{ marginBlockStart: 'var(--s-6)' }}>
              {p.links!.map((l) => (
                <li key={l.id}>
                  <a href={l.url} rel="noopener" target="_blank">{l.label} ↗</a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {s.contactFormEnabled !== false && (
          <div className="form">
            <ContactForm action={sendInquiry} token={issueFormToken()} locale={locale} d={d.form} />
          </div>
        )}
      </div>
    </>
  )
}
