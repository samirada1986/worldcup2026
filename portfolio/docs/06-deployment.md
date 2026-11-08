# 6. Deployment

The site is a single Node.js app (website + CMS + API) plus PostgreSQL, with optional S3-compatible storage and SMTP.

## Requirements

- Node.js 22 (`^22.23.4`) or 24
- PostgreSQL 14+ (tested on 16)
- About 1 GB RAM for the app; the build uses up to 8 GB (`--max-old-space-size=8000`), so build on a machine or CI runner with enough memory
- Persistent disk for `./media` **or** an S3-compatible bucket

## Option A — VPS (Ubuntu) with PM2 or systemd

Run these commands on the server, one at a time.

Get the code and install dependencies:

```bash
git clone https://github.com/samirada1986/worldcup2026.git && cd worldcup2026/portfolio
```

```bash
npm ci
```

Create the environment file, then fill in `DATABASE_URL`, `PAYLOAD_SECRET` (`openssl rand -hex 32`), `NEXT_PUBLIC_SERVER_URL` and `SEED_ADMIN_*`:

```bash
cp .env.example .env
```

Apply the database migrations:

```bash
npm run migrate
```

On the first deployment only, create the first administrator and the base content:

```bash
npm run seed
```

Build and start:

```bash
npm run build
```

```bash
npm start
```

Put **Nginx or Caddy** in front for HTTPS and set `client_max_body_size 200m;` so large photographs can be uploaded. Keep the process alive with PM2 (`pm2 start npm --name samira -- start`) or a systemd unit. On every update: `git pull`, `npm ci`, `npm run migrate`, `npm run build`, then restart.

## Option B — Docker Compose

```bash
cp .env.example .env
```

```bash
docker compose up -d --build
```

```bash
docker compose exec app npm run seed
```

The container runs `npm run migrate` before starting. Uploads persist in the `media` volume and the database in `pgdata`. *(The Dockerfile could not be test-built in the development environment because no Docker daemon was available; the build path it uses, `BUILD_WITHOUT_DB=1`, was tested.)*

## Option C — Managed platforms

Any Node host with persistent processes works: Railway, Render, Fly.io, DigitalOcean App Platform. Use managed PostgreSQL. **Configure S3 storage**, because these platforms have ephemeral disks. Build command: `npm run build`. Start command: `npm run migrate && npm start`. Serverless hosts such as Vercel also work with Postgres + S3, but large uploads hit function body limits there, so a VPS or container is recommended for a photography archive.

## Object storage (recommended in production)

Set `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT` (for non-AWS providers), `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` and `S3_FORCE_PATH_STYLE` (`true` for MinIO and some providers). Files are still served through `/api/media/file/…`, so access control applies. To serve straight from a CDN later, enable `disablePayloadAccessControl` and set a `generateFileURL` in `src/payload.config.ts`.

## Email (optional)

Set `SMTP_*` and enter the private recipient in **Site settings → Contact form**. Without SMTP, messages are still stored under **Artist → Inquiries** in the CMS.

## Backups

- Database: `pg_dump -Fc "$DATABASE_URL" > backup-$(date +%F).dump`, daily, kept off-site.
- Media: back up `./media` (rsync or restic) or enable bucket versioning.
- Original masters are never modified by the CMS, so a media backup is a complete archive.

## Changing the content model later

1. Edit files in `src/collections` or `src/globals`.
2. `npm run migrate:create describe-change` creates a migration in `src/migrations/`. Review it and commit it.
3. `npm run generate:types` refreshes the TypeScript types.
4. Deploy, then `npm run migrate`.

## Security checklist

- A long random `PAYLOAD_SECRET`; HTTPS only; **`NEXT_PUBLIC_SERVER_URL` must be set** to the https origin. It enables the CORS/CSRF origin allowlist and drives canonical URLs and the sitemap; when it is empty (temporary previews only) URLs are relative and no origin allowlist is enforced.
- Change the seeded administrator password on first login; give the artist their own Administrator account and assistants Editor accounts.
- The admin is at `/admin`; logins lock after 5 failed attempts for 15 minutes.
- Security headers are set in `next.config.ts` (nosniff, referrer policy, frame options, permissions policy).
