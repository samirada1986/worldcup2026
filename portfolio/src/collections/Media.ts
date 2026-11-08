import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isLoggedIn } from '../access'
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks/revalidate'

/**
 * Media library. The uploaded original is stored untouched (the master file);
 * web derivatives are generated as WebP at high quality so artworks are not
 * visibly degraded. Replacing the file on an existing document keeps its ID,
 * so every project/essay that references it updates automatically.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: { en: 'Media', fa: 'رسانه' }, plural: { en: 'Media library', fa: 'کتابخانه رسانه' } },
  admin: {
    group: { en: 'Content', fa: 'محتوا' },
    defaultColumns: ['filename', 'title', 'year', 'mimeType', 'updatedAt'],
    useAsTitle: 'filename',
    listSearchableFields: ['filename', 'title', 'alt'],
  },
  access: { read: anyone, create: isLoggedIn, update: isLoggedIn, delete: isAdmin },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  upload: {
    mimeTypes: ['image/*', 'application/pdf', 'video/mp4', 'video/webm'],
    focalPoint: false,
    crop: false,
    adminThumbnail: 'thumb',
    imageSizes: [
      { name: 'thumb', width: 480, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 82 } } },
      { name: 'card', width: 960, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 86 } } },
      { name: 'display', width: 1600, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 88 } } },
      { name: 'large', width: 2400, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 90 } } },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      label: { en: 'Alt text', fa: 'متن جایگزین' },
      admin: { description: 'Describes the image for screen-reader users. Required for images that convey content.' },
    },
    { name: 'title', type: 'text', localized: true, label: { en: 'Title', fa: 'عنوان' } },
    { name: 'caption', type: 'textarea', localized: true, label: { en: 'Caption', fa: 'زیرنویس' } },
    {
      type: 'row',
      fields: [
        { name: 'year', type: 'text', label: { en: 'Year', fa: 'سال' }, admin: { width: '33%' } },
        { name: 'medium', type: 'text', localized: true, label: { en: 'Medium', fa: 'تکنیک / مدیوم' }, admin: { width: '33%' } },
        {
          name: 'dimensions',
          type: 'text',
          label: { en: 'Dimensions', fa: 'ابعاد' },
          admin: { width: '33%', description: 'e.g. 100 × 70 cm' },
        },
      ],
    },
    { name: 'credit', type: 'text', localized: true, label: { en: 'Credit / edition', fa: 'اعتبار / ادیشن' } },
    {
      name: 'isPlaceholder',
      type: 'checkbox',
      label: { en: 'Placeholder (awaiting original)', fa: 'جایگزین موقت (در انتظار تصویر اصلی)' },
      admin: {
        position: 'sidebar',
        description: 'Marks a temporary image. Replace the file with the original photograph, then untick.',
      },
    },
    {
      name: 'versionNote',
      type: 'text',
      label: { en: 'Version note', fa: 'یادداشت نسخه' },
      admin: { position: 'sidebar', description: 'e.g. "2024 reprint scan" – helps track replaced files.' },
    },
  ],
}
