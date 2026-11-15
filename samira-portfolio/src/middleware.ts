import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next internals, API, admin (CMS), and files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return;
  }

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return;

  // No locale prefix → send to a locale.
  // Prefer a stored cookie, then Accept-Language, else default (en).
  const cookie = req.cookies.get("locale")?.value;
  const header = req.headers.get("accept-language") ?? "";
  const preferred =
    (cookie && locales.includes(cookie as (typeof locales)[number]) && cookie) ||
    (header.toLowerCase().startsWith("fa") ? "fa" : defaultLocale);

  const url = req.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|admin|.*\\..*).*)"],
};
