import type { Media, Project } from '@/payload-types'
import { asMedia } from './data'

export type SequenceItem = { media: Media; caption?: string | null }

/**
 * Flattens a project's editorial sequence into the ordered list of artworks.
 * The index in this list is the artwork number shown on the page, in the
 * lightbox and in artwork permalinks (/works/<slug>/<n>).
 */
export function flattenSequence(project: Pick<Project, 'sequence'>): SequenceItem[] {
  const out: SequenceItem[] = []
  const push = (m: unknown, caption?: string | null) => {
    const media = asMedia(m)
    if (media && media.mimeType?.startsWith('image')) out.push({ media, caption })
  }
  for (const block of project.sequence ?? []) {
    switch (block.blockType) {
      case 'series':
        for (const m of block.images ?? []) push(m)
        break
      case 'singleImage':
      case 'fullBleed':
        push(block.image, block.caption)
        break
      case 'spread':
        push(block.left)
        push(block.right)
        break
      case 'imageText':
        push(block.image)
        break
    }
  }
  return out
}
