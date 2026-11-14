import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale, getDict } from "@/lib/i18n";
import { href } from "@/lib/nav";
import { getProject } from "@/content/projects";
import Reveal from "@/components/Reveal";
import Figure from "@/components/Figure";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "en";
  const p = getProject("documentary")!;
  return { title: `${p.title[l]} — Samira Dadashi`, description: p.intro[l][0], openGraph: { images: [p.cover.src] } };
}

export default async function DocumentaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const d = getDict(l);
  const p = getProject("documentary")!;
  const imgs = p.images!;
  const faTitle = l === "fa" ? "font-fa" : "font-serif";

  return (
    <article className="mx-auto max-w-wide px-6 pt-16 sm:px-10 sm:pt-24">
      {/* Header */}
      <header className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <Reveal>
          <p className="eyebrow">{p.kicker[l]}</p>
          <h1 className={`${faTitle} mt-4 text-display-lg font-light text-ink`}>{p.title[l]}</h1>
          <dl className="mt-8 flex gap-12 font-sans text-sm text-stone">
            <div>
              <dt className="eyebrow mb-1.5">{d.works.year}</dt>
              <dd>{p.year[l]}</dd>
            </div>
            <div>
              <dt className="eyebrow mb-1.5">{d.works.medium}</dt>
              <dd>{p.medium[l]}</dd>
            </div>
          </dl>
        </Reveal>
        <Reveal delay={0.1} className="prose-quiet max-w-reading self-end">
          {p.intro[l].map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </Reveal>
      </header>

      {/* Editorial sequence */}
      <div className="mt-16 flex flex-col gap-14 sm:mt-24 sm:gap-20">
        {/* plate 1 — large opening */}
        <Reveal as="figure">
          <Figure items={imgs} index={0} locale={l} sizes="100vw" plate="01" priority />
        </Reveal>

        {/* 2 — diptych */}
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          <Reveal as="figure" delay={0.04}>
            <Figure items={imgs} index={1} locale={l} sizes="(max-width:768px) 100vw, 45vw" plate="02" />
          </Reveal>
          <Reveal as="figure" delay={0.12} className="sm:pt-16">
            <Figure items={imgs} index={2} locale={l} sizes="(max-width:768px) 100vw, 45vw" plate="03" />
          </Reveal>
        </div>

        {/* 3 — single, offset */}
        <Reveal as="figure" className="w-full sm:max-w-3xl">
          <Figure items={imgs} index={3} locale={l} sizes="(max-width:1024px) 100vw, 60vw" plate="04" />
        </Reveal>

        {/* 4 — diptych reversed */}
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          <Reveal as="figure" delay={0.1} className="sm:order-2 sm:pt-20">
            <Figure items={imgs} index={4} locale={l} sizes="(max-width:768px) 100vw, 45vw" plate="05" />
          </Reveal>
          <Reveal as="figure" delay={0.04} className="sm:order-1">
            <Figure items={imgs} index={5} locale={l} sizes="(max-width:768px) 100vw, 45vw" plate="06" />
          </Reveal>
        </div>

        {/* 5 — single wide, end-aligned */}
        <Reveal as="figure" className="w-full sm:ms-auto sm:max-w-4xl">
          <Figure items={imgs} index={6} locale={l} sizes="(max-width:1024px) 100vw, 70vw" plate="07" />
        </Reveal>

        {/* 6 — closing */}
        <Reveal as="figure" className="w-full sm:max-w-3xl">
          <Figure items={imgs} index={7} locale={l} sizes="(max-width:1024px) 100vw, 60vw" plate="08" />
        </Reveal>
      </div>

      {/* Closing nav */}
      <div className="mt-24 flex flex-col gap-4 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
        <Link href={href(l, "/works")} className="font-sans text-sm text-stone link-quiet">
          {l === "fa" ? "→" : "←"} {d.project.back}
        </Link>
        <Link href={href(l, "/works/conatus")} className="group font-sans text-sm text-ink">
          <span className="eyebrow block text-end">{d.project.next}</span>
          <span className={`${faTitle} text-xl`}>{getProject("conatus")!.title[l]} {l === "fa" ? "←" : "→"}</span>
        </Link>
      </div>
    </article>
  );
}
