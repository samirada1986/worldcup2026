import type { GlobalConfig } from 'payload'
import { anyone, isAdmin } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { en: 'Site settings', fa: 'تنظیمات سایت' },
  admin: { group: { en: 'Settings', fa: 'تنظیمات' } },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Homepage', fa: 'صفحه اصلی' },
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              label: { en: 'Featured artwork', fa: 'اثر شاخص' },
              filterOptions: { mimeType: { contains: 'image' } },
              admin: { description: 'The single artwork that opens the site. Shown uncropped.' },
            },
            {
              name: 'heroProject',
              type: 'relationship',
              relationTo: 'projects',
              label: { en: 'Featured artwork belongs to', fa: 'پروژه اثر شاخص' },
            },
            {
              name: 'selectedProjects',
              type: 'relationship',
              relationTo: 'projects',
              hasMany: true,
              label: { en: 'Selected works (order)', fa: 'آثار منتخب (به ترتیب)' },
              admin: { description: 'Leave empty to use projects marked "Show on homepage".' },
            },
            {
              name: 'showIntro',
              type: 'checkbox',
              defaultValue: true,
              label: { en: 'Show artist introduction', fa: 'نمایش معرفی هنرمند' },
            },
            {
              name: 'writingCount',
              type: 'number',
              defaultValue: 3,
              min: 0,
              max: 6,
              label: { en: 'Number of latest texts', fa: 'تعداد نوشته‌های اخیر' },
            },
          ],
        },
        {
          label: { en: 'Navigation & footer', fa: 'منو و پانویس' },
          fields: [
            {
              name: 'navigation',
              type: 'array',
              label: { en: 'Main navigation', fa: 'منوی اصلی' },
              admin: { description: 'Paths without language prefix, e.g. /works. Leave empty for the default menu.' },
              fields: [
                { name: 'label', type: 'text', required: true, localized: true },
                { name: 'path', type: 'text', required: true },
              ],
            },
            { name: 'footerNote', type: 'text', localized: true, label: { en: 'Footer note', fa: 'یادداشت پانویس' } },
            { name: 'copyrightHolder', type: 'text', localized: true, defaultValue: 'Samira Dadashi' },
          ],
        },
        {
          label: { en: 'SEO & sharing', fa: 'سئو و اشتراک' },
          fields: [
            { name: 'siteTitle', type: 'text', localized: true, defaultValue: 'Samira Dadashi' },
            { name: 'siteDescription', type: 'textarea', localized: true },
            { name: 'shareImage', type: 'upload', relationTo: 'media', label: { en: 'Default social image', fa: 'تصویر اشتراک پیش‌فرض' } },
          ],
        },
        {
          label: { en: 'Contact form', fa: 'فرم تماس' },
          fields: [
            { name: 'contactFormEnabled', type: 'checkbox', defaultValue: true, label: { en: 'Enable contact form', fa: 'فعال‌سازی فرم تماس' } },
            {
              name: 'notifyEmail',
              type: 'email',
              label: { en: 'Send form messages to', fa: 'ارسال پیام‌ها به' },
              admin: { description: 'Private – never shown on the site. Requires SMTP settings in the server environment.' },
            },
          ],
        },
      ],
    },
  ],
}
