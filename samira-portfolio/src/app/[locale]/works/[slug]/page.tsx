import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, locales, type Locale, getDict } from "@/lib/i18n";
import { href } from "@/lib/nav";
import { site } from "@/content/site";
import { getProject, getProjects } from "@/content/projects";
import Reveal from "@/components/Reveal";
import Sequence from "@/components/Sequence";
import IndexStrip from "@/components/IndexStrip";

// A bespoke project page lives in a private folder (`works/_<name>`, which is not routed) until it is
// released; releasing = rename the folder to `works/<name>` and set the release switch. See README.
const BESPOKE = new Set(["conatus"]);

export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = (await getProjects()).filter((p) => !BESPOKE.has(p.slug));
  return locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? locale : "en";
  const p = await getProject(slug);
  if (!p) return { title: "Not found", robots: { index: false } };
  const title = p.seo?.title?.[l] || `${p.title[l]} — ${site.name[l]}`;
  const description = p.seo?.description?.[l] || p.intro[l][0];
  const image = p.seo?.image || p.cover.src;
  return {
    title,
    description,
    alternates: {
      canonical: `/${l}/works/${p.slug}`,
      languages: { en: `/en/works/${p.slug}`, fa: `/fa/works/${p.slug}`, "x-default": `/en/works/${p.slug}` },
    },
    openGraph: { title, description, type: "article", images: [{ url: image }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || BESPOKE.has(slug)) notFound();
  const l: Locale = locale;
  const d = getDict(l);
  const p = await getProject(slug);
  if (!p) notFound();

  const all = await getProjects();
  const others = all.filter((x) => x.slug !== p.slug);
  const images = p.images ?? [];
  const faTitle = l === "fa" ? "font-fa" : "font-serif";
  const arrow = l === "fa" ? "←" : "→";
  const back = l === "fa" ? "→" : "←";
  const base = href(l, `/works/${p.slug}`);
  const nf = (n: number) => (l === "fa" ? n.toLocaleString("fa-IR") : String(n));

  const ld = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: p.title[l],
    description: p.intro[l][0],
    author: { "@type": "Person", name: site.name[l] },
    image: images.map((im) => ({
      "@type": "ImageObject",
      contentUrl: `${site.url}${im.src}`,
      description: im.alt[l],
      width: im.w,
      height: im.h,
      creator: { "@type": "Person", name: site.name[l] },
    })),
  };

  return (
    <article className="mx-auto max-w-[96rem] px-6 pt-14 sm:px-10 sm:pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* Title page */}
      <header className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow">{p.kicker[l]}</p>
          <h1 className={`${faTitle} mt-4 text-display-lg font-light text-ink`}>{p.title[l]}</h1>
          <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 font-sans text-meta text-stone">
            {p.year[l] && (
              <>
                <dt className="text-stone-light">{d.works.year}</dt>
                <dd>{p.year[l]}</dd>
              </>
            )}
            <dt className="text-stone-light">{d.works.medium}</dt>
            <dd>{p.medium[l]}</dd>
            <dt className="text-stone-light">{d.works.plates}</dt>
            <dd className="tabular-nums">{nf(images.length)}</dd>
          </dl>
        </Reveal>
        <Reveal delay={0.08} className="prose-quiet lg:col-span-6 lg:col-start-7 lg:self-end">
          {p.intro[l].map((t, i) => (
            <p key={i} className={i === 0 ? "!font-light !text-lede !leading-snug text-ink" : ""}>
              {t}
            </p>
          ))}
        </Reveal>
      </header>

      {/* The sequence */}
      <div className="mt-16 sm:mt-24">
        <Sequence images={images} mode={p.mode} locale={l} />
      </div>

      {/* Index + exits */}
      <footer className="mt-28 border-t border-line pt-10 sm:mt-40">
        <Reveal className="mb-10">
          <h2 className="eyebrow mb-5">{d.home.plates}</h2>
          <IndexStrip images={images} base={base} locale={l} />
        </Reveal>
        <div className="mt-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Link href={href(l, "/works")} className="inline-flex min-h-11 items-center font-sans text-ui text-stone link-quiet">
            {back} {d.project.back}
          </Link>
          {others[0] ? (
            <Link href={href(l, `/works/${others[0].slug}`)} className="group text-end">
              <span className="eyebrow block">{d.project.next}</span>
              <span className={`${faTitle} text-display-md font-light text-ink`}>
                {others[0].title[l]} {arrow}
              </span>
            </Link>
          ) : (
            <Link href={href(l, "/about")} className="inline-flex min-h-11 items-center font-sans text-ui text-ink link-quiet">
              {d.about.title} {arrow}
            </Link>
          )}
        </div>
      </footer>
    </article>
  );
}
