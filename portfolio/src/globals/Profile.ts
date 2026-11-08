import type { GlobalConfig } from 'payload'
import { anyone, isLoggedIn } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

const cvList = (name: string, label: { en: string; fa: string }) => ({
  name,
  type: 'array' as const,
  label,
  labels: { singular: { en: 'Entry', fa: 'مورد' }, plural: { en: 'Entries', fa: 'موارد' } },
  fields: [
    {
      type: 'row' as const,
      fields: [
        { name: 'year', type: 'text' as const, label: { en: 'Year', fa: 'سال' }, admin: { width: '20%' } },
        { name: 'title', type: 'text' as const, required: true, localized: true, label: { en: 'Title', fa: 'عنوان' }, admin: { width: '45%' } },
        { name: 'detail', type: 'text' as const, localized: true, label: { en: 'Institution / place', fa: 'مؤسسه / مکان' }, admin: { width: '35%' } },
      ],
    },
  ],
})

/** Everything about the artist. Only content provided by the artist belongs here. */
export const Profile: GlobalConfig = {
  slug: 'profile',
  label: { en: 'Artist profile & CV', fa: 'پروفایل و رزومه هنرمند' },
  admin: { group: { en: 'Artist', fa: 'هنرمند' } },
  access: { read: anyone, update: isLoggedIn },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Biography', fa: 'زندگی‌نامه' },
          fields: [
            { name: 'name', type: 'text', localized: true, required: true, defaultValue: 'Samira Dadashi', label: { en: 'Name', fa: 'نام' } },
            { name: 'discipline', type: 'text', localized: true, label: { en: 'Discipline (one line)', fa: 'رشته (یک خط)' } },
            { name: 'basedIn', type: 'text', localized: true, label: { en: 'Lives and works in', fa: 'محل زندگی و کار' } },
            { name: 'portrait', type: 'upload', relationTo: 'media', label: { en: 'Portrait', fa: 'پرتره' } },
            {
              name: 'shortBio',
              type: 'textarea',
              localized: true,
              label: { en: 'Short biography (homepage)', fa: 'زندگی‌نامه کوتاه (صفحه اصلی)' },
            },
            { name: 'longBio', type: 'richText', localized: true, label: { en: 'Extended biography', fa: 'زندگی‌نامه کامل' } },
            { name: 'statement', type: 'richText', localized: true, label: { en: 'Artist statement', fa: 'بیانیه هنری' } },
          ],
        },
        {
          label: { en: 'CV', fa: 'رزومه' },
          description:
            'Exhibitions and publications are managed in their own collections and appear on the CV automatically.',
          fields: [
            cvList('education', { en: 'Education', fa: 'تحصیلات' }),
            cvList('awards', { en: 'Awards & grants', fa: 'جوایز و حمایت‌ها' }),
            cvList('residencies', { en: 'Residencies', fa: 'اقامت‌های هنری' }),
            cvList('collections', { en: 'Collections', fa: 'مجموعه‌ها' }),
            cvList('talks', { en: 'Talks & teaching', fa: 'سخنرانی و تدریس' }),
            {
              type: 'row',
              fields: [
                { name: 'cvPdf', type: 'upload', relationTo: 'media', label: { en: 'CV PDF (English)', fa: 'رزومه PDF (انگلیسی)' } },
                { name: 'cvPdfFa', type: 'upload', relationTo: 'media', label: { en: 'CV PDF (Persian)', fa: 'رزومه PDF (فارسی)' } },
              ],
            },
          ],
        },
        {
          label: { en: 'Contact & links', fa: 'تماس و پیوندها' },
          fields: [
            { name: 'email', type: 'email', label: { en: 'Public email', fa: 'ایمیل عمومی' } },
            { name: 'instagram', type: 'text', label: { en: 'Instagram handle (without @)', fa: 'اینستاگرام (بدون @)' } },
            {
              name: 'representation',
              type: 'textarea',
              localized: true,
              label: { en: 'Representation / gallery', fa: 'نمایندگی / گالری' },
            },
            {
              name: 'links',
              type: 'array',
              label: { en: 'Other links', fa: 'پیوندهای دیگر' },
              fields: [
                { name: 'label', type: 'text', required: true, localized: true },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}
