import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(req: Request) {
  ;(await draftMode()).disable()
  const path = new URL(req.url).searchParams.get('path') || '/en'
  redirect(/^\/(en|fa)/.test(path) ? path : '/en')
}
