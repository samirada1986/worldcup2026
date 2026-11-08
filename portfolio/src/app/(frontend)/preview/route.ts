import { draftMode, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from '@/lib/payload'

/** Enables draft mode for logged-in CMS users, then shows the requested page. */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const path = url.searchParams.get('path') || '/en'
  if (!/^\/(en|fa)(\/[\w\-/؀-ۿ%]*)?$/.test(path)) {
    return new Response('Invalid path', { status: 400 })
  }
  const payload = await getPayload()
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return new Response('You must be logged in to preview unpublished content.', { status: 403 })
  ;(await draftMode()).enable()
  redirect(path)
}
