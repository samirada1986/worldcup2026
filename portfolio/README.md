# Samira Dadashi — artist portfolio and CMS

A bilingual (English / فارسی) portfolio for the contemporary photographic artist Samira Dadashi. It combines a public website with an administration panel the artist can manage without code.

**Stack:** Next.js 16 · React 19 · TypeScript · Payload CMS 3 · PostgreSQL · sharp · optional S3 storage. Tests use Playwright and axe-core.

| | |
|---|---|
| Public site | `/en` (default), `/fa` (RTL) — Home, Works, Project, Artwork, Writing, Essay, About, CV, Exhibitions, Publications, Contact |
| CMS | `/admin` — projects with drag-and-drop sequences, bilingual essays with footnotes, media library, profile/CV, site settings, contact inbox, Administrator and Editor roles, drafts, versions, live preview, scheduled publishing |
| API | `/api/*` (REST), `/api/graphql` |

## Local setup

Requirements: Node 22+, PostgreSQL 14+.

Install dependencies:

```bash
npm install
```

Create the environment file, then set `DATABASE_URL`, `PAYLOAD_SECRET` and `SEED_ADMIN_PASSWORD`:

```bash
cp .env.example .env
```

Create the database:

```bash
createdb samira
```

Create the tables:

```bash
npm run migrate
```

Add the admin account, CONATUS with placeholder images, and the profile placeholders:

```bash
npm run seed
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 for the site and http://localhost:3000/admin for the CMS (log in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | development server |
| `npm run build` / `npm start` | production build and server |
| `npm run migrate` | apply database migrations |
| `npm run migrate:create <name>` | create a migration after changing collections or globals |
| `npm run seed` | idempotent first-run content |
| `npm run generate:types` | regenerate `src/payload-types.ts` |
| `npm run lint`, `npm run typecheck` | static checks |
| `npm run test:e2e` | Playwright journeys, accessibility and responsive tests (server and DB must be running) |

## Project structure

```
src/
  app/(frontend)/[locale]/   public pages (EN/FA)
  app/(frontend)/preview/    draft preview for logged-in editors
  app/(payload)/             Payload admin and API (generated)
  collections/ globals/      CMS content model
  blocks/sequence.ts         project layout blocks
  components/                Header, Lightbox, Sequence, RichText, ContactForm …
  lib/                       data access, i18n, SEO, contact security
  styles/site.css            design system (tokens, grid, components)
  migrations/                PostgreSQL migrations
  seed/                      first-run content
tests/e2e/                   Playwright tests
qa/                          screenshot and QA helper scripts
docs/                        project documentation
```

## Documentation

1. [Benchmark analysis](docs/01-benchmark.md)
2. [Design direction and decisions](docs/02-design-direction.md)
3. [Design system](docs/03-design-system.md)
4. [Architecture, IA, sitemap, data model, access control, API](docs/04-architecture.md)
5. [QA report: journeys, responsive, accessibility, performance](docs/05-qa-report.md)
6. [Deployment](docs/06-deployment.md)
7. [CMS guide (فارسی / English) and content still needed](docs/07-cms-guide.md)

## Content integrity

No original CONATUS photographs, project PDF or biography were available in the repository. All artwork images are **labelled placeholders** and all artist texts are visible `[bracketed placeholders]`; nothing biographical was invented. Replace placeholders in the CMS: *Media → Replace file* keeps every page reference intact.
