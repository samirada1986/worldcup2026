'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { t } from '@/lib/i18n'

export default function NotFound() {
  const locale = usePathname()?.startsWith('/fa') ? 'fa' : 'en'
  const d = t(locale)
  return (
    <header className="page-head">
      <div className="wrap grid">
        <h1 className="display t">404</h1>
        <div className="aside">
          <p>{d.notFound}</p>
          <p style={{ marginBlockStart: 'var(--s-4)' }}>
            <Link className="link-arrow" href={`/${locale}`}>
              {d.goHome}
            </Link>
          </p>
        </div>
      </div>
    </header>
  )
}
