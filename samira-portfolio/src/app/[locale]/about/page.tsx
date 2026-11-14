import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale, getDict } from "@/lib/i18n";
import { href } from "@/lib/nav";
import { blur } from "@/lib/blur";
import { site, about } from "@/content/site";
import Reveal from "@/components/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "en";
  return { title: `${getDict(l).about.title} — Samira Dadashi`, description: about.biography[l][0] };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const d = getDict(l);
  const faTitle = l === "fa" ? "font-fa" : "font-serif";

  return (
    <div className="mx-auto max-w-wide px-6 pt-16 sm:px-10 sm:pt-24">
      <Reveal>
        <p className="eyebrow">{d.about.title}</p>
      </Reveal>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        {/* Text column */}
        <div>
          <Reveal>
            <h1 className={`${faTitle} text-display-md font-light text-ink`}>{site.name[l]}</h1>
            <p className="mt-3 font-serif text-lg text-stone">
              {site.role[l]} · {site.location[l]}
            </p>
          </Reveal>

          <Reveal delay={0.08} className="prose-quiet mt-10 max-w-reading">
            {about.biography[l].map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </Reveal>

          <Reveal className="mt-14">
            <div className="rule-clay mb-5" />
            <h2 className="eyebrow mb-5">{d.about.themes}</h2>
            <ul className="flex flex-col gap-2.5">
              {about.themes[l].map((t) => (
                <li key={t} className={`${faTitle} text-xl font-light text-ink sm:text-2xl`}>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
            <Link href={href(l, "/cv")} className="font-sans text-sm text-ink link-quiet">
              {d.about.downloadCv} {l === "fa" ? "←" : "→"}
            </Link>
            <Link href={href(l, "/contact")} className="font-sans text-sm text-stone link-quiet">
              {d.contact.title}
            </Link>
          </Reveal>
        </div>

        {/* Portrait */}
        <Reveal delay={0.12}>
          <div className="relative overflow-hidden bg-charcoal lg:sticky lg:top-28">
            <Image
              src={about.portrait.src}
              alt={about.portrait.alt[l]}
              width={about.portrait.w}
              height={about.portrait.h}
              placeholder="blur"
              blurDataURL={blur[about.portrait.src]}
              sizes="(max-width:1024px) 100vw, 40vw"
              className="h-auto w-full"
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
