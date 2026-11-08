import { cache } from 'react'
import type { Where } from 'payload'
import type { Exhibition, Media, Profile, Project, Publication, SiteSetting, Writing } from '@/payload-types'
import type { Locale } from './i18n'
import { getPayload, getQueryFlags } from './payload'

const publicProjectWhere = (draft: boolean): Where =>
  draft ? { archived: { not_equals: true } } : { and: [{ _status: { equals: 'published' } }, { archived: { not_equals: true } }] }

export const getSettings = cache(async (locale: Locale) => {
  const payload = await getPayload()
  const { draft } = await getQueryFlags()
  return (await payload.findGlobal({ slug: 'site-settings', locale, depth: 2, draft })) as SiteSetting
})

export const getProfile = cache(async (locale: Locale) => {
  const payload = await getPayload()
  return (await payload.findGlobal({ slug: 'profile', locale, depth: 1 })) as Profile
})

export const getProjects = cache(async (locale: Locale) => {
  const payload = await getPayload()
  const { draft, overrideAccess } = await getQueryFlags()
  const res = await payload.find({
    collection: 'projects',
    locale,
    draft,
    overrideAccess,
    where: publicProjectWhere(draft),
    sort: '_order',
    limit: 200,
    depth: 1,
    select: {
      title: true,
      slug: true,
      year: true,
      medium: true,
      summary: true,
      cover: true,
      projectState: true,
      featured: true,
      sequence: true,
      _status: true,
    },
  })
  return res.docs as Project[]
})

export const getProject = cache(async (locale: Locale, slug: string) => {
  const payload = await getPayload()
  const { draft, overrideAccess } = await getQueryFlags()
  const res = await payload.find({
    collection: 'projects',
    locale,
    draft,
    overrideAccess,
    where: { and: [{ slug: { equals: slug } }, publicProjectWhere(draft)] },
    limit: 1,
    depth: 2,
  })
  return (res.docs[0] as Project | undefined) ?? null
})

export const getExhibitionsForProject = cache(async (locale: Locale, projectId: number | string) => {
  const payload = await getPayload()
  const res = await payload.find({
    collection: 'exhibitions',
    locale,
    where: { project: { equals: projectId } },
    sort: '-year',
    depth: 0,
    limit: 50,
  })
  return res.docs as Exhibition[]
})

export const getWritings = cache(async (locale: Locale, opts: { limit?: number; topic?: string } = {}) => {
  const payload = await getPayload()
  const { draft, overrideAccess } = await getQueryFlags()
  const and: Where[] = []
  if (!draft) and.push({ _status: { equals: 'published' } })
  if (opts.topic) and.push({ 'categories.slug': { equals: opts.topic } })
  const res = await payload.find({
    collection: 'writings',
    locale,
    draft,
    overrideAccess,
    where: and.length ? { and } : undefined,
    sort: '-publishedDate',
    limit: opts.limit ?? 100,
    depth: 1,
    select: {
      title: true,
      subtitle: true,
      slug: true,
      excerpt: true,
      publishedDate: true,
      availableIn: true,
      categories: true,
      cover: true,
      content: true,
    },
  })
  return res.docs as Writing[]
})

export const getWriting = cache(async (locale: Locale, slug: string) => {
  const payload = await getPayload()
  const { draft, overrideAccess } = await getQueryFlags()
  const where: Where = draft ? { slug: { equals: slug } } : { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] }
  const res = await payload.find({ collection: 'writings', locale, draft, overrideAccess, where, limit: 1, depth: 2 })
  return (res.docs[0] as Writing | undefined) ?? null
})

export const getCategories = cache(async (locale: Locale) => {
  const payload = await getPayload()
  const res = await payload.find({ collection: 'categories', locale, limit: 100, depth: 0, sort: 'title' })
  return res.docs
})

export const getExhibitions = cache(async (locale: Locale) => {
  const payload = await getPayload()
  const res = await payload.find({ collection: 'exhibitions', locale, sort: '-year', limit: 500, depth: 1 })
  return res.docs as Exhibition[]
})

export const getPublications = cache(async (locale: Locale) => {
  const payload = await getPayload()
  const res = await payload.find({ collection: 'publications', locale, sort: '-year', limit: 500, depth: 1 })
  return res.docs as Publication[]
})

export const asMedia = (m: unknown): Media | null => (m && typeof m === 'object' ? (m as Media) : null)
