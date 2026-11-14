import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale, getDict } from "@/lib/i18n";
import { href } from "@/lib/nav";
import { journal } from "@/content/site";
import Reveal from "@/components/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "en";
  return { title: `${getDict(l).journal.title} — Samira Dadashi`, description: getDict(l).journal.intro };
}

export default async function JournalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const d = getDict(l);
  const faTitle = l === "fa" ? "font-fa" : "font-serif";
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(l === "fa" ? "fa-IR" : "en-GB", { year: "numeric", month: "long" }).format(new Date(iso));

  const notes = [...journal].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <div className="mx-auto max-w-wide px-6 pt-16 sm:px-10 sm:pt-24">
      <Reveal className="max-w-3xl">
        <p className="eyebrow">{d.journal.title}</p>
        <h1 className={`${faTitle} mt-4 text-display-lg font-light text-ink`}>{d.journal.title}</h1>
        <p className="prose-quiet mt-6 max-w-reading">
          <span className="font-serif text-stone">{d.journal.intro}</span>
        </p>
      </Reveal>

      <div className="mt-14 sm:mt-20">
        {notes.length === 0 && <p className="caption">{d.journal.empty}</p>}
        {notes.map((n) => (
          <Reveal key={n.slug}>
            <Link
              href={href(l, `/journal/${n.slug}`)}
              className="group grid gap-4 border-t border-line py-10 sm:grid-cols-[0.5fr_1.5fr] sm:gap-10"
            >
              <div>
                <p className="eyebrow">{n.kicker?.[l]}</p>
                <p className="mt-2 font-sans text-sm text-stone-light">{fmt(n.date)}</p>
              </div>
              <div>
                <h2 className={`${faTitle} text-display-md font-light text-ink transition-colors group-hover:text-clay`}>
                  {n.title[l]}
                </h2>
                {n.pull && (
                  <p className="mt-4 max-w-reading font-serif text-lg leading-relaxed text-stone">
                    {n.pull[l]}
                  </p>
                )}
                <span className="mt-5 inline-block font-sans text-sm text-ink link-quiet">
                  {l === "fa" ? "ادامه ←" : "Read →"}
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
