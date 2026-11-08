# Samira Dadashi portfolio — production image (Next.js + Payload CMS).
# Builds without a database (pages render on first request, then are cached).
# On start it applies pending database migrations, then serves the site.

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 BUILD_WITHOUT_DB=1
# Build-time placeholders only; real values are provided at runtime.
RUN DATABASE_URL=postgres://build@localhost:5432/build PAYLOAD_SECRET=build-only npm run build

FROM base AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app ./
RUN mkdir -p /app/media && chown nextjs:nodejs /app/media
USER nextjs
EXPOSE 3000
# Local uploads live in /app/media – mount a volume there (or configure S3).
CMD ["sh", "-c", "npm run migrate && npm start"]
