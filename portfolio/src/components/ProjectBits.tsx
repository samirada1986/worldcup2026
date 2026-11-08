import type { Project } from '@/payload-types'
import { t, type Locale } from '@/lib/i18n'

export const stateLabel = (locale: Locale, s?: Project['projectState']) => {
  const d = t(locale)
  if (s === 'ongoing') return d.ongoing
  if (s === 'inDevelopment') return d.inDevelopment
  return d.completed
}
