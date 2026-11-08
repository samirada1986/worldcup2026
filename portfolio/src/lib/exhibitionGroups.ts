import type { Exhibition } from '@/payload-types'
import type { CvItem } from '@/components/CvSection'
import type { Dict, Locale } from './i18n'

export const exhibitionItems = (locale: Locale, list: Exhibition[]): CvItem[] =>
  list.map((e) => {
    const project = typeof e.project === 'object' && e.project ? e.project : null
    return {
      id: e.id,
      year: e.year,
      title: e.title,
      italic: true,
      detail: [e.venue, e.city, e.dates].filter(Boolean).join(', '),
      href: e.link || (project?.slug ? `/${locale}/works/${project.slug}` : null),
    }
  })

export const exhibitionGroups = (d: Dict, all: Exhibition[]) =>
  [
    { id: 'solo', heading: d.soloExhibitions, items: all.filter((e) => e.type === 'solo') },
    { id: 'group', heading: d.groupExhibitions, items: all.filter((e) => (e.type ?? 'group') === 'group') },
    { id: 'festival', heading: d.festivals, items: all.filter((e) => e.type === 'festival') },
    { id: 'other', heading: d.otherExhibitions, items: all.filter((e) => e.type === 'other') },
  ].filter((g) => g.items.length)
