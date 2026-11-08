# 4. Architecture, information architecture and data model

## 4.1 Repository discovery

The repository `samirada1986/worldcup2026` contained a single bundled `index.html`, a World Cup 2026 prediction-league app unrelated to this project. It held **no CONATUS photographs, PDF, statement or biography.** The portfolio was therefore built from scratch in `portfolio/`. The existing `index.html` was left untouched, so anything that serves it keeps working.

## 4.2 Stack and trade-offs

| Layer | Choice | Why | Trade-off accepted |
|---|---|---|---|
| Framework | **Next.js 16** (App Router, React 19, TypeScript) | Server rendering + static caching (ISR) for fast pages and good SEO; one codebase for site and CMS | Next majors change often; pinned versions, documented upgrade path |
| CMS | **Payload CMS 3** (runs inside the same Next app) | Real admin with auth and roles; drafts, versions, scheduled publishing, autosave, live preview, field-level **localisation (EN/FA)**, upload processing, Persian admin UI | Younger than WordPress; the team needs basic TypeScript to change the schema |
| Database | **PostgreSQL 16** via `@payloadcms/db-postgres` | Relational and reliable; explicit, reviewable migrations | Schema changes need `migrate:create` (no implicit auto-sync) |
| Storage | Local disk by default; **S3-compatible** (`@payloadcms/storage-s3`) when `S3_BUCKET` is set | Works on a single VPS out of the box; scales to R2, B2, MinIO or Arvan without code changes | — |
| Images | `sharp`: 4 WebP derivatives; original kept | Fast responsive delivery without destroying the master file | Derivatives are regenerated when a file is replaced |
| Styling | Plain CSS design system with tokens and logical properties | The editorial grid and RTL/LTR rules read more clearly as semantic CSS than as utility classes. One small file (≈ 20 KB), no build plugin | **Departs from the suggested Tailwind.** Chosen because bidirectional typography (per-element language islands, Persian-specific rules) is clearer to maintain as tokens + `:lang()` selectors |
| Fonts | Fontsource (self-hosted) | No third-party requests; reliable in Iran | — |
| Email | Nodemailer adapter, only when SMTP is configured | Messages are always stored in the CMS, so email is optional | — |
| Tests | Playwright + axe-core | Real browser journeys, accessibility, responsive checks | Needs a running server and database |

Alternatives considered: **WordPress** (familiar, but bilingual RTL/LTR content needs plugins, and a headless setup doubles the infrastructure), **Sanity / Contentful** (hosted SaaS: vendor lock-in, recurring cost, payment and access problems from Iran), **Strapi** (comparable, but a separate server to run). Payload keeps everything in one deployable app with one database.

## 4.3 Information architecture

```
Home ──┬── Works ─── Project detail ─── Artwork (permalink, one per image)
       ├── Writing ─ Writing detail
       ├── About ──┬─ CV ─── (Exhibitions, Publications summarised)
       │           ├─ Exhibitions
       │           └─ Publications
       └── Contact
```

- **Primary navigation:** Works · Writing · About · Contact, plus the language switch (فارسی / English).
- **Secondary** (footer and mobile menu): CV · Exhibitions · Publications.
- Curators reach the CV in two clicks from anywhere (About → CV), or one from the footer.
- Every artwork has a permalink, so press and editors can enter the site at a single image.

## 4.4 Sitemap and routes

Every public route exists in both languages: `/en/…` (default) and `/fa/…` (RTL). Any path without a language prefix redirects (308) to `/en/…`.

| Route | Rendering | Content |
|---|---|---|
| `/{en,fa}` | static, revalidated on edit | Featured artwork, selected works, introduction, latest writing |
| `/{l}/works` | dynamic (filter param) | Project index |
| `/{l}/works/[slug]` | ISR on demand | Project detail |
| `/{l}/works/[slug]/[n]` | ISR on demand | Artwork n of the project sequence |
| `/{l}/writing` | dynamic (`?topic=`) | Essay index |
| `/{l}/writing/[slug]` | ISR on demand | Essay |
| `/{l}/about`, `/cv`, `/exhibitions`, `/publications` | static, revalidated | Profile and CV |
| `/{l}/contact` | dynamic (fresh anti-spam token) | Contact details and form |
| `/sitemap.xml`, `/robots.txt` | generated | All published URLs with hreflang alternates |
| `/admin` | Payload | CMS |
| `/api/*` | Payload REST + GraphQL | Content API |
| `/preview?path=…`, `/preview/exit` | auth-checked | Draft preview for logged-in users |

Every change in the CMS (collections and globals) calls `revalidatePath('/', 'layout')` in an `afterChange` hook. Pages are cached until something changes, then refreshed on the next request.

## 4.5 Content model (CMS collections)

Fields marked 🌐 are **localised** (separate English and Persian values). Unmarked fields are shared between languages.

**Projects** (drafts + versions + autosave + scheduled publish; drag to reorder)
- title 🌐, slug, year/period, medium 🌐, short description 🌐, representative image, statement 🌐 (rich text)
- **sequence**, ordered blocks: Image sequence · Single image · Two-image spread · Full-width image · Image with text 🌐 · Text 🌐 · White space · Video
- exhibition documentation (images), PDF documents (label 🌐), related writing, credits 🌐
- project status (completed / ongoing / in development), featured, archived, SEO (title, description, image)

**Writing** (drafts + versions + autosave + scheduled publish)
- title 🌐, subtitle 🌐, slug, **published languages** (EN, FA), publication date, topics, excerpt 🌐, cover
- content 🌐: rich text with headings, lists, links, quotes, inline images (text width or wide), **pull quotes** and **inline footnotes** (numbered automatically)
- references 🌐 (citation + URL), related writing, related projects, SEO

**Media**: file plus alt 🌐, title 🌐, caption 🌐, year, medium 🌐, dimensions, credit/edition 🌐, placeholder flag, version note.

**Topics** (title 🌐) · **Exhibitions** (title 🌐, venue 🌐, city 🌐, year, dates 🌐, type, link, project, installation views) · **Publications** (title 🌐, publisher 🌐, year, type, note 🌐, cover, link, PDF) · **Inquiries** (contact messages; read-only, admin-only delete) · **Users** (name, email, role).

**Globals:** *Artist profile & CV* (name 🌐, discipline 🌐, based in 🌐, portrait, short bio 🌐, long bio 🌐, statement 🌐, education, awards, residencies, collections and talks lists 🌐, CV PDFs EN/FA, email, Instagram, representation 🌐, links) · *Site settings* (featured artwork, featured project, selected works order, intro toggle, number of latest texts, navigation 🌐, footer note 🌐, copyright 🌐, site title/description 🌐, social image, contact form on/off, private notification email).

### Database

PostgreSQL schema generated by Payload: **85 tables** in the initial migration `src/migrations/20261108_052041_initial.ts`. Localised fields live in `*_locales` tables keyed by `_locale`. Versions live in `_projects_v*` and `_writings_v*`. Relationships live in `*_rels`. Apply migrations with `npm run migrate`; create new ones after schema changes with `npm run migrate:create <name>`.

## 4.6 Access control

| | Public | Editor | Administrator |
|---|---|---|---|
| Published projects / writing | read | full | full |
| Drafts, archived projects | — | read/write | read/write |
| Media, topics, exhibitions, publications | read | create/update | + delete |
| Artist profile & CV | read | update | update |
| Site settings | read | — | update |
| Inquiries | — | read / mark handled | + delete |
| Users | — | own account only (cannot change own role) | full |
| Delete projects / writing | — | — (archive instead) | yes |

- The first account created is always an administrator.
- Logins lock for 15 minutes after 5 failed attempts. Sessions expire after 8 hours.
- Draft preview (`/preview`) checks the CMS session server-side before enabling Next.js draft mode.

## 4.7 Images and files

1. An upload stores the **original master unchanged** and generates `thumb` 480, `card` 960, `display` 1600 and `large` 2400 px WebP derivatives (never upscaled).
2. Pages use `srcset`/`sizes`; the browser chooses the right file.
3. **Replace file** on a media item keeps its ID. Every project, essay and artwork permalink that uses it updates automatically, and its title, alt text and caption are preserved (covered by an automated test).
4. A "Placeholder" flag marks temporary images. The CMS dashboard counts them until they are replaced.

## 4.8 API

- REST: `/api/projects`, `/api/writings`, `/api/media`, `/api/globals/profile` … with `?locale=en|fa`, `?draft=true` (authenticated) and `depth`.
- GraphQL: `/api/graphql`.
- Same access rules as the site: anonymous requests never see drafts, archived projects, inquiries or users.
- The public site reads through Payload's in-process Local API (no HTTP round trip).
