import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale, getDict } from "@/lib/i18n";
import { href } from "@/lib/nav";
import { blur } from "@/lib/blur";
import { projects } from "@/content/projects";
import Reveal from "@/components/Reveal";
import { PUBLISH_CONATUS } from "@/content/visibility";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "en";
  return { title: `${getDict(l).works.title} — Samira Dadashi` };
}

export default async function WorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const d = getDict(l);

  return (
    <div className="mx-auto max-w-wide px-6 pt-16 sm:px-10 sm:pt-24">
      <Reveal>
        <p className="eyebrow">{d.works.title}</p>
        <h1 className={`${l === "fa" ? "font-fa" : "font-serif"} mt-4 max-w-3xl text-display-lg font-light text-ink`}>
          {d.works.title}
        </h1>
        <p className="prose-quiet mt-6 max-w-reading">
          <span className="font-serif text-stone">{PUBLISH_CONATUS ? d.works.intro : d.works.introSolo}</span>
        </p>
      </Reveal>

      <div className="mt-16 flex flex-col gap-24 sm:mt-24 sm:gap-32">
        {projects.map((p, i) => (
          <Reveal key={p.slug}>
            <Link href={href(l, `/works/${p.slug}`)} className="group block">
              <div className="relative overflow-hidden bg-paper-deep">
                <Image
                  src={p.cover.src}
                  alt={p.cover.alt[l]}
                  width={p.cover.w}
                  height={p.cover.h}
                  priority={i === 0}
                  placeholder="blur"
                  blurDataURL={blur[p.cover.src]}
                  sizes="(max-width: 1280px) 100vw, 1200px"
                  className="h-auto w-full transition-transform duration-[1.4s] ease-quiet group-hover:scale-[1.015]"
                />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <h2 className={`${l === "fa" ? "font-fa" : "font-serif"} text-display-md font-light text-ink`}>
                    {p.title[l]}
                  </h2>
                  <p className="mt-2 font-serif text-lg text-stone">{p.kicker[l]}</p>
                </div>
                <dl className="flex gap-10 font-sans text-sm text-stone sm:justify-end">
                  <div>
                    <dt className="eyebrow mb-1.5">{d.works.year}</dt>
                    <dd>{p.year[l]}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow mb-1.5">{d.works.medium}</dt>
                    <dd className="max-w-[16rem]">{p.medium[l]}</dd>
                  </div>
                </dl>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
