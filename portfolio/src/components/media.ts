import type { Media } from '@/payload-types'

const origin = process.env.NEXT_PUBLIC_SERVER_URL || ''

/** Payload returns absolute URLs; keep them relative for same-origin files. */
export const mediaUrl = (url?: string | null) => {
  if (!url) return ''
  if (origin && url.startsWith(origin)) return url.slice(origin.length) || '/'
  return url
}

export type ImgData = {
  src: string
  srcSet: string
  width: number
  height: number
  alt: string
}

const ORDER = ['thumb', 'card', 'display', 'large'] as const

/** Builds src/srcset from Payload's generated derivatives (never upscaled). */
export function imgData(m: Media, max: (typeof ORDER)[number] = 'large'): ImgData {
  const sizes = (m.sizes ?? {}) as Record<string, { url?: string | null; width?: number | null } | undefined>
  const candidates: string[] = []
  let best = ''
  for (const key of ORDER) {
    const s = sizes[key]
    if (s?.url && s.width) {
      candidates.push(`${mediaUrl(s.url)} ${s.width}w`)
      best = mediaUrl(s.url)
    }
    if (key === max) break
  }
  const original = mediaUrl(m.url)
  // Small originals produce no derivatives: fall back to the original file.
  if (!candidates.length && original) candidates.push(`${original} ${m.width ?? 1200}w`)
  return {
    src: best || original,
    srcSet: candidates.join(', '),
    width: m.width ?? 1200,
    height: m.height ?? 900,
    alt: m.alt ?? '',
  }
}

export const isImage = (m?: Media | null): m is Media => Boolean(m?.mimeType?.startsWith('image'))

export const fileSize = (bytes?: number | null) => {
  if (!bytes) return ''
  if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  return `${Math.round(bytes / 1000)} KB`
}
