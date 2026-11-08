import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isLoggedIn } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const Publications: CollectionConfig = {
  slug: 'publications',
  labels: { singular: { en: 'Publication', fa: 'انتشار' }, plural: { en: 'Publications', fa: 'انتشارات' } },
  defaultSort: '-year',
  admin: { group: { en: 'Artist', fa: 'هنرمند' }, useAsTitle: 'title', defaultColumns: ['title', 'publisher', 'year', 'type'] },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { en: 'Title', fa: 'عنوان' } },
    {
      type: 'row',
      fields: [
        { name: 'publisher', type: 'text', localized: true, label: { en: 'Publisher / outlet', fa: 'ناشر / رسانه' } },
        { name: 'year', type: 'number', required: true, label: { en: 'Year', fa: 'سال' } },
        {
          name: 'type',
          type: 'select',
          defaultValue: 'book',
          options: [
            { label: { en: 'Artist book', fa: 'کتاب هنرمند' }, value: 'book' },
            { label: { en: 'Catalogue', fa: 'کاتالوگ' }, value: 'catalogue' },
            { label: { en: 'Article / feature', fa: 'مقاله' }, value: 'article' },
            { label: { en: 'Interview', fa: 'گفت‌وگو' }, value: 'interview' },
          ],
        },
      ],
    },
    { name: 'description', type: 'textarea', localized: true, label: { en: 'Note', fa: 'توضیح' } },
    { name: 'cover', type: 'upload', relationTo: 'media', label: { en: 'Cover', fa: 'جلد' } },
    { name: 'link', type: 'text', label: { en: 'External link', fa: 'پیوند' } },
    { name: 'file', type: 'upload', relationTo: 'media', label: { en: 'PDF', fa: 'PDF' } },
  ],
}
