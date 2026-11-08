import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload as getPayloadBase } from 'payload'
import { cache } from 'react'

export const getPayload = () => getPayloadBase({ config })

/** True when an authenticated editor has entered preview mode. */
export const isPreview = async () => {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
}

export const getQueryFlags = cache(async () => {
  const draft = await isPreview()
  // In preview the editor was verified when draft mode was enabled (see /preview).
  return { draft, overrideAccess: draft }
})
