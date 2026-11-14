import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale, getDict } from "@/lib/i18n";
import { href } from "@/lib/nav";
import { blur } from "@/lib/blur";
import { site, about } from "@/content/site";
import { projects, featuredProject } from "@/content/projects";
import Reveal from "@/components/Reveal";
import { PUBLISH_CONATUS } from "@/content/visibility";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const d = getDict(l);
  const f = featuredProject;
  const fHref = href(l, `/works/${f.slug}`);
  const featuredLabel = PUBLISH_CONATUS ? d.home.featured : d.home.selectedSeries;
  const enterLabel = PUBLISH_CONATUS ? d.home.enterConatus : d.works.view;

  return (
    <>
      {/* ───── Hero ───── */}
      <section className="mx-auto max-w-wide px-6 sm:px-10">
        <div className="grid items-end gap-10 pb-10 pt-10 sm:pt-16 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <p className="eyebrow mb-7">{featuredLabel}</p>
            <h1 className="font-serif text-display-lg font-light text-ink">
              {site.name[l]}
            </h1>
            <p className="mt-4 max-w-sm font-serif text-lg leading-relaxed text-stone">
              {d.site.role} · {site.location[l]}
            </p>
            <Link
              href={fHref}
              className="group mt-9 inline-flex items-center gap-3 font-sans text-sm text-ink"
            >
              <span className="link-quiet">{enterLabel}</span>
              <span className="transition-transform duration-500 ease-quiet group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                {l === "fa" ? "←" : "→"}
              </span>
            </Link>
          </Reveal>

          <Reveal delay={0.12} className="order-1 lg:order-2">
            <Link
              href={fHref}
              className="group relative block overflow-hidden bg-paper-deep"
            >
              <Image
                src={f.cover.src}
                alt={f.cover.alt[l]}
                width={f.cover.w}
                height={f.cover.h}
                priority
                placeholder="blur"
                blurDataURL={blur[f.cover.src]}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="h-auto w-full transition-transform duration-[1.3s] ease-quiet group-hover:scale-[1.02]"
              />
              <span className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-end justify-between bg-gradient-to-t from-charcoal/55 to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <span className={`${l === "fa" ? "font-fa" : "font-serif"} text-xl text-paper`}>
                  {f.title[l]}
                </span>
                <span className="eyebrow text-paper/70">{f.kicker[l]}</span>
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {PUBLISH_CONATUS && f.statement && (
      <section className="mx-auto mt-24 max-w-wide px-6 sm:mt-32 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
          <Reveal>
            <div className="rule-clay mb-6" />
            <h2 className={`${l === "fa" ? "font-fa" : "font-serif"} text-display-md font-light text-ink`}>
              {f.title[l]}
            </h2>
            <p className="eyebrow mt-4">{f.kicker[l]}</p>
          </Reveal>
          <Reveal delay={0.1} className="prose-quiet max-w-reading">
            {f.statement[l].slice(0, 2).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <Link
              href={fHref}
              className="mt-2 inline-block font-sans text-sm text-ink link-quiet"
            >
              {enterLabel} {l === "fa" ? "←" : "→"}
            </Link>
          </Reveal>
        </div>
      </section>

      )}

      {/* ───── Selected works ───── */}
      <section className="mx-auto mt-28 max-w-wide px-6 sm:mt-40 sm:px-10">
        <Reveal className="mb-10 flex items-baseline justify-between border-b border-line pb-5">
          <h2 className="eyebrow">{d.home.selectedWorks}</h2>
          <Link href={href(l, "/works")} className="font-sans text-sm text-stone link-quiet">
            {d.home.viewAll}
          </Link>
        </Reveal>

        <div className="flex flex-col gap-20 sm:gap-28">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={0.05}>
              <Link
                href={href(l, `/works/${p.slug}`)}
                className="group grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:gap-14"
              >
                <div className="relative overflow-hidden bg-paper-deep">
                  <Image
                    src={p.cover.src}
                    alt={p.cover.alt[l]}
                    width={p.cover.w}
                    height={p.cover.h}
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    placeholder="blur"
                    blurDataURL={blur[p.cover.src]}
                    className="h-auto w-full transition-transform duration-[1.3s] ease-quiet group-hover:scale-[1.02]"
                  />
                </div>
                <div className={i % 2 === 1 ? "lg:order-first lg:text-right rtl:lg:text-left" : ""}>
                  <p className="eyebrow mb-4">
                    {p.status === "ongoing" ? d.works.ongoing : p.year[l]}
                  </p>
                  <h3 className={`${l === "fa" ? "font-fa" : "font-serif"} text-display-md font-light text-ink`}>
                    {p.title[l]}
                  </h3>
                  <p className="mt-4 max-w-sm font-serif text-lg leading-relaxed text-stone lg:ms-auto">
                    {p.kicker[l]}
                  </p>
                  <span className="mt-6 inline-block font-sans text-sm text-ink link-quiet">
                    {d.works.view} {l === "fa" ? "←" : "→"}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───── On the practice ───── */}
      <section className="mx-auto mt-28 max-w-wide px-6 sm:mt-40 sm:px-10">
        <div className="grid gap-10 border-t border-line pt-14 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
          <Reveal>
            <h2 className="eyebrow">{d.home.practiceTitle}</h2>
          </Reveal>
          <Reveal delay={0.1} className="max-w-reading">
            <p className="font-serif text-2xl font-light leading-snug text-ink">
              {about.biography[l][1]}
            </p>
            <Link
              href={href(l, "/about")}
              className="mt-8 inline-block font-sans text-sm text-ink link-quiet"
            >
              {d.about.title} {l === "fa" ? "←" : "→"}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
