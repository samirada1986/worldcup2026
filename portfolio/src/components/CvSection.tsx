import { num, type Locale } from '@/lib/i18n'

export type CvItem = { id?: string | number | null; year?: string | number | null; title: string; detail?: string | null; href?: string | null; italic?: boolean }

export function CvSection({ id, heading, items, locale }: { id: string; heading: string; items: CvItem[]; locale: Locale }) {
  if (!items.length) return null
  return (
    <section className="context-block" aria-labelledby={id}>
      <h2 id={id} className="label">
        {heading}
      </h2>
      <ul className="body cv-list">
        {items.map((it, i) => (
          <li key={it.id ?? i}>
            <span className="num muted">{num(locale, it.year ?? '')}</span>
            <span>
              {it.href ? (
                <a href={it.href} className={it.italic ? 'italic' : undefined}>
                  {it.title}
                </a>
              ) : (
                <span className={it.italic ? 'italic' : undefined}>{it.title}</span>
              )}
              {it.detail && <span className="muted">, {it.detail}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
