# Samira Dadashi — Portfolio

The digital home of **Samira Dadashi** (سمیرا داداشی), Iranian visual artist and
photographer — an exhibition-quality, bilingual (English + Persian/RTL) portfolio
built around her documentary work and the ongoing project **Conatus**.

Built to feel like a quiet contemporary-art exhibition: warm paper and ink, a
single restrained clay accent, generous whitespace, and photography that stays
the dominant experience.

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v3 (design tokens in `tailwind.config.ts` / `globals.css`) |
| Motion | Framer Motion (quiet reveals; respects `prefers-reduced-motion`) |
| Fonts | Fraunces (display serif), Inter (UI), Vazirmatn (Persian) — self-hosted via `next/font` |
| i18n | `/en` (default) and `/fa` (full RTL), middleware-routed, `hreflang` + localized metadata |
| CMS | Decap CMS (git-based) at `/admin` for Journal + Contact/CV |
| Images | `next/image` (AVIF/WebP, responsive, blur placeholders) |

---

## Local development

```bash
npm install
npm run dev
```

Then open <http://localhost:3000> (it redirects to `/en`, or `/fa` for Persian).

```bash
npm run build   # production build (also type-checks + lints)
npm run start   # serve the production build
```

---

## Project structure

```
src/
  app/[locale]/            # all pages, per-locale (en | fa)
    page.tsx               # home
    works/                 # archive, conatus, documentary
    about/ cv/ journal/ contact/
    layout.tsx             # <html lang/dir>, fonts, header/footer, JSON-LD
  components/              # Header, Footer, Figure, LightboxProvider, ChapterGallery, …
  content/
    projects.ts            # Conatus + Documentary (text, chapters, image lists)
    site.ts                # bio, themes, CV, journal, contact
    data/                  # CMS-editable JSON (journal.json, settings.json)
  lib/                     # i18n dictionaries, types, nav, blur placeholders
  middleware.ts            # locale routing
public/
  works/ about/ og/        # the photographs (optimised web versions)
  admin/                   # Decap CMS (config.yml + index.html)
```

---

## Content management

There are two editing surfaces, by design:

### 1. Browser CMS — `/admin` (no coding)

[Decap CMS](https://decapcms.org) edits **Journal notes** and **Contact / CV
lists** (exhibitions, publications, awards) straight from the browser, committing
to GitHub. These are the things that change often.

**One-time setup after deploying:**

1. In `public/admin/config.yml`, set `repo:` to your GitHub repository.
2. Connect an auth backend — the simplest options:
   - **Netlify:** host on Netlify and enable *Identity* + *Git Gateway*, or
   - **GitHub OAuth:** deploy a small OAuth proxy (e.g. one of the community
     [external OAuth clients](https://decapcms.org/docs/external-oauth-clients/)).
3. Visit `yourdomain.com/admin` and log in.

**Try it locally (no login):**

```bash
npx decap-server      # terminal 1
npm run dev           # terminal 2
# open http://localhost:3000/admin  (uses your local git via local_backend)
```

### 2. Content files — projects & biography (structured editing)

The **projects** (Conatus, Documentary) have bespoke, curated gallery layouts, so
they live in `src/content/projects.ts` as clean, commented, bilingual data. The
**biography / themes** live in `src/content/site.ts`. Editing these is a small,
safe text change — no layout code involved.

#### Adding a new project

1. Drop optimised images into `public/works/<project>/…` (see *Preparing images*).
2. Add a `Project` object to `src/content/projects.ts` (copy an existing one as a
   template). Each image needs `src`, intrinsic `w`/`h`, and bilingual `alt`.
3. Add a route folder `src/app/[locale]/works/<slug>/page.tsx` — reuse the
   Conatus page (chapters) or Documentary page (sequence) as a starting point.
4. Regenerate blur placeholders: see `scripts` note below.

#### Preparing images

Originals should never be published at full print resolution. Export web versions
(long edge ≈ 2000px, quality ~88) and keep the aspect ratio — **artwork is never
cropped** by the layout. After adding images, regenerate the tiny blur
placeholders in `src/lib/blur.ts` (a short ImageMagick/sharp loop; ask your
developer, or see the project notes).

---

## Internationalization & RTL

- English is the default (`/en`); Persian (`/fa`) is a full right-to-left
  experience — not a mirrored afterthought — using Vazirmatn.
- The visitor's first visit is routed by their browser language; their choice is
  remembered via a cookie.
- Every page sets `lang` + `dir`, localized `<title>`/description, and `hreflang`
  alternates. A sitemap and robots file are generated automatically.

---

## Deployment

### Netlify (recommended — also powers the `/admin` CMS)

1. Push this project to a GitHub repository.
2. In Netlify: **Add new site → Import an existing project →** pick the repo.
   - If the project lives in a subfolder, set **Base directory** to that folder
     (e.g. `samira-portfolio`).
   - Build command `npm run build` and the Next.js runtime are detected
     automatically (`netlify.toml` makes this explicit). No env vars required.
3. Deploy. Add your custom domain.
4. **Enable the CMS login:** Netlify dashboard → **Identity** → *Enable Identity*;
   then **Identity → Services → Git Gateway → Enable**. Under Identity →
   *Registration*, set it to **Invite only** and invite the artist's email.
   She can then log in at `yourdomain.com/admin`.
5. Update the hard-coded site URL in `src/app/sitemap.ts`, `robots.ts`, and
   `layout.tsx` (`metadataBase`) to the real domain.

### Vercel (alternative)

Import the repo in Vercel → it detects Next.js and deploys with no config. For
the `/admin` CMS there, switch the Decap backend in `public/admin/config.yml`
from `git-gateway` to `github` and connect a GitHub OAuth proxy.

---

## What is real, and what is waiting on content

Everything is sourced from the artist's own portfolio — **no biography,
exhibitions, awards or statements are invented.**

- **Real & complete:** biography, practice themes, Conatus statement + research
  (Spinoza · Sontag · Deleuze & Guattari), the four Conatus movements (Archival,
  Root, Overlap, Erosion), documentary sequence, two journal notes (drawn from
  her own writing), all photographs.
- **Intentionally empty, ready for her to fill (via `/admin`):** CV *Exhibitions*,
  *Publications*, and *Awards & grants*. These sections simply don't appear on the
  public CV until entries are added.
- **Placeholders to revisit:** education degrees and project date ranges are
  reasonable from the biography but should be confirmed; the English site URL
  `samiradadashi.com` is assumed — change it to the real domain.

---

## Accessibility & performance

- Semantic HTML, skip-link, keyboard-operable nav and lightbox (Esc / arrows),
  visible focus styles, descriptive `alt` text on every image.
- WCAG-AA-minded contrast; motion fully disabled under `prefers-reduced-motion`.
- Static generation, responsive images with AVIF/WebP, lean JS (~150 kB first load).

---

_All photographs © Samira Dadashi. All rights reserved._
