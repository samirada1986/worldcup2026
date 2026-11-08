import { RichText as LexicalRichText, type JSXConvertersFunction, LinkJSXConverter } from '@payloadcms/richtext-lexical/react'
import type { Media } from '@/payload-types'
import { collectFootnotes } from '@/lib/lexical'
import { num, type Locale } from '@/lib/i18n'
import { Img } from './Img'
import { mediaUrl } from './media'

type Props = {
  data: unknown
  className?: string
  locale: Locale
  /** essay: footnotes are numbered and linked to the notes list. */
  footnotes?: boolean
}

const docHref = (locale: Locale) =>
  LinkJSXConverter({
    internalDocToHref: ({ linkNode }) => {
      const doc = linkNode.fields.doc
      const v = doc?.value as { slug?: string } | undefined
      if (!v?.slug) return '#'
      return doc?.relationTo === 'projects' ? `/${locale}/works/${v.slug}` : `/${locale}/writing/${v.slug}`
    },
  })

export function RichText({ data, className, locale, footnotes }: Props) {
  if (!data || !(data as { root?: unknown }).root) return null
  const notes = footnotes ? collectFootnotes(data) : []
  const numberOf = new Map(notes.map((n, i) => [n.id, i + 1]))

  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    ...docHref(locale),
    upload: ({ node }) => {
      const m = node.value as unknown as Media
      if (typeof m !== 'object' || !m) return null
      if (!m.mimeType?.startsWith('image')) {
        return (
          <p>
            <a href={mediaUrl(m.url)}>{m.title || m.filename}</a>
          </p>
        )
      }
      const wide = (node.fields as { width?: string } | undefined)?.width === 'wide'
      const cap = m.caption || m.title
      return (
        <figure className={wide ? 'figure-wide' : undefined}>
          <Img media={m} sizes={wide ? '(min-width: 1024px) 56rem, 100vw' : '(min-width: 768px) 36rem, 100vw'} />
          {cap && <figcaption className="caption">{cap}</figcaption>}
        </figure>
      )
    },
    blocks: {
      pullQuote: ({ node }: { node: { fields: unknown } }) => {
        const f = node.fields as { quote?: string; attribution?: string }
        return (
          <blockquote className="pull">
            <p>{f.quote}</p>
            {f.attribution && <footer>— {f.attribution}</footer>}
          </blockquote>
        )
      },
    },
    inlineBlocks: {
      footnote: ({ node }: { node: { fields: unknown } }) => {
        const id = String((node.fields as { id?: string }).id)
        const n = numberOf.get(id)
        if (!n) return null
        return (
          <a href={`#fn-${n}`} id={`fnref-${n}`} className="fn-ref" aria-describedby="notes-heading">
            {num(locale, n)}
          </a>
        )
      },
    },
  })

  return (
    <LexicalRichText
      data={data as never}
      converters={converters}
      className={className}
      disableIndent
    />
  )
}

export function Footnotes({ data, locale, heading }: { data: unknown; locale: Locale; heading: string }) {
  const notes = collectFootnotes(data)
  if (!notes.length) return null
  return (
    <section className="notes" aria-labelledby="notes-heading">
      <h2 id="notes-heading" className="label" style={{ marginBlockEnd: 'var(--s-4)' }}>
        {heading}
      </h2>
      <ol>
        {notes.map((n, i) => (
          <li key={n.id} id={`fn-${i + 1}`}>
            {n.note}{' '}
            <a href={`#fnref-${i + 1}`} aria-label={`${locale === 'fa' ? 'بازگشت به متن' : 'Back to text'} ${num(locale, i + 1)}`}>
              ↑
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
