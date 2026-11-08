import type { CollectionConfig } from 'payload'
import { isAdmin, isLoggedIn } from '../access'

/** Messages sent through the public contact form. Created only by the server. */
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: { en: 'Inquiry', fa: 'پیام' }, plural: { en: 'Inquiries', fa: 'پیام‌ها' } },
  admin: {
    group: { en: 'Artist', fa: 'هنرمند' },
    useAsTitle: 'subject',
    defaultColumns: ['name', 'email', 'subject', 'createdAt', 'handled'],
  },
  access: { read: isLoggedIn, create: () => false, update: isLoggedIn, delete: isAdmin },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'email', type: 'email', required: true, admin: { readOnly: true } },
    {
      name: 'kind',
      type: 'select',
      admin: { readOnly: true },
      options: ['exhibition', 'publication', 'press', 'acquisition', 'other'],
    },
    { name: 'subject', type: 'text', admin: { readOnly: true } },
    { name: 'message', type: 'textarea', required: true, admin: { readOnly: true } },
    { name: 'locale', type: 'text', admin: { readOnly: true } },
    { name: 'ipHash', type: 'text', index: true, admin: { hidden: true } },
    { name: 'handled', type: 'checkbox', label: { en: 'Handled', fa: 'پاسخ داده شد' } },
  ],
}
