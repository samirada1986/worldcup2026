import type { CollectionConfig } from 'payload'
import { adminOrSelf, isAdmin, isAdminField } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: { en: 'User', fa: 'کاربر' }, plural: { en: 'Users', fa: 'کاربران' } },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    group: { en: 'Settings', fa: 'تنظیمات' },
  },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    // The first user can be created through the admin onboarding screen.
    create: isAdmin,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', label: { en: 'Name', fa: 'نام' } },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      access: { create: isAdminField, update: isAdminField },
      options: [
        { label: { en: 'Administrator', fa: 'مدیر' }, value: 'admin' },
        { label: { en: 'Editor', fa: 'ویراستار' }, value: 'editor' },
      ],
      admin: {
        description:
          'Administrators manage users and site settings. Editors manage projects, writing, media and the artist profile.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      // The very first account is always an administrator.
      async ({ req, operation, data }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
          if (totalDocs === 0) data.role = 'admin'
        }
        return data
      },
    ],
  },
}
