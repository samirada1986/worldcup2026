import type { CollectionConfig } from 'payload'
import { isAdmin, isLoggedIn, publishedOrLoggedIn } from '../access'
import { essayEditor } from '../fields/richText'
import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { previewPath } from '../lib/preview'

export const Writings: CollectionConfig = {
  slug: 'writings',
  labels: { singular: { en: 'Writing', fa: 'نوشته' }, plural: { en: 'Writing', fa: 'نوشته‌ها' } },
  defaultSort: '-publishedDate',
  admin: {
    group: { en: 'Content', fa: 'محتوا' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedDate', 'availableIn', '_status', 'updatedAt'],
    preview: (doc, { locale }) => previewPath('writings', doc?.slug as string, locale),
    livePreview: {
      url: ({ data, locale }) => previewPath('writings', data?.slug as string, locale?.code),
    },
  },
  access: { read: publishedOrLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  versions: { drafts: { autosave: { interval: 1500 }, schedulePublish: true }, maxPerDoc: 50 },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { en: 'Title', fa: 'عنوان' } },
    slugField(),
    {
      name: 'availableIn',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['en'],
      label: { en: 'Published languages', fa: 'زبان‌های منتشرشده' },
      options: [
        { label: 'English', value: 'en' },
        { label: 'فارسی', value: 'fa' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Tick each language whose translation is complete. A text that exists in one language only is shown in that language on both sites, with a note.',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      label: { en: 'Publication date', fa: 'تاریخ انتشار' },
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: { en: 'Topics', fa: 'موضوع‌ها' },
      admin: { position: 'sidebar' },
    },
    { name: 'subtitle', type: 'text', localized: true, label: { en: 'Subtitle', fa: 'زیرعنوان' } },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      label: { en: 'Excerpt', fa: 'چکیده' },
      admin: { description: 'Shown in listings and as the search/social description.' },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Cover image', fa: 'تصویر جلد' },
      filterOptions: { mimeType: { contains: 'image' } },
    },
    { name: 'content', type: 'richText', localized: true, editor: essayEditor, label: { en: 'Text', fa: 'متن' } },
    {
      name: 'references',
      type: 'array',
      localized: true,
      label: { en: 'References / bibliography', fa: 'منابع' },
      fields: [
        { name: 'citation', type: 'textarea', required: true, label: { en: 'Citation', fa: 'ارجاع' } },
        { name: 'url', type: 'text', label: 'URL' },
      ],
    },
    {
      name: 'relatedWritings',
      type: 'relationship',
      relationTo: 'writings',
      hasMany: true,
      label: { en: 'Related writing', fa: 'نوشته‌های مرتبط' },
      filterOptions: ({ id }) => ({ id: { not_equals: id } }),
    },
    {
      name: 'relatedProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      label: { en: 'Related projects', fa: 'پروژه‌های مرتبط' },
    },
  ],
}
