import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isLoggedIn } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

export const Exhibitions: CollectionConfig = {
  slug: 'exhibitions',
  labels: { singular: { en: 'Exhibition', fa: 'نمایشگاه' }, plural: { en: 'Exhibitions', fa: 'نمایشگاه‌ها' } },
  defaultSort: '-year',
  admin: {
    group: { en: 'Artist', fa: 'هنرمند' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'venue', 'year', 'type'],
  },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { en: 'Title', fa: 'عنوان' } },
    {
      type: 'row',
      fields: [
        { name: 'venue', type: 'text', localized: true, label: { en: 'Venue', fa: 'مکان' } },
        { name: 'city', type: 'text', localized: true, label: { en: 'City, country', fa: 'شهر، کشور' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'year', type: 'number', required: true, label: { en: 'Year', fa: 'سال' } },
        { name: 'dates', type: 'text', localized: true, label: { en: 'Dates (display)', fa: 'تاریخ (نمایشی)' } },
        {
          name: 'type',
          type: 'select',
          defaultValue: 'group',
          label: { en: 'Type', fa: 'نوع' },
          options: [
            { label: { en: 'Solo exhibition', fa: 'انفرادی' }, value: 'solo' },
            { label: { en: 'Group exhibition', fa: 'گروهی' }, value: 'group' },
            { label: { en: 'Festival', fa: 'جشنواره' }, value: 'festival' },
            { label: { en: 'Screening / other', fa: 'نمایش / سایر' }, value: 'other' },
          ],
        },
      ],
    },
    { name: 'link', type: 'text', label: { en: 'External link', fa: 'پیوند' } },
    { name: 'project', type: 'relationship', relationTo: 'projects', label: { en: 'Project shown', fa: 'پروژه' } },
    {
      name: 'documentation',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: { en: 'Installation views', fa: 'تصاویر چیدمان' },
    },
  ],
}
