import type { Locale } from "./i18n";

export type Localized<T = string> = Record<Locale, T>;

export interface Artwork {
  src: string;
  w: number;
  h: number;
  /** Descriptive alt text (what is visible) — not an invented title. */
  alt: Localized;
  /** Optional restrained caption (medium/year or the artist's own term). */
  caption?: Localized;
  /** Display emphasis within a sequence. */
  feature?: boolean;
}

export type LayoutMode = "cinematic" | "sequence" | "archive";

export interface Chapter {
  id: string;
  kicker?: Localized;
  title: Localized;
  text?: Localized<string[]>;
  quote?: { text: Localized; source: Localized };
  images: Artwork[];
  /** how this chapter arranges its images */
  mode?: "single" | "diptych" | "triptych" | "grid" | "fullbleed" | "stagger";
}

export interface Project {
  slug: string;
  title: Localized;
  kicker: Localized;
  year: Localized;
  medium: Localized;
  status: "ongoing" | "complete";
  mode: LayoutMode;
  cover: Artwork;
  intro: Localized<string[]>;
  statement?: Localized<string[]>;
  context?: Localized<string[]>;
  chapters?: Chapter[];
  images?: Artwork[];
  order: number;
}

export interface JournalNote {
  slug: string;
  title: Localized;
  date: string; // ISO
  kicker?: Localized;
  body: Localized<string[]>;
  pull?: Localized;
}
