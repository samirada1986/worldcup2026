import Link from "next/link";
import { type Locale, getDict } from "@/lib/i18n";
import { href, navItems } from "@/lib/nav";
import { site } from "@/content/site";

export default function Footer({ locale }: { locale: Locale }) {
  const d = getDict(locale);
  const items = navItems(locale, d);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 border-t border-line bg-paper">
      <div className="mx-auto max-w-wide px-6 py-16 sm:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link
              href={href(locale)}
              className={`${locale === "fa" ? "font-fa" : "font-serif"} text-2xl tracking-tight text-ink`}
            >
              {site.name[locale]}
            </Link>
            <p className="prose-quiet mt-4 max-w-xs">
              <span className="font-serif text-stone">{d.footer.tagline}</span>
            </p>
          </div>

          <nav className="flex flex-col gap-2.5" aria-label={d.menu}>
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="font-sans text-sm text-stone transition-colors hover:text-ink w-fit"
              >
                {it.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2.5">
            <a
              href={`mailto:${site.email}`}
              className="font-sans text-sm text-stone transition-colors hover:text-ink w-fit"
            >
              {site.email}
            </a>
            <a
              href={site.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-sm text-stone transition-colors hover:text-ink w-fit"
            >
              @{site.instagram}
            </a>
            <span className="font-sans text-sm text-stone-light">{site.location[locale]}</span>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-xs text-stone-light">
            © {year} {site.name[locale]}. {d.footer.rights}
          </p>
          <p className="font-sans text-xs text-stone-light">Tehran · {year}</p>
        </div>
      </div>
    </footer>
  );
}
