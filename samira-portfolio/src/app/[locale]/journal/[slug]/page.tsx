import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, locales, type Locale, getDict } from "@/lib/i18n";
import { href } from "@/lib/nav";
import { journal, getNote } from "@/content/site";
import Reveal from "@/components/Reveal";

export function generateStaticParams() {
  return locales.flatMap((locale) => journal.map((n) => ({ locale, slug: n.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? locale : "en";
  const n = getNote(slug);
  if (!n) return { title: "Journal — Samira Dadashi" };
  return { title: `${n.title[l]} — Samira Dadashi`, description: n.pull?.[l] ?? n.body[l][0] };
}

export default async function NotePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const d = getDict(l);
  const n = getNote(slug);
  if (!n) notFound();
  const faTitle = l === "fa" ? "font-fa" : "font-serif";
  const fmt = new Intl.DateTimeFormat(l === "fa" ? "fa-IR" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(n.date));

  return (
    <article className="mx-auto max-w-3xl px-6 pt-16 sm:px-10 sm:pt-28">
      <Reveal>
        <Link href={href(l, "/journal")} className="eyebrow link-quiet">
          {l === "fa" ? "→" : "←"} {d.journal.back}
        </Link>
        <p className="eyebrow mt-10">{n.kicker?.[l]}</p>
        <h1 className={`${faTitle} mt-4 text-display-md font-light text-ink`}>{n.title[l]}</h1>
        <p className="mt-4 font-sans text-sm text-stone-light">{fmt}</p>
        <div className="rule-clay mt-8" />
      </Reveal>

      {n.pull && (
        <Reveal delay={0.06}>
          <p className={`${faTitle} my-10 text-2xl font-light leading-snug text-ink sm:text-3xl`}>
            {n.pull[l]}
          </p>
        </Reveal>
      )}

      <Reveal delay={0.08} className="prose-quiet mt-8">
        {n.body[l].map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Reveal>

      <Reveal className="mt-16 border-t border-line pt-8">
        <Link href={href(l, "/journal")} className="font-sans text-sm text-stone link-quiet">
          {l === "fa" ? "→" : "←"} {d.journal.back}
        </Link>
      </Reveal>
    </article>
  );
}
