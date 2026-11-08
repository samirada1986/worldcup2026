import type { MetadataRoute } from 'next'
import { getPayload } from '@/lib/payload'
import { flattenSequence } from '@/lib/sequence'

export const dynamic = 'force-dynamic' // always reflects the CMS; cheap to generate

const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload()
  const both = ['en', 'fa'] as const
  const entry = (path: string, locales: readonly string[] = both, lastModified?: string): MetadataRoute.Sitemap =>
    locales.map((l) => ({
      url: `${base}/${l}${path}`,
      lastModified,
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, `${base}/${x}${path}`])) },
    }))

  const [projects, writings] = await Promise.all([
    payload.find({
      collection: 'projects',
      where: { and: [{ _status: { equals: 'published' } }, { archived: { not_equals: true } }] },
      limit: 500,
      depth: 1,
      select: { slug: true, updatedAt: true, sequence: true },
    }),
    payload.find({
      collection: 'writings',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
      select: { slug: true, updatedAt: true, availableIn: true },
    }),
  ])

  return [
    ...['', '/works', '/writing', '/about', '/cv', '/exhibitions', '/publications', '/contact'].flatMap((p) => entry(p)),
    ...projects.docs.flatMap((p) => [
      ...entry(`/works/${p.slug}`, both, p.updatedAt),
      ...flattenSequence(p).flatMap((_, i) => entry(`/works/${p.slug}/${i + 1}`, both, p.updatedAt)),
    ]),
    ...writings.docs.flatMap((w) => entry(`/writing/${w.slug}`, w.availableIn?.length ? w.availableIn : ['en'], w.updatedAt)),
  ]
}
