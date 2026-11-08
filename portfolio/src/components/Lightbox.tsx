'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type LightboxItem = {
  src: string
  srcSet: string
  width: number
  height: number
  alt: string
  number: string
  title?: string
  details?: string
  href?: string
}

type Labels = { close: string; previous: string; next: string; of: string; image: string; artworkPage: string; openImage: string }

type Ctx = { open: (index: number, trigger?: HTMLElement | null) => void; items: LightboxItem[]; labels: Labels }
const LightboxContext = createContext<Ctx | null>(null)

export function LightboxProvider({
  items,
  labels,
  rtl,
  children,
}: {
  items: LightboxItem[]
  labels: Labels
  rtl: boolean
  children: React.ReactNode
}) {
  const [index, setIndex] = useState<number | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const open = useCallback((i: number, trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? null
    setIndex(i)
  }, [])
  const close = useCallback(() => {
    setIndex(null)
    // Return focus to the image that opened the viewer.
    requestAnimationFrame(() => triggerRef.current?.focus())
  }, [])

  return (
    <LightboxContext.Provider value={{ open, items, labels }}>
      {children}
      {index !== null && items[index] && (
        <Viewer items={items} index={index} setIndex={setIndex} onClose={close} labels={labels} rtl={rtl} />
      )}
    </LightboxContext.Provider>
  )
}

export function ArtworkTrigger({ index, children }: { index: number; children: React.ReactNode }) {
  const ctx = useContext(LightboxContext)
  const item = ctx?.items[index]
  if (!ctx || !item) return <>{children}</>
  const label = `${ctx.labels.openImage} ${item.number}${item.title ? ` — ${item.title}` : ''}`
  return (
    <button type="button" className="artwork-button" aria-label={label} onClick={(e) => ctx.open(index, e.currentTarget)}>
      {children}
    </button>
  )
}

function Viewer({
  items,
  index,
  setIndex,
  onClose,
  labels,
  rtl,
}: {
  items: LightboxItem[]
  index: number
  setIndex: (i: number) => void
  onClose: () => void
  labels: Labels
  rtl: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [loading, setLoading] = useState(true)
  const start = useRef<{ x: number; y: number } | null>(null)
  const item = items[index]
  const total = items.length

  const go = useCallback(
    (delta: number) => {
      const next = (index + delta + total) % total
      if (next !== index) {
        setLoading(true)
        setIndex(next)
      }
    },
    [index, total, setIndex],
  )

  // Lock scroll, hide the page from assistive tech, focus the close button.
  useEffect(() => {
    const main = document.getElementById('page')
    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    main?.setAttribute('inert', '')
    closeRef.current?.focus()
    return () => {
      document.documentElement.style.overflow = prevOverflow
      main?.removeAttribute('inert')
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(rtl ? -1 : 1)
      else if (e.key === 'ArrowLeft') go(rtl ? 1 : -1)
      else if (e.key === 'Home') setIndex(0)
      else if (e.key === 'End') setIndex(total - 1)
      else if (e.key === 'Tab' && ref.current) {
        const els = Array.from(ref.current.querySelectorAll<HTMLElement>('button:not([tabindex="-1"]), a'))
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
    return () => document.removeEventListener('keydown', onKey)
  }, [go, onClose, rtl, setIndex, total])

  // Preload neighbours so stepping through a sequence feels immediate.
  useEffect(() => {
    for (const d of [1, -1]) {
      const n = items[(index + d + total) % total]
      if (n) {
        const im = new Image()
        im.sizes = '100vw'
        im.srcset = n.srcSet
        im.src = n.src
      }
    }
  }, [index, items, total])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return
    start.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const s = start.current
    start.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      const forward = dx < 0
      go((forward ? 1 : -1) * (rtl ? -1 : 1))
    } else if (dy > 110 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      onClose()
    }
  }

  const counter = `${item.number} ${labels.of} ${items[total - 1]?.number ?? total}`

  return createPortal(
    <div
      ref={ref}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${labels.image} ${counter}`}
      dir={rtl ? 'rtl' : 'ltr'}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div className="lightbox-bar">
        <span className="num" aria-live="polite">
          {counter}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className="lb-nav">
            <button type="button" className="lb-btn" onClick={() => go(-1)}>
              {labels.previous}
            </button>
            <button type="button" className="lb-btn" onClick={() => go(1)}>
              {labels.next}
            </button>
          </div>
          <button ref={closeRef} type="button" className="lb-btn" onClick={onClose}>
            {labels.close}
          </button>
        </div>
      </div>
      <div className="lightbox-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={item.src}
          src={item.src}
          srcSet={item.srcSet}
          sizes="100vw"
          width={item.width}
          height={item.height}
          alt={item.alt}
          data-loading={loading}
          onLoad={() => setLoading(false)}
          ref={(el) => {
            if (el?.complete) setLoading(false)
          }}
        />
        {total > 1 && (
          <>
            <button type="button" tabIndex={-1} aria-hidden="true" className="lightbox-hit prev" onClick={() => go(-1)} />
            <button type="button" tabIndex={-1} aria-hidden="true" className="lightbox-hit next" onClick={() => go(1)} />
          </>
        )}
      </div>
      <div className="lightbox-caption caption">
        <div className="cap">
          {item.title && <span style={{ color: 'var(--ink)' }}>{item.title}</span>}
          {item.details && <span>{item.title ? ', ' : ''}{item.details}</span>}
        </div>
        {item.href && (
          <a className="lb-btn" href={item.href}>
            {labels.artworkPage}
          </a>
        )}
      </div>
    </div>,
    document.body,
  )
}
