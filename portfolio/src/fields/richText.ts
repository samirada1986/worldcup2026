import type { Block } from 'payload'
import {
  BlocksFeature,
  FixedToolbarFeature,
  lexicalEditor,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

export const PullQuote: Block = {
  slug: 'pullQuote',
  labels: { singular: { en: 'Pull quote', fa: 'نقل‌قول برجسته' }, plural: { en: 'Pull quotes', fa: 'نقل‌قول‌ها' } },
  fields: [
    { name: 'quote', type: 'textarea', required: true, label: { en: 'Quote', fa: 'نقل‌قول' } },
    { name: 'attribution', type: 'text', label: { en: 'Attribution', fa: 'منبع / گوینده' } },
  ],
}

/** Inline footnote: written in place, numbered automatically on the page. */
export const Footnote: Block = {
  slug: 'footnote',
  labels: { singular: { en: 'Footnote', fa: 'پانویس' }, plural: { en: 'Footnotes', fa: 'پانویس‌ها' } },
  fields: [{ name: 'note', type: 'textarea', required: true, label: { en: 'Footnote text', fa: 'متن پانویس' } }],
}

/** Editor used for essays: images, pull quotes and footnotes. */
export const essayEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
    UploadFeature({
      collections: {
        media: {
          fields: [
            {
              name: 'width',
              type: 'select',
              defaultValue: 'text',
              options: [
                { label: 'Text width', value: 'text' },
                { label: 'Wide', value: 'wide' },
              ],
            },
          ],
        },
      },
    }),
    BlocksFeature({ blocks: [PullQuote], inlineBlocks: [Footnote] }),
  ],
})
