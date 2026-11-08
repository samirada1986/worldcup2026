const routes = { projects: 'works', writings: 'writing' } as const

export const previewPath = (collection: keyof typeof routes, slug: string | undefined, locale?: string) => {
  if (!slug) return null
  const params = new URLSearchParams({
    path: `/${locale === 'fa' ? 'fa' : 'en'}/${routes[collection]}/${slug}`,
  })
  return `/preview?${params.toString()}`
}
