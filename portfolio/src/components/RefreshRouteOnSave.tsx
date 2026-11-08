'use client'

import { RefreshRouteOnSave as PayloadRefresh } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/** Keeps the admin's live-preview pane in sync with autosaved drafts. */
export function RefreshRouteOnSave({ serverURL }: { serverURL: string }) {
  const router = useRouter()
  const origin = serverURL || (typeof window !== 'undefined' ? window.location.origin : '')
  return <PayloadRefresh refresh={() => router.refresh()} serverURL={origin} />
}
