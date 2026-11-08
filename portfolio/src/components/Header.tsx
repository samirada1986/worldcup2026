'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { Locale } from '@/lib/i18n'

export type NavItem = { label: string; path: string }

type Props = {
  locale: Locale
  wordmark: string
  nav: NavItem[]
  secondary: NavItem[]
  labels: { menu: string; close: string; switchTo: string; switchLabel: string; nav: string }
}

export function swapLocale(pathname: string, to: Locale) {
  const parts = pathname.split('/')
  parts[1] = to
  return parts.join('/') || `/${to}`
}

export function LangSwitch({ locale, label, title }: { locale: Locale; label: string; title: string }) {
  const pathname = usePathname() || `/${locale}`
  const to: Locale = locale === 'fa' ? 'en' : 'fa'
  return (
    <a className="lang-switch" href={swapLocale(pathname, to)} hrefLang={to} lang={to} title={title} aria-label={title}>
      {label}
    </a>
  )
}

export function Header({ locale, wordmark, nav, secondary, labels }: Props) {
  const pathname = usePathname() || ''
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname
  const setOpen = (v: boolean) => setOpenOn(v ? pathname : null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const first = menuRef.current?.querySelector<HTMLElement>('a, button')
    first?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenOn(null)
        buttonRef.current?.focus()
      }
      if (e.key === 'Tab' && menuRef.current) {
        const els = Array.from(menuRef.current.querySelectorAll<HTMLElement>('a, button'))
        const i = els.indexOf(document.activeElement as HTMLElement)
        if (e.shiftKey && i <= 0) {
          e.preventDefault()
          els[els.length - 1]?.focus()
        } else if (!e.shiftKey && i === els.length - 1) {
          e.preventDefault()
          els[0]?.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const href = (p: string) => `/${locale}${p === '/' ? '' : p}`
  const isCurrent = (p: string) => pathname === href(p) || pathname.startsWith(href(p) + '/')

  return (
    <header className="site-header">
      <div className="wrap">
        <Link href={`/${locale}`} className="wordmark">
          {wordmark}
        </Link>
        <nav className="nav" aria-label={labels.nav}>
          <ul>
            {nav.map((n) => (
              <li key={n.path}>
                <Link href={href(n.path)} aria-current={isCurrent(n.path) ? 'page' : undefined}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-tools">
          <LangSwitch locale={locale} label={labels.switchTo} title={labels.switchLabel} />
          <button
            ref={buttonRef}
            type="button"
            className="menu-button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            {labels.menu}
          </button>
        </div>
      </div>
      <div
        id="mobile-menu"
        className="mobile-menu"
        data-open={open}
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label={labels.menu}
        hidden={!open}
      >
        <div className="top">
          <Link href={`/${locale}`} className="wordmark">
            {wordmark}
          </Link>
          <button
            type="button"
            className="menu-button"
            onClick={() => {
              setOpen(false)
              buttonRef.current?.focus()
            }}
          >
            {labels.close}
          </button>
        </div>
        <ul>
          {nav.map((n) => (
            <li key={n.path}>
              <Link href={href(n.path)} aria-current={isCurrent(n.path) ? 'page' : undefined}>
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="secondary">
          {secondary.map((n) => (
            <Link key={n.path} href={href(n.path)}>
              {n.label}
            </Link>
          ))}
          <LangSwitch locale={locale} label={labels.switchTo} title={labels.switchLabel} />
        </div>
      </div>
    </header>
  )
}
