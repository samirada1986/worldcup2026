/**
 * Release switch for work that is still in progress.
 *
 * While `PUBLISH_CONATUS` is false the project does not exist anywhere on the
 * public site: no page, no list entry, no sitemap entry, no journal note, no
 * biography or CV line, no social-preview image and no image files.
 *
 * To release it: set the environment variable NEXT_PUBLIC_PUBLISH_CONATUS=true
 * in Netlify AND move the photographs back from /private-assets/conatus to
 * /public/works/conatus (see README, "Releasing Conatus").
 */
export const PUBLISH_CONATUS = process.env.NEXT_PUBLIC_PUBLISH_CONATUS === "true";

/** True for any text that belongs to the unreleased project. */
export const isConatusSlug = (slug: string) => slug === "conatus";

/** Journal notes that discuss the unreleased project (hidden until release). */
export const CONATUS_NOTE_SLUGS = ["the-will-to-persist", "illness-is-not-a-metaphor"];
