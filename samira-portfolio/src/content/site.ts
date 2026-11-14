import type { Localized, JournalNote } from "@/lib/types";
import settings from "./data/settings.json";
import journalData from "./data/journal.json";
import { PUBLISH_CONATUS, CONATUS_NOTE_SLUGS } from "./visibility";

export const site = {
  name: { en: "Samira Dadashi", fa: "سمیرا داداشی" } as Localized,
  role: { en: "Visual artist & photographer", fa: "هنرمند تجسمی و عکاس" } as Localized,
  location: { en: "Tehran, Iran", fa: "تهران، ایران" } as Localized,
  email: settings.email,
  instagram: settings.instagram,
  instagramUrl: `https://instagram.com/${settings.instagram}`,
  url: "https://samiradadashi.com",
};

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
  biography: {
    en: [
      "Samira Dadashi is an Iranian visual artist and photographer based in Tehran. She has worked in photography for close to a decade, beginning with documentary and street work — images concerned, above all, with the relationship between people and their surroundings, with everyday moments and lived experience.",
      "In recent years her practice has turned toward personal, long-term projects: works that begin from an individual experience and reach toward a wider question about the human, the body, and what it is to live through something.",
      "Trained in pure mathematics and industrial engineering, she works alongside her art practice as a senior product manager in digital products. This interdisciplinary background lends her work a research-driven, structured eye.",
      "Her most recent series, Conatus, took shape from a personal encounter with cancer. It began as a record of the everyday experience of illness and, through a parallel reading of philosophical and theoretical texts, became an inquiry into the nature of illness, survival, and the mechanisms of growth and transformation.",
    ],
    fa: [
      "سمیرا داداشی هنرمندِ تجسمی و عکاسِ ایرانی، ساکنِ تهران است. او نزدیک به یک دهه در حوزه‌ی عکاسی فعالیت کرده و کارِ خود را با عکاسیِ مستند و خیابانی آغاز کرده است؛ آثاری که در آن‌ها بیش از هر چیز به رابطه‌ی انسان با محیط، لحظه‌های روزمره و تجربه‌های زیسته توجه شده است.",
      "در سال‌های اخیر مسیرِ کاریِ او به‌سمتِ پروژه‌های شخصی و بلندمدت تغییر کرده است؛ پروژه‌هایی که از یک تجربه‌ی فردی آغاز می‌شوند و می‌کوشند آن را به پرسشی عمومی‌تر درباره‌ی انسان، بدن و تجربه‌ی زیستن بدل کنند.",
      "سمیرا دانش‌آموخته‌ی ریاضیِ محض و مهندسیِ صنایع است و در کنارِ فعالیتِ هنری، به‌عنوانِ مدیرِ ارشدِ محصول در حوزه‌ی محصولاتِ دیجیتال کار می‌کند. این پیشینه‌ی میان‌رشته‌ای، نگاهی پژوهش‌محور و ساختارمند به توسعه‌ی پروژه‌های هنریِ او بخشیده است.",
      "جدیدترین مجموعه‌ی او، کوناتوس، از مواجهه‌ی شخصی‌اش با سرطان شکل گرفته است؛ پروژه‌ای که با ثبتِ تجربه‌ی روزمره‌ی بیماری آغاز شد و در ادامه، هم‌زمان با مطالعه‌ی متونِ فلسفی و نظری، به جست‌وجویی درباره‌ی ماهیتِ بیماری، بقا و سازوکارهای رشد و دگرگونی بدل گشت.",
    ],
  } as Localized<string[]>,
  themes: {
    en: [
      "The body as a site of memory",
      "Visibility and invisibility",
      "Trace, residue and absence",
      "Persistence, fragility and transformation",
      "The limits of photographic representation",
    ],
    fa: [
      "بدن به‌مثابه جایگاهِ حافظه",
      "آشکارگی و پنهانی",
      "ردّ، پس‌مانده و غیاب",
      "تداوم، شکنندگی و دگرگونی",
      "مرزهای بازنماییِ عکاسانه",
    ],
  } as Localized<string[]>,
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
  education: {
    en: ["M.A. — Industrial Engineering", "B.Sc. — Pure Mathematics"],
    fa: ["کارشناسی ارشد — مهندسی صنایع", "کارشناسی — ریاضیِ محض"],
  } as Localized<string[]>,
  projects: {
    en: [
      ...(PUBLISH_CONATUS ? ["Conatus — ongoing (2025–)"] : []),
      "Documentary & street photography (2016–2022)",
    ],
    fa: [
      ...(PUBLISH_CONATUS ? ["کوناتوس — در حال انجام (۱۴۰۴–)"] : []),
      "عکاسیِ مستند و خیابانی (۱۳۹۵–۱۴۰۱)",
    ],
  } as Localized<string[]>,
  // Curator-facing, artist-maintained sections (editable via the CMS).
  exhibitions: settings.cv.exhibitions as Localized<string[]>,
  publications: settings.cv.publications as Localized<string[]>,
  awards: settings.cv.awards as Localized<string[]>,
};

/** Notes written about unreleased work stay hidden until it is released. */
const hiddenNotes = new Set(CONATUS_NOTE_SLUGS);
export const journal: JournalNote[] = (journalData.notes as unknown as JournalNote[]).filter(
  (n) => PUBLISH_CONATUS || !hiddenNotes.has(n.slug)
);

export const getNote = (slug: string) => journal.find((n) => n.slug === slug);
