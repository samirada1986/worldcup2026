import type { Localized, JournalNote } from "@/lib/types";
import settings from "./data/settings.json";
import aboutData from "./data/about.json";
import { withFallback } from "@/lib/localized";
import journalData from "./data/journal.json";
import { PUBLISH_CONATUS, CONATUS_NOTE_SLUGS } from "./visibility";

export { site } from "./identity";

/** Keep only the first `n` paragraphs while unreleased work is hidden. */
const released = <T,>(items: T[], n: number) => (PUBLISH_CONATUS ? items : items.slice(0, n));

const aboutFull = {
  portrait: {
    src: "/about/portrait-samira.jpg",
    w: 962,
    h: 1053,
    alt: {
      en: "Portrait of the artist Samira Dadashi against a dark ground.",
      fa: "پرتره‌ی سمیرا داداشی بر زمینه‌ای تیره.",
    } as Localized,
  },
  biography: withFallback(aboutData.biography) as Localized<string[]>,
  themes: withFallback(aboutData.themes) as Localized<string[]>,
};

export const about = {
  ...aboutFull,
  biography: {
    en: released(aboutFull.biography.en, 3),
    fa: released(aboutFull.biography.fa, 3),
  } as Localized<string[]>,
};

/** CV: verified entries only; curator-facing sections the artist keeps current. */
export const cv = {
  profile: about.biography,
  // Degree levels, institutions and years were not supplied: listed by field only.
  education: withFallback(aboutData.education) as Localized<string[]>,
  projects: {
    en: [
      ...(PUBLISH_CONATUS ? ["Conatus — ongoing (2025–)"] : []),
      "Documentary & street photography",
    ],
    fa: [
      ...(PUBLISH_CONATUS ? ["کوناتوس — در حال انجام (۱۴۰۴–)"] : []),
      "عکاسیِ مستند و خیابانی",
    ],
  } as Localized<string[]>,
  // Curator-facing, artist-maintained sections (editable via the CMS).
  exhibitions: settings.cv.exhibitions as Localized<string[]>,
  publications: settings.cv.publications as Localized<string[]>,
  awards: settings.cv.awards as Localized<string[]>,
};

/** Notes written about unreleased work stay hidden until it is released. */
const hiddenNotes = new Set(CONATUS_NOTE_SLUGS);
export const journal: JournalNote[] = (withFallback(journalData.notes) as unknown as JournalNote[]).filter(
  (n) => PUBLISH_CONATUS || !hiddenNotes.has(n.slug)
);

export const getNote = (slug: string) => journal.find((n) => n.slug === slug);
