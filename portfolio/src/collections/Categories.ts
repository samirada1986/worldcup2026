import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isLoggedIn } from '../access'
import { slugField } from '../fields/slug'
import { revalidateAfterChange } from '../hooks/revalidate'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: { en: 'Topic', fa: 'موضوع' }, plural: { en: 'Topics', fa: 'موضوع‌ها' } },
  admin: { group: { en: 'Content', fa: 'محتوا' }, useAsTitle: 'title' },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  hooks: { afterChange: [revalidateAfterChange] },
  fields: [{ name: 'title', type: 'text', required: true, localized: true }, slugField()],
}
