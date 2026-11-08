import type { Block, Field } from 'payload'

const captionOverride: Field = {
  name: 'caption',
  type: 'textarea',
  localized: true,
  label: { en: 'Caption override', fa: 'زیرنویس جایگزین' },
  admin: { description: 'Optional. Leave empty to use the caption from the media library.' },
}

const img = (name = 'image', label: { en: string; fa: string } = { en: 'Image', fa: 'تصویر' }): Field => ({
  name,
  type: 'upload',
  relationTo: 'media',
  required: true,
  label,
  filterOptions: { mimeType: { contains: 'image' } },
})

const simpleText: Field = {
  name: 'text',
  type: 'richText',
  localized: true,
  label: { en: 'Text', fa: 'متن' },
}

/** One image, sized and placed on the 12-column grid. */
export const SingleImage: Block = {
  slug: 'singleImage',
  labels: { singular: { en: 'Single image', fa: 'تک‌تصویر' }, plural: { en: 'Single images', fa: 'تک‌تصویرها' } },
  fields: [
    img(),
    {
      type: 'row',
      fields: [
        {
          name: 'size',
          type: 'select',
          defaultValue: 'large',
          label: { en: 'Size', fa: 'اندازه' },
          options: [
            { label: { en: 'Small (4 col)', fa: 'کوچک' }, value: 'small' },
            { label: { en: 'Medium (6 col)', fa: 'متوسط' }, value: 'medium' },
            { label: { en: 'Large (8 col)', fa: 'بزرگ' }, value: 'large' },
            { label: { en: 'Wide (10 col)', fa: 'عریض' }, value: 'wide' },
          ],
        },
        {
          name: 'align',
          type: 'select',
          defaultValue: 'center',
          label: { en: 'Alignment', fa: 'چینش' },
          options: [
            { label: { en: 'Start', fa: 'آغاز' }, value: 'start' },
            { label: { en: 'Center', fa: 'وسط' }, value: 'center' },
            { label: { en: 'End', fa: 'پایان' }, value: 'end' },
          ],
        },
      ],
    },
    captionOverride,
  ],
}

/** Edge-to-edge image. */
export const FullBleed: Block = {
  slug: 'fullBleed',
  labels: { singular: { en: 'Full-width image', fa: 'تصویر تمام‌عرض' }, plural: { en: 'Full-width images', fa: 'تصاویر تمام‌عرض' } },
  fields: [
    img(),
    {
      name: 'margins',
      type: 'checkbox',
      defaultValue: false,
      label: { en: 'Keep page margins', fa: 'حفظ حاشیه صفحه' },
    },
    captionOverride,
  ],
}

/** Two images side by side, like a book spread. */
export const Spread: Block = {
  slug: 'spread',
  labels: { singular: { en: 'Two-image spread', fa: 'دوتایی (اسپرد)' }, plural: { en: 'Spreads', fa: 'اسپردها' } },
  fields: [
    img('left', { en: 'First image', fa: 'تصویر اول' }),
    img('right', { en: 'Second image', fa: 'تصویر دوم' }),
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'equal',
      label: { en: 'Composition', fa: 'ترکیب‌بندی' },
      options: [
        { label: { en: 'Equal halves', fa: 'دو نیمه برابر' }, value: 'equal' },
        { label: { en: 'Asymmetric – first larger', fa: 'نامتقارن – اولی بزرگ‌تر' }, value: 'firstLarge' },
        { label: { en: 'Asymmetric – second larger', fa: 'نامتقارن – دومی بزرگ‌تر' }, value: 'secondLarge' },
      ],
    },
    {
      name: 'valign',
      type: 'select',
      defaultValue: 'end',
      label: { en: 'Vertical alignment', fa: 'تراز عمودی' },
      options: [
        { label: { en: 'Top', fa: 'بالا' }, value: 'start' },
        { label: { en: 'Middle', fa: 'وسط' }, value: 'center' },
        { label: { en: 'Bottom', fa: 'پایین' }, value: 'end' },
      ],
    },
  ],
}

/** Image with accompanying text. */
export const ImageText: Block = {
  slug: 'imageText',
  labels: { singular: { en: 'Image with text', fa: 'تصویر با متن' }, plural: { en: 'Images with text', fa: 'تصاویر با متن' } },
  fields: [
    img(),
    simpleText,
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'start',
      label: { en: 'Image position', fa: 'جای تصویر' },
      options: [
        { label: { en: 'Image first', fa: 'اول تصویر' }, value: 'start' },
        { label: { en: 'Text first', fa: 'اول متن' }, value: 'end' },
      ],
    },
  ],
}

/** An ordered run of images – the fastest way to lay out a series. */
export const Series: Block = {
  slug: 'series',
  labels: { singular: { en: 'Image sequence', fa: 'توالی تصاویر' }, plural: { en: 'Image sequences', fa: 'توالی‌ها' } },
  fields: [
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      label: { en: 'Images (drag to reorder)', fa: 'تصاویر (برای تغییر ترتیب بکشید)' },
      filterOptions: { mimeType: { contains: 'image' } },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'single',
      label: { en: 'Layout', fa: 'چیدمان' },
      options: [
        { label: { en: 'One per row, centred', fa: 'هر ردیف یک تصویر' }, value: 'single' },
        { label: { en: 'Pairs (spreads)', fa: 'جفت‌جفت' }, value: 'pairs' },
        { label: { en: 'Alternating start / end', fa: 'یک‌درمیان چپ و راست' }, value: 'alternate' },
      ],
    },
  ],
}

export const TextBlock: Block = {
  slug: 'text',
  labels: { singular: { en: 'Text', fa: 'متن' }, plural: { en: 'Texts', fa: 'متن‌ها' } },
  fields: [simpleText],
}

export const Spacer: Block = {
  slug: 'spacer',
  labels: { singular: { en: 'White space', fa: 'فضای خالی' }, plural: { en: 'White space', fa: 'فضای خالی' } },
  fields: [
    {
      name: 'size',
      type: 'select',
      defaultValue: 'm',
      options: [
        { label: 'S', value: 's' },
        { label: 'M', value: 'm' },
        { label: 'L', value: 'l' },
        { label: 'XL', value: 'xl' },
      ],
    },
  ],
}

export const Video: Block = {
  slug: 'video',
  labels: { singular: { en: 'Video', fa: 'ویدیو' }, plural: { en: 'Videos', fa: 'ویدیوها' } },
  fields: [
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Video file (mp4/webm)', fa: 'فایل ویدیو' },
      filterOptions: { mimeType: { contains: 'video' } },
    },
    {
      name: 'embedUrl',
      type: 'text',
      label: { en: 'or Vimeo / YouTube URL', fa: 'یا نشانی ویمئو / یوتیوب' },
    },
    { name: 'title', type: 'text', localized: true, label: { en: 'Title', fa: 'عنوان' } },
    captionOverride,
  ],
}

export const projectSequenceBlocks = [Series, SingleImage, Spread, FullBleed, ImageText, TextBlock, Spacer, Video]
