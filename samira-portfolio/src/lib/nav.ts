import type { Locale, Dict } from "./i18n";

export const href = (locale: Locale, path = "") =>
  `/${locale}${path ? (path.startsWith("/") ? path : `/${path}`) : ""}`;

/** The Journal only appears in the navigation once it has published notes. */
export const navItems = (locale: Locale, d: Dict, hasJournal = true) => [
  { label: d.nav.works, href: href(locale, "/works") },
  { label: d.nav.about, href: href(locale, "/about") },
  ...(hasJournal ? [{ label: d.nav.journal, href: href(locale, "/journal") }] : []),
  { label: d.nav.cv, href: href(locale, "/cv") },
  { label: d.nav.contact, href: href(locale, "/contact") },
];
