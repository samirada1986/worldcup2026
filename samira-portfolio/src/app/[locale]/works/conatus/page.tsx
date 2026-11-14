import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale, getDict } from "@/lib/i18n";
import { href } from "@/lib/nav";
import { blur } from "@/lib/blur";
import { getProject } from "@/content/projects";
import Reveal from "@/components/Reveal";
import ChapterGallery from "@/components/ChapterGallery";
import { PUBLISH_CONATUS } from "@/content/visibility";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "en";
  const p = getProject("conatus");
  if (!PUBLISH_CONATUS || !p) return { title: "Not found", robots: { index: false } };
  return {
    title: `${p.title[l]} — Samira Dadashi`,
    description: p.intro[l][0],
    openGraph: { images: [p.cover.src], title: `${p.title[l]} — Samira Dadashi`, description: p.intro[l][0] },
  };
}

export default async function ConatusPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || !PUBLISH_CONATUS) notFound();
  const l: Locale = locale;
  const d = getDict(l);
  const p = getProject("conatus")!;
  const faTitle = l === "fa" ? "font-fa" : "font-serif";

  return (
    <article>
      {/* ───── Cinematic opening ───── */}
      <header className="relative">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal sm:aspect-[21/9]">
          <Image
            src={p.cover.src}
            alt={p.cover.alt[l]}
            fill
            priority
            placeholder="blur"
            blurDataURL={blur[p.cover.src]}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-charcoal/20" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-wide px-6 pb-10 sm:px-10 sm:pb-14">
              <Reveal>
                <p className="eyebrow text-paper/70">{p.kicker[l]}</p>
                <h1 className={`${faTitle} mt-3 text-display-xl font-light text-paper`}>{p.title[l]}</h1>
              </Reveal>
            </div>
          </div>
        </div>
      </header>

      {/* ───── Intro + metadata ───── */}
      <section className="mx-auto max-w-wide px-6 pt-14 sm:px-10 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:gap-20">
          <Reveal className="prose-quiet max-w-reading">
            {p.intro[l].map((t, i) => (
              <p key={i} className={i === 0 ? "!text-xl !leading-relaxed text-ink" : ""}>
                {t}
              </p>
            ))}
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="flex flex-col gap-5 border-t border-line pt-6 font-sans text-sm sm:flex-row sm:gap-12 lg:flex-col lg:border-t-0 lg:border-s lg:ps-10 lg:pt-0">
              <div>
                <dt className="eyebrow mb-1.5">{d.works.year}</dt>
                <dd className="text-ink">{p.year[l]}</dd>
              </div>
              <div>
                <dt className="eyebrow mb-1.5">{d.works.medium}</dt>
                <dd className="max-w-xs text-ink">{p.medium[l]}</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ───── Statement ───── */}
      <section className="mx-auto mt-20 max-w-wide px-6 sm:mt-28 sm:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.5fr_1.5fr] lg:gap-16">
          <Reveal>
            <div className="rule-clay mb-5" />
            <h2 className="eyebrow">{d.project.statement}</h2>
          </Reveal>
          <Reveal delay={0.08} className="prose-quiet max-w-reading">
            {p.statement![l].map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ───── Movements ───── */}
      {p.chapters?.map((c) => (
        <section key={c.id} className="mt-24 sm:mt-36">
          {/* Dark divider — echoes the printed portfolio's section pages */}
          <Reveal>
            <div className="bg-charcoal py-16 sm:py-24">
              <div className="mx-auto max-w-wide px-6 sm:px-10">
                <div className="rule-clay mb-6" />
                {c.kicker && <p className="eyebrow mb-4 text-paper/50">{c.kicker[l]}</p>}
                <h2 className={`${faTitle} text-display-lg font-light text-paper`}>{c.title[l]}</h2>
              </div>
            </div>
          </Reveal>

          <div className="mx-auto max-w-wide px-6 pt-14 sm:px-10 sm:pt-20">
            {/* quote + text */}
            {(c.quote || c.text) && (
              <div className="mb-14 grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-20 sm:mb-20">
                {c.quote ? (
                  <Reveal>
                    <blockquote className={`${faTitle} text-2xl font-light leading-snug text-ink sm:text-[1.7rem]`}>
                      <span className="text-clay">«</span>
                      {c.quote.text[l]}
                      <span className="text-clay">»</span>
                    </blockquote>
                    <cite className="eyebrow mt-4 block not-italic">{c.quote.source[l]}</cite>
                  </Reveal>
                ) : (
                  <div className="hidden lg:block" />
                )}
                {c.text && (
                  <Reveal delay={0.08} className="prose-quiet max-w-reading">
                    {c.text[l].map((t, i) => (
                      <p key={i}>{t}</p>
                    ))}
                  </Reveal>
                )}
              </div>
            )}

            <ChapterGallery images={c.images} mode={c.mode} locale={l} />
          </div>
        </section>
      ))}

      {/* ───── Research & context ───── */}
      {p.context && (
        <section className="mx-auto mt-28 max-w-wide px-6 sm:mt-40 sm:px-10">
          <div className="border-t border-line pt-14">
            <div className="grid gap-8 lg:grid-cols-[0.5fr_1.5fr] lg:gap-16">
              <Reveal>
                <h2 className="eyebrow">{d.project.context}</h2>
              </Reveal>
              <Reveal delay={0.08} className="prose-quiet max-w-reading">
                {p.context[l].map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
                <p className="!mt-8 !mb-0 font-sans !text-sm text-stone-light">
                  Spinoza · Susan Sontag, <em>Illness as Metaphor</em> · Deleuze &amp; Guattari, <em>A Thousand Plateaus</em>
                </p>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ───── Closing ───── */}
      <section className="mx-auto mt-24 max-w-wide px-6 sm:mt-32 sm:px-10">
        <div className="flex flex-col gap-4 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
          <Link href={href(l, "/works")} className="font-sans text-sm text-stone link-quiet">
            {l === "fa" ? "→" : "←"} {d.project.back}
          </Link>
          <Link href={href(l, "/works/documentary")} className="group font-sans text-sm text-ink">
            <span className="eyebrow block text-end">{d.project.next}</span>
            <span className={`${faTitle} text-xl`}>
              {getProject("documentary")!.title[l]} {l === "fa" ? "←" : "→"}
            </span>
          </Link>
        </div>
      </section>
    </article>
  );
}
