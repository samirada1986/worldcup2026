'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/** Gentle fade-in for images as they enter the viewport. One observer per page. */
export function RevealObserver() {
  const pathname = usePathname()
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not([data-in="true"])'))
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => (el.dataset.in = 'true'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            ;(e.target as HTMLElement).dataset.in = 'true'
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [pathname])
  return null
}
