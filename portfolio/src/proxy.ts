import { NextResponse, type NextRequest } from 'next/server'

/**
 * English is the default public language. Any path without a locale prefix
 * (e.g. "/" or "/works/conatus") is redirected to its /en/ equivalent.
 */
export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone()
  url.pathname = `/en${req.nextUrl.pathname === '/' ? '' : req.nextUrl.pathname}`
  return NextResponse.redirect(url, 308)
}

export const config = {
  matcher: [
    '/((?!en(?:/|$)|fa(?:/|$)|admin|api|preview|_next|favicon|robots\\.txt|sitemap\\.xml|.*\\.[a-zA-Z0-9]+$).*)',
  ],
}
