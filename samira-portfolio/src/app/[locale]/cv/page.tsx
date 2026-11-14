import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale, getDict } from "@/lib/i18n";
import { site, cv } from "@/content/site";
import Reveal from "@/components/Reveal";
import PrintButton from "@/components/PrintButton";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "en";
  return { title: `${getDict(l).cv.title} — Samira Dadashi` };
}

function Section({
  title,
  items,
  faFont,
}: {
  title: string;
  items: string[];
  faFont: boolean;
}) {
  if (!items.length) return null;
  return (
    <Reveal as="section" className="grid gap-4 border-t border-line py-7 sm:grid-cols-[0.5fr_1.5fr] sm:gap-10">
      <h2 className="eyebrow pt-1">{title}</h2>
      <ul className="flex flex-col gap-2.5">
        {items.map((it) => (
          <li key={it} className={`${faFont ? "font-fa" : "font-serif"} text-lg leading-relaxed text-ink`}>
            {it}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export default async function CVPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const d = getDict(l);
  const faFont = l === "fa";
  const s = d.cv.sections;

  return (
    <div className="mx-auto max-w-4xl px-6 pt-16 sm:px-10 sm:pt-24">
      <Reveal className="flex flex-col gap-6 pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{d.cv.title}</p>
          <h1 className={`${faFont ? "font-fa" : "font-serif"} mt-4 text-display-md font-light text-ink`}>
            {site.name[l]}
          </h1>
          <p className="mt-2 font-serif text-lg text-stone">
            {site.role[l]} · {d.cv.based}
          </p>
        </div>
        <PrintButton label={d.cv.download} />
      </Reveal>

      <div className="mt-4">
        <Reveal as="section" className="grid gap-4 border-t border-line py-7 sm:grid-cols-[0.5fr_1.5fr] sm:gap-10">
          <h2 className="eyebrow pt-1">{s.profile}</h2>
          <div className="prose-quiet max-w-reading">
            {cv.profile[l].map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>

        <Section title={s.education} items={cv.education[l]} faFont={faFont} />
        <Section title={s.projects} items={cv.projects[l]} faFont={faFont} />
        <Section title={s.exhibitions} items={cv.exhibitions[l]} faFont={faFont} />
        <Section title={s.publications} items={cv.publications[l]} faFont={faFont} />
        <Section title={s.awards} items={cv.awards[l]} faFont={faFont} />

        <Reveal as="section" className="grid gap-4 border-y border-line py-7 sm:grid-cols-[0.5fr_1.5fr] sm:gap-10">
          <h2 className="eyebrow pt-1">{s.contact}</h2>
          <ul className="flex flex-col gap-2 font-sans text-base text-ink">
            <li>
              <a href={`mailto:${site.email}`} className="link-quiet">{site.email}</a>
            </li>
            <li>
              <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="link-quiet">
                @{site.instagram}
              </a>
            </li>
            <li className="text-stone">{site.location[l]}</li>
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
