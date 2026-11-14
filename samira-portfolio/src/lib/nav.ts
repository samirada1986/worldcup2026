import type { Locale, Dict } from "./i18n";

export const href = (locale: Locale, path = "") =>
  `/${locale}${path ? (path.startsWith("/") ? path : `/${path}`) : ""}`;

export const navItems = (locale: Locale, d: Dict) => [
  { label: d.nav.works, href: href(locale, "/works") },
  { label: d.nav.about, href: href(locale, "/about") },
  { label: d.nav.journal, href: href(locale, "/journal") },
  { label: d.nav.cv, href: href(locale, "/cv") },
  { label: d.nav.contact, href: href(locale, "/contact") },
];
