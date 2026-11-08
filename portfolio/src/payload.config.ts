import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { en } from '@payloadcms/translations/languages/en'
import { fa } from '@payloadcms/translations/languages/fa'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Exhibitions } from './collections/Exhibitions'
import { Inquiries } from './collections/Inquiries'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { Publications } from './collections/Publications'
import { Users } from './collections/Users'
import { Writings } from './collections/Writings'
import { Profile } from './globals/Profile'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Set NEXT_PUBLIC_SERVER_URL in production: it enables the CORS/CSRF origin
// allowlist. Without it (e.g. a temporary preview address) URLs stay relative
// and no origin allowlist is enforced.
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || ''

const plugins: Plugin[] = [
  seoPlugin({
    collections: ['projects', 'writings'],
    uploadsCollection: 'media',
    generateTitle: ({ doc }) => `${(doc as { title?: string })?.title ?? ''} — Samira Dadashi`,
    generateDescription: ({ doc }) =>
      ((doc as { summary?: string; excerpt?: string })?.summary ??
        (doc as { excerpt?: string })?.excerpt ??
        '') as string,
  }),
]

// Object storage is optional: without S3 settings, files are stored on local disk (./media).
if (process.env.S3_BUCKET) {
  plugins.push(
    s3Storage({
      collections: { media: { prefix: process.env.S3_PREFIX || 'media' } },
      bucket: process.env.S3_BUCKET,
      config: {
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  )
}

export default buildConfig({
  serverURL,
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' — Samira Dadashi Studio' },
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      beforeDashboard: ['/components/admin/Dashboard#Dashboard'],
      graphics: { Logo: '/components/admin/Logo#Logo', Icon: '/components/admin/Logo#Icon' },
    },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  i18n: { supportedLanguages: { en, fa }, fallbackLanguage: 'en' },
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'فارسی', code: 'fa', rtl: true },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  collections: [Projects, Writings, Media, Categories, Exhibitions, Publications, Inquiries, Users],
  globals: [Profile, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Schema changes always go through migrations (npm run migrate:create /
    // npm run migrate) so local, staging and production databases never drift.
    // Set PAYLOAD_DB_PUSH=true only for throwaway experiments.
    push: process.env.PAYLOAD_DB_PUSH === 'true',
  }),
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || 'no-reply@example.com',
        defaultFromName: 'Samira Dadashi — website',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  sharp,
  plugins,
  upload: { limits: { fileSize: 200_000_000 } },
  cors: serverURL ? [serverURL] : [],
  csrf: serverURL ? [serverURL] : [],
})
