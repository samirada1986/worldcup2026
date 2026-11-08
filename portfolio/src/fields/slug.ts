import type { Field, FieldHook } from 'payload'

export const slugify = (input: string): string =>
  input
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9؀-ۿ\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const formatSlug =
  (fallbackField: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.trim()) return slugify(value)
    // Keep an existing slug so published URLs never change silently.
    if (originalDoc?.slug) return originalDoc.slug
    const source = data?.[fallbackField]
    const text = typeof source === 'string' ? source : source?.en
    return text ? slugify(text) : value
  }

export const slugField = (fallbackField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  required: false,
  admin: {
    position: 'sidebar',
    description:
      'URL segment (English, lowercase). Generated from the English title on first save; changing it changes the public URL.',
  },
  hooks: { beforeValidate: [formatSlug(fallbackField)] },
})
