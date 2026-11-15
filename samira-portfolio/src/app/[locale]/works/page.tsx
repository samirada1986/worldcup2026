import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale, getDict } from "@/lib/i18n";
import { href } from "@/lib/nav";
import { getProjects } from "@/content/projects";
import Reveal from "@/components/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "en";
  return { title: `${getDict(l).works.title} — Samira Dadashi`, alternates: { canonical: `/${l}/works` } };
}

export default async function WorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const d = getDict(l);
  const projects = await getProjects();
  const faTitle = l === "fa" ? "font-fa" : "font-serif";
  const arrow = l === "fa" ? "←" : "→";
  const nf = (n: number) => (l === "fa" ? n.toLocaleString("fa-IR") : String(n));

  return (
    <div className="mx-auto max-w-[96rem] px-6 pt-14 sm:px-10 sm:pt-20">
      <Reveal className="grid gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">{d.works.title}</p>
          <h1 className={`${faTitle} mt-4 text-display-lg font-light text-ink`}>{d.works.title}</h1>
        </div>
        <p className="font-serif text-lede text-stone lg:col-span-6 lg:col-start-7 lg:self-end">
          {d.works.introSolo}
        </p>
      </Reveal>

      <ul className="mt-14 border-t border-line sm:mt-20">
        {projects.map((p) => {
          const count = p.images?.length ?? p.chapters?.reduce((n, c) => n + c.images.length, 0) ?? 0;
          return (
            <li key={p.slug} className="border-b border-line">
              <Reveal>
                <Link
                  href={href(l, `/works/${p.slug}`)}
                  className="group grid gap-6 py-10 sm:py-14 lg:grid-cols-12 lg:items-end lg:gap-12"
                >
                  <div className="lg:col-span-7">
                    <div className="overflow-hidden bg-paper-deep" style={{ maxWidth: p.cover.w }}>
                      <Image
                        src={p.cover.src}
                        alt={p.cover.alt[l]}
                        width={p.cover.w}
                        height={p.cover.h}
                        placeholder={p.cover.blur ? "blur" : "empty"}
                        blurDataURL={p.cover.blur}
                        sizes={`(max-width: 1024px) 100vw, min(52vw, ${p.cover.w}px)`}
                        className="h-auto w-full transition-opacity duration-500 group-hover:opacity-90"
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-4 lg:col-start-9">
                    <p className="eyebrow">{p.status === "ongoing" ? d.works.ongoing : p.kicker[l]}</p>
                    <h2 className={`${faTitle} mt-3 text-display-md font-light text-ink`}>{p.title[l]}</h2>
                    <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 font-sans text-meta text-stone">
                      {p.year[l] && (
                        <>
                          <dt className="text-stone-light">{d.works.year}</dt>
                          <dd>{p.year[l]}</dd>
                        </>
                      )}
                      <dt className="text-stone-light">{d.works.medium}</dt>
                      <dd>{p.medium[l]}</dd>
                      {count > 0 && (
                        <>
                          <dt className="text-stone-light">{d.works.plates}</dt>
                          <dd className="tabular-nums">{nf(count)}</dd>
                        </>
                      )}
                    </dl>
                    <span className="mt-8 inline-block font-sans text-ui text-ink link-quiet">
                      {d.works.view} {arrow}
                    </span>
                  </div>
                </Link>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
