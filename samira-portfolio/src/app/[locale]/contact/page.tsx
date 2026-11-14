import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale, getDict } from "@/lib/i18n";
import { site } from "@/content/site";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "en";
  return { title: `${getDict(l).contact.title} — Samira Dadashi` };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const l: Locale = locale;
  const d = getDict(l);
  const faTitle = l === "fa" ? "font-fa" : "font-serif";

  return (
    <div className="mx-auto max-w-wide px-6 pt-16 sm:px-10 sm:pt-24">
      <Reveal className="max-w-3xl">
        <p className="eyebrow">{d.contact.title}</p>
        <h1 className={`${faTitle} mt-4 text-display-lg font-light text-ink`}>{d.contact.title}</h1>
        <p className="prose-quiet mt-6 max-w-reading">
          <span className="font-serif text-stone">{d.contact.intro}</span>
        </p>
      </Reveal>

      <div className="mt-16 grid gap-14 border-t border-line pt-14 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
        <Reveal>
          <dl className="flex flex-col gap-8">
            <div>
              <dt className="eyebrow mb-2">{d.contact.email}</dt>
              <dd>
                <a href={`mailto:${site.email}`} className={`${faTitle} text-xl text-ink link-quiet`}>
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow mb-2">{d.contact.instagram}</dt>
              <dd>
                <a
                  href={site.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${faTitle} text-xl text-ink link-quiet`}
                >
                  @{site.instagram}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow mb-2">{d.contact.location}</dt>
              <dd className={`${faTitle} text-xl text-ink`}>{site.location[l]}</dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={0.1}>
          <ContactForm d={d} />
        </Reveal>
      </div>
    </div>
  );
}
