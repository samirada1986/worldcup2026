# Samira Dadashi — Portfolio

The website of **Samira Dadashi** (سمیرا داداشی), Iranian visual artist and photographer. Bilingual (English + Persian, full right-to-left), built like a quiet gallery and a photobook: the photographs are the experience; the site stays out of their way.

Design documentation (audit, practice assessment, benchmark, directions, design system, QA, open questions): **[`docs/redesign/`](docs/redesign/README.md)**.

---

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · `sharp` (build-time image metadata) · Decap CMS (self-hosted admin) · no animation library (CSS + a tiny observer).

```bash
npm install
npm run dev      # http://localhost:3000  (redirects to /en; Persian at /fa)
npm run build    # type-check + lint + static build
npm run start    # serve the production build
```

---

## Editing content (no code)

Open **`/admin`**. There are two areas:

### Projects
Each project is one series of photographs.

- **Add photographs / reorder:** use *Photographs ▸ Add*, and **drag the grip handle** to change order. The order in the panel is the order on the site; plate numbers follow automatically.
- **Cover:** choose the cover photograph (it must be one of the project's photographs).
- **Layout:** *Editorial sequence* (large plates, pairs, singles), *Visual essay* (one at a time) or *Research archive* (photograph beside a note).
- **Placement (optional, per photograph):** Auto / Large / Pair with next / Single left / Single right.
- **Draft or published:** the **Published** switch. A draft does not exist anywhere on the website (no page, list, sitemap or preview image).
- **Featured on the home page**, **order in the Works list**, **search & sharing (SEO)**: all in the form.
- **Persian is optional** everywhere; if a Persian field is empty, the English text is shown instead.
- Photographs are **never cropped** and **never enlarged beyond their own pixel size**. Upload the largest web version you have; width/height and the blur placeholder are read from the file automatically.

### Biography, CV, Journal & Contact
Edit the biography, CV lists (education, exhibitions, publications, awards), journal notes and contact details. Empty sections simply do not appear. The **Journal** link appears in the navigation only once it has at least one note.

### Where the content lives
`src/content/projects/*.json` · `src/content/data/{about,settings,journal}.json`. The admin panel edits these files through Git; every save is a commit and triggers a new deploy.

### One-time admin setup (Netlify)
1. Netlify dashboard ▸ **Identity ▸ Enable**; then **Identity ▸ Services ▸ Git Gateway ▸ Enable**.
2. Identity ▸ Registration ▸ **Invite only**; invite the artist's email.
3. She logs in at `/admin`.

**Paths in `public/admin/config.yml`** are relative to the *Git repository root*. While this project sits in the `samira-portfolio/` sub-folder of a larger repository they start with `samira-portfolio/`. If the project is moved to its own repository, remove that prefix everywhere in that file.

### Try the admin locally (no login)
```bash
# terminal 1, from the REPOSITORY ROOT:
npx decap-server
# terminal 2, from this folder:
npm run dev
# open http://localhost:3000/admin
```

---

## Deploying on Netlify

1. Import the repository. If this project is in a sub-folder, set **Base directory** to `samira-portfolio`. Next.js is detected automatically (`netlify.toml`).
2. Set **`NEXT_PUBLIC_SITE_URL`** to the final domain (for canonical links, sitemap and sharing previews). If unset, Netlify's own `URL` is used.
3. Add the custom domain; enable Identity + Git Gateway (above).

`npm run build` runs `scripts/copy-cms.mjs` first, which copies the CMS runtime into `public/admin/vendor/` (git-ignored). The editor therefore never depends on a third-party CDN.

---

## Not yet released

Work the artist has not released is kept out of every public surface (pages, lists, sitemap, sharing images, journal, biography, CV, and the browser JavaScript) by a switch in `src/content/visibility.ts`, a non-routed `_`-prefixed page folder, and a guard.

- **The guard:** `npm run build` ends with `scripts/check-private.mjs`, which scans everything a visitor could receive (client bundle, pre-rendered pages, generated sitemap/robots, `public/`) and **fails the build** if unreleased work is mentioned. It exists because a content module imported by a client component is shipped to every visitor in full, even if the page that shows it is hidden.
- **Rule:** client components (`"use client"`) may import only `@/content/identity`, never `site`, `projects` or `visibility`.
- **Releasing:** see the three steps in `src/content/visibility.ts`.
- **The repository itself:** anything committed is visible to anyone who can read the repository, and to its history. Keep the repository private, or keep unreleased text out of it.

---

## Quality gates

`npm run build` type-checks and lints. Measured on a production build with Lighthouse (mobile, simulated slow 4G): Accessibility 100 · Best practices 100 · SEO 100 · Performance 92 (home) / 88 (series). Details and the responsive/RTL checks in `docs/redesign/06-qa-report.md`.

_All photographs © Samira Dadashi. All rights reserved._
