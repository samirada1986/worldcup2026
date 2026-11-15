import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale, getDict } from "@/lib/i18n";
import { href } from "@/lib/nav";
import { plateNo } from "@/lib/format";
import { site, about } from "@/content/site";
import { getFeaturedProject } from "@/content/projects";
import Reveal from "@/components/Reveal";
import IndexStrip from "@/components/IndexStrip";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const d = getDict(l);
  const f = await getFeaturedProject();
  if (!f) return null;

  const base = href(l, `/works/${f.slug}`);
  const faTitle = l === "fa" ? "font-fa" : "font-serif";
  const arrow = l === "fa" ? "←" : "→";
  const cover = f.cover;
  const coverIndex = Math.max(0, (f.images ?? []).findIndex((im) => im.src === cover.src));
  const count = (f.images ?? []).length;
  const countLabel = l === "fa" ? `${count.toLocaleString("fa-IR")} عکس` : `${count} photographs`;

  return (
    <>
      {/* ───── Title spread: a typographic page facing a photograph ───── */}
      <section className="mx-auto max-w-[96rem] px-6 pt-8 sm:px-10 sm:pt-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="order-2 flex flex-col justify-between gap-12 lg:order-1 lg:col-span-5 lg:min-h-[min(68vh,620px)]">
            <p className="eyebrow">{site.location[l]}</p>
            <div>
              <h1 className={`${faTitle} text-display-xl font-light text-ink`}>{site.name[l]}</h1>
              <p className="rule-clay mt-8" />
              <p className="mt-6 max-w-sm font-serif text-lede text-stone">{d.home.lede}</p>
            </div>
            <Link href={base} className="group inline-flex min-h-11 w-fit items-center gap-3 font-sans text-ui text-ink">
              <span className="link-quiet">{d.home.enterSeries}</span>
              <span className="transition-transform duration-500 ease-quiet group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                {arrow}
              </span>
              <span className="caption text-stone-light">{countLabel}</span>
            </Link>
          </div>

          <figure className="order-1 lg:order-2 lg:col-span-7" style={{ maxWidth: cover.w }}>
            <Link href={`${base}#plate-${coverIndex + 1}`} className="block overflow-hidden bg-paper-deep">
              <Image
                src={cover.src}
                alt={cover.alt[l]}
                width={cover.w}
                height={cover.h}
                priority
                fetchPriority="high"
                placeholder={cover.blur ? "blur" : "empty"}
                blurDataURL={cover.blur}
                sizes={`(max-width: 1024px) 100vw, min(58vw, ${cover.w}px)`}
                className="h-auto w-full"
              />
            </Link>
            <figcaption className="caption mt-3 flex items-baseline gap-3">
              <span className="tabular-nums text-stone-light">{plateNo(coverIndex, l)}</span>
              <span>{f.title[l]}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ───── The series at a glance ───── */}
      <section className="mx-auto mt-24 max-w-[96rem] px-6 sm:mt-36 sm:px-10">
        <Reveal className="mb-6 flex items-baseline justify-between border-b border-line pb-4">
          <h2 className="eyebrow">{d.home.plates}</h2>
          <Link href={base} className="inline-flex min-h-11 items-center font-sans text-ui text-stone link-quiet">
            {f.title[l]} {arrow}
          </Link>
        </Reveal>
        <Reveal>
          <IndexStrip images={f.images ?? []} base={base} locale={l} />
        </Reveal>
      </section>

      {/* ───── On the practice (her own words) ───── */}
      <section className="mx-auto mt-28 max-w-[96rem] px-6 sm:mt-40 sm:px-10">
        <div className="grid gap-8 border-t border-line pt-12 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-5">
            <h2 className="eyebrow">{d.home.practiceTitle}</h2>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-6 lg:col-start-7">
            <p className={`${faTitle} text-lede font-light text-ink`}>{about.biography[l][0]}</p>
            <Link href={href(l, "/about")} className="mt-6 inline-flex min-h-11 items-center font-sans text-ui text-ink link-quiet">
              {d.about.title} {arrow}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
