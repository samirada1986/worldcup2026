import type { Locale } from "./i18n";

export type Localized<T = string> = Record<Locale, T>;

/** How a photograph asks to be placed in an editorial sequence. */
export type PlateHint = "auto" | "large" | "pair" | "left" | "right";

export interface Artwork {
  src: string;
  /** Intrinsic pixel size. Read from the file at build time when not given. */
  w: number;
  h: number;
  /** Tiny base64 placeholder, generated at build time. */
  blur?: string;
  /** Descriptive alt text (what is visible) — never an invented title. */
  alt: Localized;
  /** Optional caption, only when the artist supplies one. */
  caption?: Localized;
  /** Optional note shown beside the image in archive layouts. */
  text?: Localized<string[]>;
  /** Display emphasis within a sequence (cinematic / chapter layouts). */
  feature?: boolean;
  /** Editorial placement hint. "auto" lets the layout compose the sequence. */
  hint?: PlateHint;
}

/**
 * Project presentation modes. They share one visual language and differ in rhythm:
 *  - essay:     one photograph at a time, long pauses (cinematic visual essay)
 *  - editorial: singles, pairs and offsets (photobook sequence)
 *  - archive:   photographs alongside text, documents and notes (research archive)
 */
export type LayoutMode = "essay" | "editorial" | "archive";

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

export interface ProjectSeo {
  title?: Localized;
  description?: Localized;
  /** Path of the social-sharing image (defaults to the cover). */
  image?: string;
}

export interface Project {
  slug: string;
  title: Localized;
  kicker: Localized;
  /** Empty string = not shown. Never guess dates. */
  year: Localized;
  medium: Localized;
  status: "ongoing" | "complete";
  mode: LayoutMode;
  /** Draft projects are not routed, listed or put in the sitemap. */
  published: boolean;
  featured?: boolean;
  cover: Artwork;
  intro: Localized<string[]>;
  statement?: Localized<string[]>;
  context?: Localized<string[]>;
  chapters?: Chapter[];
  images?: Artwork[];
  seo?: ProjectSeo;
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
