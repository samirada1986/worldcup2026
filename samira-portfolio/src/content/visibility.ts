/**
 * Release switch for work that is still in progress.
 *
 * While `PUBLISH_CONATUS` is false the project does not exist anywhere on the
 * public site: no page, no list entry, no sitemap entry, no journal note, no
 * biography or CV line, no social-preview image and no image files.
 *
 * To release it (all three, in one commit/deploy):
 *   1. set the environment variable NEXT_PUBLIC_PUBLISH_CONATUS=true in Netlify,
 *   2. move the photographs back from /private-assets/conatus to /public/works/conatus,
 *   3. rename src/app/[locale]/works/_conatus  →  src/app/[locale]/works/conatus
 *      (a folder starting with an underscore is not routed and not built).
 * `scripts/check-private.mjs` fails every build while the switch is off if anything a visitor
 * could receive mentions the project. Never import ./site, ./projects or ./visibility from a
 * "use client" file: use ./identity.
 */
export const PUBLISH_CONATUS = process.env.NEXT_PUBLIC_PUBLISH_CONATUS === "true";

/** True for any text that belongs to the unreleased project. */
export const isConatusSlug = (slug: string) => slug === "conatus";

/** Journal notes that discuss the unreleased project (hidden until release). */
export const CONATUS_NOTE_SLUGS = ["the-will-to-persist", "illness-is-not-a-metaphor"];
