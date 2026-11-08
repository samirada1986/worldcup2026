type Node = { type?: string; text?: string; children?: Node[]; fields?: Record<string, unknown> }

export const plainText = (state: unknown): string => {
  const root = (state as { root?: Node } | null)?.root
  if (!root) return ''
  const parts: string[] = []
  const walk = (n: Node) => {
    if (n.text) parts.push(n.text)
    n.children?.forEach(walk)
    if (n.type === 'paragraph' || n.type === 'heading') parts.push(' ')
  }
  walk(root)
  return parts.join('').replace(/\s+/g, ' ').trim()
}

export const readingMinutes = (state: unknown, locale: 'en' | 'fa') => {
  const words = plainText(state).split(' ').filter(Boolean).length
  return Math.max(1, Math.round(words / (locale === 'fa' ? 200 : 230)))
}

/** Collects inline footnote blocks in document order. */
export const collectFootnotes = (state: unknown): { id: string; note: string }[] => {
  const root = (state as { root?: Node } | null)?.root
  const notes: { id: string; note: string }[] = []
  const walk = (n: Node) => {
    if (n.type === 'inlineBlock' && n.fields?.blockType === 'footnote') {
      notes.push({ id: String(n.fields.id), note: String(n.fields.note ?? '') })
    }
    n.children?.forEach(walk)
  }
  if (root) walk(root)
  return notes
}
