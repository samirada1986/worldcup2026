import type { CollectionConfig } from 'payload'
import { isAdmin, isLoggedIn, publicProjects } from '../access'
import { projectSequenceBlocks } from '../blocks/sequence'
import { slugField } from '../fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'
import { previewPath } from '../lib/preview'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: { en: 'Project', fa: 'پروژه' }, plural: { en: 'Projects', fa: 'پروژه‌ها' } },
  orderable: true,
  defaultSort: '_order',
  admin: {
    group: { en: 'Content', fa: 'محتوا' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'projectState', '_status', 'featured', 'updatedAt'],
    description: 'The order of projects on the Works page is set by dragging rows (☰) in the project list.',
    preview: (doc, { locale }) => previewPath('projects', doc?.slug as string, locale),
    livePreview: {
      url: ({ data, locale }) => previewPath('projects', data?.slug as string, locale?.code),
    },
  },
  access: { read: publicProjects, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  versions: { drafts: { autosave: { interval: 1500 }, schedulePublish: true }, maxPerDoc: 30 },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { en: 'Title', fa: 'عنوان' } },
    slugField(),
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Overview', fa: 'مشخصات' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'year',
                  type: 'text',
                  label: { en: 'Year / period', fa: 'سال / دوره' },
                  admin: { width: '33%', description: 'e.g. 2022–2024' },
                },
                { name: 'medium', type: 'text', localized: true, label: { en: 'Medium', fa: 'مدیوم' }, admin: { width: '67%' } },
              ],
            },
            {
              name: 'summary',
              type: 'textarea',
              localized: true,
              label: { en: 'Short description', fa: 'توضیح کوتاه' },
              admin: { description: 'One or two sentences shown on the Works page and in search results.' },
            },
            {
              name: 'cover',
              type: 'upload',
              relationTo: 'media',
              label: { en: 'Representative image', fa: 'تصویر شاخص' },
              filterOptions: { mimeType: { contains: 'image' } },
            },
            { name: 'statement', type: 'richText', localized: true, label: { en: 'Project statement', fa: 'بیانیه پروژه' } },
          ],
        },
        {
          label: { en: 'Image sequence', fa: 'توالی تصاویر' },
          description: 'Compose the exhibition: add blocks and drag them to set the exact viewing order.',
          fields: [
            {
              name: 'sequence',
              type: 'blocks',
              label: { en: 'Sequence', fa: 'توالی' },
              blocks: projectSequenceBlocks,
            },
          ],
        },
        {
          label: { en: 'Context', fa: 'زمینه' },
          fields: [
            {
              name: 'installationViews',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: { en: 'Exhibition documentation', fa: 'مستندات نمایشگاه' },
              filterOptions: { mimeType: { contains: 'image' } },
            },
            {
              name: 'documents',
              type: 'array',
              label: { en: 'PDF documents', fa: 'اسناد PDF' },
              fields: [
                { name: 'label', type: 'text', localized: true, required: true },
                {
                  name: 'file',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  filterOptions: { mimeType: { equals: 'application/pdf' } },
                },
              ],
            },
            {
              name: 'relatedWritings',
              type: 'relationship',
              relationTo: 'writings',
              hasMany: true,
              label: { en: 'Related writing', fa: 'نوشته‌های مرتبط' },
            },
            {
              name: 'credits',
              type: 'textarea',
              localized: true,
              label: { en: 'Credits & acknowledgements', fa: 'دست‌اندرکاران و سپاس' },
            },
          ],
        },
      ],
    },
    {
      name: 'projectState',
      type: 'select',
      defaultValue: 'completed',
      label: { en: 'Project status', fa: 'وضعیت پروژه' },
      options: [
        { label: { en: 'Completed', fa: 'پایان‌یافته' }, value: 'completed' },
        { label: { en: 'Ongoing', fa: 'در جریان' }, value: 'ongoing' },
        { label: { en: 'In development', fa: 'در حال شکل‌گیری' }, value: 'inDevelopment' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: { en: 'Show on homepage (Selected works)', fa: 'نمایش در صفحه اصلی' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'archived',
      type: 'checkbox',
      label: { en: 'Archived (hidden from public)', fa: 'بایگانی (پنهان از عموم)' },
      admin: { position: 'sidebar' },
    },
  ],
}
