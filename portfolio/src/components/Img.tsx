import type { Media } from '@/payload-types'
import { imgData } from './media'

type Props = {
  media: Media
  sizes: string
  priority?: boolean
  className?: string
  max?: 'thumb' | 'card' | 'display' | 'large'
  alt?: string
}

/** Artwork image: original aspect ratio, responsive derivatives, lazy by default. */
export function Img({ media, sizes, priority, className, max, alt }: Props) {
  const d = imgData(media, max)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={d.src}
      srcSet={d.srcSet}
      sizes={sizes}
      width={d.width}
      height={d.height}
      alt={alt ?? d.alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      className={className}
      draggable={false}
    />
  )
}
