import type { Media, Project } from '@/payload-types'
import { asMedia } from '@/lib/data'
import { num, pad, type Locale } from '@/lib/i18n'
import { Img } from './Img'
import { ArtworkTrigger, type LightboxItem } from './Lightbox'
import { imgData, isImage, mediaUrl } from './media'
import { RichText } from './RichText'

type Block = NonNullable<Project['sequence']>[number]

export const artworkDetails = (locale: Locale, m: Media) =>
  [num(locale, m.year), m.medium, m.dimensions ? num(locale, m.dimensions) : null, m.credit].filter(Boolean).join(', ')

/** Builds the lightbox list in the same order as flattenSequence(). */
export function lightboxItems(locale: Locale, slug: string, items: { media: Media; caption?: string | null }[]): LightboxItem[] {
  return items.map(({ media, caption }, i) => {
    const d = imgData(media)
    return {
      ...d,
      number: pad(locale, i + 1),
      title: caption || media.title || undefined,
      details: artworkDetails(locale, media) || undefined,
      href: `/${locale}/works/${slug}/${i + 1}`,
    }
  })
}

function Artwork({
  media,
  index,
  locale,
  sizes,
  caption,
  showNumbers,
}: {
  media: Media
  index: number
  locale: Locale
  sizes: string
  caption?: string | null
  showNumbers: boolean
}) {
  const title = caption || media.title
  const ar = (media.width ?? 4) / (media.height ?? 3)
  return (
    <figure className="artwork reveal" style={{ ['--ar' as string]: ar.toFixed(4) }}>
      <ArtworkTrigger index={index}>
        <Img media={media} sizes={sizes} max="large" />
      </ArtworkTrigger>
      {(showNumbers || title) && (
        <figcaption className="caption">
          {showNumbers && <span className="n num">{pad(locale, index + 1)}</span>}
          {title && <span>{title}</span>}
        </figcaption>
      )}
    </figure>
  )
}

/**
 * Renders the editor-composed sequence. A running counter mirrors
 * flattenSequence() so numbering and lightbox order always agree.
 */
export function Sequence({ blocks, locale }: { blocks: Block[]; locale: Locale }) {
  let n = 0
  const take = () => n++
  const showNumbers = true

  return (
    <div className="sequence wrap">
      {blocks.map((b, bi) => {
        const key = b.id ?? bi
        switch (b.blockType) {
          case 'series': {
            const imgs = (b.images ?? []).map(asMedia).filter(isImage)
            const sizes =
              b.layout === 'single' ? '(min-width: 1024px) 80vw, 100vw' : '(min-width: 768px) 50vw, 100vw'
            return (
              <div key={key} className="seq-grid seq-series" data-layout={b.layout ?? 'single'}>
                {imgs.map((m) => (
                  <Artwork key={m.id} media={m} index={take()} locale={locale} sizes={sizes} showNumbers={showNumbers} />
                ))}
              </div>
            )
          }
          case 'singleImage': {
            const m = asMedia(b.image)
            if (!isImage(m)) return null
            return (
              <div key={key} className="seq-grid seq-single" data-size={b.size ?? 'large'} data-align={b.align ?? 'center'}>
                <Artwork media={m} index={take()} locale={locale} sizes="(min-width: 1024px) 70vw, 100vw" caption={b.caption} showNumbers={showNumbers} />
              </div>
            )
          }
          case 'fullBleed': {
            const m = asMedia(b.image)
            if (!isImage(m)) return null
            return (
              <div key={key} className="seq-full" data-margins={b.margins ? 'true' : 'false'}>
                <Artwork media={m} index={take()} locale={locale} sizes="100vw" caption={b.caption} showNumbers={showNumbers} />
              </div>
            )
          }
          case 'spread': {
            const a = asMedia(b.left)
            const c = asMedia(b.right)
            return (
              <div key={key} className="seq-grid seq-spread" data-variant={b.variant ?? 'equal'} data-valign={b.valign ?? 'end'}>
                {isImage(a) && <Artwork media={a} index={take()} locale={locale} sizes="(min-width: 768px) 55vw, 100vw" showNumbers={showNumbers} />}
                {isImage(c) && <Artwork media={c} index={take()} locale={locale} sizes="(min-width: 768px) 55vw, 100vw" showNumbers={showNumbers} />}
              </div>
            )
          }
          case 'imageText': {
            const m = asMedia(b.image)
            return (
              <div key={key} className="seq-grid seq-imagetext" data-pos={b.imagePosition ?? 'start'}>
                {isImage(m) && <Artwork media={m} index={take()} locale={locale} sizes="(min-width: 768px) 50vw, 100vw" showNumbers={showNumbers} />}
                <RichText data={b.text} locale={locale} className="prose" />
              </div>
            )
          }
          case 'text':
            return (
              <div key={key} className="seq-grid seq-text">
                <RichText data={b.text} locale={locale} className="prose lead-prose" />
              </div>
            )
          case 'spacer':
            return <div key={key} className="seq-spacer" data-size={b.size ?? 'm'} aria-hidden="true" />
          case 'video': {
            const file = asMedia(b.file)
            const embed = b.embedUrl ? toEmbed(b.embedUrl) : null
            if (!file && !embed) return null
            return (
              <div key={key} className="seq-grid seq-video">
                <figure className="artwork">
                  <div className="video-frame">
                    {file ? (
                      <video src={mediaUrl(file.url)} controls preload="metadata" playsInline />
                    ) : (
                      <iframe
                        src={embed!}
                        title={b.title || 'Video'}
                        loading="lazy"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                  {(b.title || b.caption) && (
                    <figcaption className="caption">{[b.title, b.caption].filter(Boolean).join(' — ')}</figcaption>
                  )}
                </figure>
              </div>
            )
          }
          default:
            return null
        }
      })}
    </div>
  )
}

function toEmbed(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}?dnt=1` : null
    }
    if (u.hostname.includes('youtu')) {
      const id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v')
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
    return url
  } catch {
    return null
  }
}
