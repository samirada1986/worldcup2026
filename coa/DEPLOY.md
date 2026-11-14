# Deploying COA to a free public URL

The backend is zero-dependency Node and reads `$PORT`, so it runs on any host.
Pick one. **Render** is the simplest free, no-credit-card option.

---

## Option A — Render (free, no card) ★ recommended

1. Go to <https://render.com> and sign up (GitHub login is fine).
2. **New → Blueprint**.
3. Connect the repo `samirada1986/worldcup2026` and pick the branch.
4. Render reads `coa/render.yaml` and creates the service automatically.
5. After ~1–2 min you get a permanent URL: `https://coa-backend-XXXX.onrender.com`
   - storefront: `/`
   - API docs:  `/api/docs`

Note: on the free plan the service sleeps after ~15 min idle and wakes on the
next request (first hit takes a few seconds). Fine for a demo.

If you prefer no blueprint: **New → Web Service**, repo above, Root Directory
`coa`, Build `echo ok`, Start `node server.js`.

---

## Option B — Koyeb / any Docker host (free tier)

A `Dockerfile` is included, so any container host works:
1. New service → from GitHub → repo above, directory `coa`.
2. It builds the Dockerfile and exposes the app on `$PORT`. Done.

---

## Option C — Google Cloud Run (free tier, needs a card to sign up)

The only path reachable from inside the Claude session, but needs your Google
login. From a machine with `gcloud` installed:

```bash
cd coa
gcloud run deploy coa-backend --source . --allow-unauthenticated --region europe-west1
```

It builds from the `Dockerfile`, deploys, and prints a `https://….run.app` URL.

---

## Option D — your own VPS (or any machine with Node ≥ 18)

```bash
git clone https://github.com/samirada1986/worldcup2026
cd worldcup2026/coa
PORT=8080 node server.js
```

For 24/7, run it under `pm2` or a systemd service. With the `Dockerfile`:

```bash
cd coa
docker build -t coa . && docker run -p 8080:8080 coa
```
