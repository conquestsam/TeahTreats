# Deployment And Production Readiness

This document is the operational companion to `docs/adr/0001-system-architecture.md`.

## Audit Findings

- The repo already separates the web, API, and worker runtimes. That is correct for Vercel plus Render.
- The API and worker Dockerfiles exist at `apps/api/Dockerfile` and `apps/api/Dockerfile.worker`.
- GitHub Actions already has CI, deployment, and database backup workflows.
- The previous deployment doc referenced `.env.production.example`, but that file did not exist. It must exist so staging/prod setup is repeatable.
- The current deploy workflow supports Vercel and a generic SSH server, but Render deployment was not explicit.
- Docker Compose is good for local development and a small VPS fallback. It is not the recommended production database/search/queue setup.
- OpenSearch should be optional for the lowest-budget MVP because it can be expensive to run reliably. PostgreSQL search fallback keeps storefront search alive.
- Stripe and PayPal secret keys must stay in the API/worker environments. Browser identifiers are public and belong in Vercel as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_PAYPAL_CLIENT_ID`.

## System Deployment Overview

Recommended hybrid MVP:

- Web: Vercel.
- API: Render Web Service.
- Worker: Render Background Worker.
- PostgreSQL: Render Postgres for staging, Neon or Supabase for low-budget production, managed PostgreSQL with PITR for serious production.
- Redis: Render Redis for staging, Upstash Redis for low-budget production, managed Redis for serious production.
- OpenSearch: external managed OpenSearch only when budget allows; otherwise keep PostgreSQL fallback enabled and run full reindex when OpenSearch becomes available.
- Media: Cloudinary first for MVP uploads, Cloudflare R2 for low-cost object storage and private receipt/media separation.
- Email: Resend or Gmail SMTP for testing.
- SMS/WhatsApp: Twilio.
- Backups: GitHub Actions scheduled `pg_dump` with Telegram/Discord file delivery and Slack/Teams status notification.

Runtime boundaries:

- Vercel runs only `apps/web`.
- Render API runs `pnpm --filter @snacks/api start`.
- Render worker runs `pnpm --filter @snacks/api start:worker`.
- PostgreSQL is the source of truth.
- Redis is for BullMQ, rate limits, cache, SSE fanout, and short-lived locks.
- OpenSearch is a rebuildable search read model.

## Environment Strategy

Local:

- `.env`
- Docker Compose PostgreSQL, Redis, and OpenSearch
- `prisma db push`
- seeded sample tenants, users, products, inventory, and orders

Preview:

- Vercel preview deployments for branches and pull requests
- points to staging API unless a branch API is intentionally deployed
- sandbox Stripe/PayPal keys

Staging:

- Vercel staging project or Vercel production project with staging branch
- Render API service
- Render worker service
- Render Postgres
- Render Redis
- OpenSearch disabled or external managed sandbox
- Stripe test mode and PayPal sandbox
- Resend test domain or Gmail SMTP

Production:

- Vercel production project
- API and worker on Render, Fly.io, Railway, or a small VPS at MVP scale
- managed PostgreSQL with automated backups
- managed Redis
- managed OpenSearch when search is business-critical
- live Stripe/PayPal
- verified email/SMS senders
- production cookies, CORS, CSRF, rate limits, MFA, and backup rehearsals

## Local Development Commands

```bash
cp .env.example .env
pnpm install
pnpm dev:bootstrap
pnpm dev:api
pnpm dev:worker
pnpm dev:web
pnpm smoke:local
```

Useful explicit commands:

```bash
pnpm infra:start
pnpm db:validate
pnpm db:generate
pnpm dev:db:push
pnpm db:seed
pnpm db:deploy
pnpm db:backup
```

Use `prisma db push` only for local development. Use `prisma migrate deploy` through `pnpm db:deploy` for shared staging and production databases.

## Vercel Web Deployment

1. Create a Vercel project from the GitHub repository.
2. Set the Vercel project root directory to `apps/web`.
3. Use these commands:

```txt
Install Command: cd ../.. && pnpm install --frozen-lockfile
Build Command: cd ../.. && pnpm --filter @snacks/shared build && pnpm --filter @snacks/web build
Output Directory: apps/web/.next
```

If Vercel runs from the repository root instead, use:

```txt
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm --filter @snacks/shared build && pnpm --filter @snacks/web build
Output Directory: apps/web/.next
```

Required Vercel environment variables:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api.onrender.com/api/v1
NEXT_PUBLIC_TEMP_TENANT_ID=platform
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_xxx
NEXT_PUBLIC_PAYPAL_CLIENT_ID=paypal_browser_client_id
```

Vercel automatic deployment:

1. In Vercel, connect the GitHub repository.
2. Enable automatic deployments for preview branches.
3. Keep production deployment tied to `main`.
4. Use Vercel environment protection if production requires approval.
5. Do not store backend-only secrets in Vercel.

## Render API And Worker Deployment

Use `render.yaml` for a repeatable blueprint, or create services manually.

### Render Beginner Sequence

Follow this order the first time. Do not start with the API service; the API needs database and Redis URLs first.

Step 1: create a Render account and connect GitHub.

1. Open Render Dashboard.
2. Connect the GitHub repository that contains this monorepo.
3. Give Render permission to read the repository.
4. Confirm Render can see the `render.yaml` file at the repository root.

Step 2: create staging from the blueprint.

1. In Render, choose New, then Blueprint.
2. Select this repository.
3. Render should detect `render.yaml`.
4. Review the services it wants to create:
   - `teahtreats-postgres-staging`
   - `teahtreats-redis-staging`
   - `teahtreats-api-staging`
   - `teahtreats-worker-staging`
5. Keep the free/starter plans for staging unless traffic requires more.
6. Click Apply.

Step 3: fill missing Render secrets.

The blueprint marks sensitive values with `sync: false`. Render will create the service, but you must add real values before the API can work.

Open `teahtreats-api-staging`, go to Environment, and set at least:

```env
APP_CORS_ORIGIN=https://your-vercel-preview-or-staging-domain.vercel.app
AUTH_ACCESS_TOKEN_SECRET=long_random_value
AUTH_REFRESH_TOKEN_SECRET=long_random_value
MFA_SECRET_ENCRYPTION_KEY=32_byte_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
PAYPAL_CLIENT_ID=paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=paypal_sandbox_secret
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_WEBHOOK_ID=paypal_sandbox_webhook_id
NEXT_PUBLIC_PAYPAL_CLIENT_ID=paypal_sandbox_client_id
```

Set notification/media variables if you want those flows to work in staging:

```env
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=orders@your-domain.com
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_FROM_SMS=your_twilio_number
TWILIO_FROM_WHATSAPP=whatsapp:+your_twilio_whatsapp_sender
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_key
R2_SECRET_ACCESS_KEY=your_r2_secret
R2_BUCKET=your_r2_bucket
```

Open `teahtreats-worker-staging`, go to Environment, and set the same provider secrets. The worker needs payment, notification, media, Redis, database, and OpenSearch access because it processes outbox side effects.

Step 4: deploy API and worker once.

1. In Render, open `teahtreats-api-staging`.
2. Click Manual Deploy, then Deploy latest commit.
3. Wait until the deploy logs show the service is live.
4. Open the service URL and check:

```txt
https://teahtreats-api-staging.onrender.com/api/v1/health
```

5. In Render, open `teahtreats-worker-staging`.
6. Click Manual Deploy, then Deploy latest commit.
7. Confirm the worker logs show the Nest worker started and BullMQ processors loaded.

Step 5: run the first database migration.

The first API boot may fail until migrations have run. Run migrations after Postgres exists and before relying on the API.

Option A, from your local machine:

```bash
DATABASE_URL='render_external_database_url' pnpm db:deploy
DATABASE_URL='render_external_database_url' pnpm db:seed
```

Option B, from GitHub Actions:

1. Add `PRODUCTION_DATABASE_URL` or `STAGING_DATABASE_URL` as a GitHub secret.
2. Set repository variable `ENABLE_DB_MIGRATIONS=true`.
3. Run the Deploy workflow manually.

For staging only, seeding is acceptable. Do not seed production unless the seed script is explicitly safe for production bootstrap.

Step 6: connect Vercel to the Render API.

Set Vercel environment variables:

```env
NEXT_PUBLIC_API_BASE_URL=https://teahtreats-api-staging.onrender.com/api/v1
NEXT_PUBLIC_TEMP_TENANT_ID=platform
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_PAYPAL_CLIENT_ID=paypal_sandbox_client_id
```

Redeploy Vercel after changing environment variables.

Step 7: configure provider webhooks.

Use the Render API public URL:

```txt
Stripe: https://teahtreats-api-staging.onrender.com/api/v1/webhooks/stripe
PayPal: https://teahtreats-api-staging.onrender.com/api/v1/webhooks/paypal
```

After creating each webhook, copy the webhook secret/ID back into Render:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxx
PAYPAL_WEBHOOK_ID=paypal_webhook_id
```

Redeploy API and worker after changing webhook variables.

Step 8: add Render deploy hooks to GitHub.

1. In Render, open `teahtreats-api-staging`.
2. Go to Settings.
3. Copy Deploy Hook URL.
4. In GitHub, add it as `RENDER_API_DEPLOY_HOOK_URL`.
5. Repeat for `teahtreats-worker-staging` as `RENDER_WORKER_DEPLOY_HOOK_URL`.
6. In GitHub variables, set:

```txt
ENABLE_RENDER_DEPLOY=true
ENABLE_DB_MIGRATIONS=true
ENABLE_VERCEL_DEPLOY=true
```

After this, pushes to `main` can build web, run migrations, trigger Render API deploy, then trigger Render worker deploy. Keep production protected with GitHub Environments.

Step 9: run smoke checks.

From your local machine:

```bash
NEXT_PUBLIC_API_BASE_URL=https://teahtreats-api-staging.onrender.com/api/v1 pnpm smoke:health
NEXT_PUBLIC_API_BASE_URL=https://teahtreats-api-staging.onrender.com/api/v1 pnpm smoke:storefront
NEXT_PUBLIC_API_BASE_URL=https://teahtreats-api-staging.onrender.com/api/v1 pnpm smoke:admin-login
NEXT_PUBLIC_API_BASE_URL=https://teahtreats-api-staging.onrender.com/api/v1 pnpm smoke:customer-auth
```

Then manually check:

1. Admin login.
2. Dashboard loads.
3. Storefront products load.
4. Cart checkout reservation works.
5. Stripe/PayPal gateway status is available.
6. Manual proof upload creates admin notification.
7. Worker logs show outbox and notification processing.

Step 10: common Render failures.

- Build fails with pnpm lock errors: run `pnpm install` locally and commit `pnpm-lock.yaml`.
- API health fails: check `DATABASE_URL`, `REDIS_URL`, required auth secrets, and migrations.
- Browser CORS error: set `APP_CORS_ORIGIN` to the exact Vercel domain, including `https://`.
- Login cookie does not persist: set `AUTH_COOKIE_SAMESITE=none` and `AUTH_COOKIE_SECURE=true` for cross-domain HTTPS.
- Payments show unavailable: confirm both backend secrets and browser public identifiers exist in Render/Vercel.
- Notifications do not send: confirm worker is running and provider keys are on the worker service, not only the API service.
- Search fails: confirm OpenSearch env values or rely on PostgreSQL fallback until OpenSearch is provisioned.

### Render Services

Create these services:

- PostgreSQL database for staging.
- Redis instance for queues/cache/rate limits.
- API Web Service from `apps/api/Dockerfile`.
- Worker Background Worker from `apps/api/Dockerfile` with command `pnpm --filter @snacks/api start:worker`.

API health check:

```txt
/api/v1/health
```

Render API build/start with Docker:

```txt
Dockerfile Path: apps/api/Dockerfile
Start Command: pnpm --filter @snacks/api start
Health Check Path: /api/v1/health
```

Render worker build/start with Docker:

```txt
Dockerfile Path: apps/api/Dockerfile
Start Command: pnpm --filter @snacks/api start:worker
```

Run migrations before deploying a new API/worker image:

```bash
pnpm db:deploy
```

On Render this can be done as a one-off job/shell command, a pre-deploy command if available for the selected runtime, or a GitHub Actions migration job using the staging/production `DATABASE_URL`.

### Render Environment Variables

Set these on both API and worker unless noted:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=4000
APP_CORS_ORIGIN=https://your-web.vercel.app
AUTH_ACCESS_TOKEN_SECRET=generated_secret
AUTH_REFRESH_TOKEN_SECRET=generated_secret
AUTH_COOKIE_DOMAIN=
AUTH_COOKIE_SAMESITE=none
AUTH_COOKIE_SECURE=true
MFA_ISSUER=TeahTreats
MFA_SECRET_ENCRYPTION_KEY=32_byte_base64_or_hex_secret
DATABASE_URL=render_or_managed_postgres_url
REDIS_URL=render_or_upstash_redis_url
OPENSEARCH_NODE=https://optional-opensearch-url
OPENSEARCH_USERNAME=optional_user
OPENSEARCH_PASSWORD=optional_password
CLOUDINARY_CLOUD_NAME=cloud_name
CLOUDINARY_API_KEY=cloudinary_key
CLOUDINARY_API_SECRET=cloudinary_secret
R2_ACCOUNT_ID=cloudflare_account_id
R2_ACCESS_KEY_ID=r2_access_key
R2_SECRET_ACCESS_KEY=r2_secret_key
R2_BUCKET=teah-treats-media
RESEND_API_KEY=resend_key
RESEND_FROM_EMAIL=orders@your-domain.com
GMAIL_USER=optional_testing_gmail
GMAIL_APP_PASSWORD=optional_testing_app_password
GMAIL_FROM_EMAIL=optional_testing_sender
TWILIO_ACCOUNT_SID=twilio_sid
TWILIO_AUTH_TOKEN=twilio_token
TWILIO_FROM_SMS=twilio_number
TWILIO_FROM_WHATSAPP=whatsapp:+14155238886
STRIPE_SECRET_KEY=sk_test_or_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_xxx
PAYPAL_CLIENT_ID=paypal_server_client_id
PAYPAL_CLIENT_SECRET=paypal_server_secret
PAYPAL_ENVIRONMENT=sandbox_or_production
PAYPAL_WEBHOOK_ID=paypal_webhook_id
NEXT_PUBLIC_PAYPAL_CLIENT_ID=paypal_browser_client_id
TELEGRAM_BOT_TOKEN=optional_backup_bot_token
TELEGRAM_CHAT_ID=optional_backup_chat_id
DISCORD_WEBHOOK_URL=optional_backup_discord_webhook
SLACK_WEBHOOK_URL=optional_backup_slack_webhook
TEAMS_WEBHOOK_URL=optional_backup_teams_webhook
```

`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_PAYPAL_CLIENT_ID` are public browser identifiers. They are safe to expose, but the API also needs them because the gateway-status endpoint returns checkout readiness to the web app.

## Required Keys And Where To Get Them

Vercel:

- `VERCEL_TOKEN`: Vercel Account Settings, Tokens.
- `VERCEL_ORG_ID`: `.vercel/project.json` after `vercel link`, or Vercel project settings.
- `VERCEL_PROJECT_ID`: `.vercel/project.json` after `vercel link`, or Vercel project settings.
- Alternative: create a Vercel Deploy Hook and store it as `VERCEL_DEPLOY_HOOK_URL`.

Render:

- `RENDER_API_DEPLOY_HOOK_URL`: Render API service, Settings, Deploy Hook.
- `RENDER_WORKER_DEPLOY_HOOK_URL`: Render worker service, Settings, Deploy Hook.
- `RENDER_API_KEY`: Render Account Settings, API Keys, only if using Render API automation.
- Service IDs: Render service Settings URL or Render API.

GitHub:

- Repository Settings, Secrets and variables, Actions.
- Store secrets under Secrets and non-sensitive toggles under Variables.
- Use GitHub Environments for production approval gates.

Stripe:

- Publishable key: Stripe Dashboard, Developers, API keys, starts with `pk_`.
- Secret key: Stripe Dashboard, Developers, API keys, starts with `sk_`.
- Webhook secret: Stripe Dashboard, Developers, Webhooks, endpoint signing secret, starts with `whsec_`.
- Webhook URL: `https://your-api-domain/api/v1/webhooks/stripe`.

PayPal:

- Client ID and secret: PayPal Developer Dashboard, Apps & Credentials.
- Use Sandbox app for staging and Live app for production.
- Webhook ID: PayPal app, Webhooks, selected webhook details.
- Webhook URL: `https://your-api-domain/api/v1/webhooks/paypal`.

Cloudinary:

- Cloud name, API key, and API secret: Cloudinary Dashboard, Product Environment Credentials.

Cloudflare R2:

- Account ID: Cloudflare Dashboard URL or R2 overview.
- Bucket: R2, Create bucket.
- Access key and secret: R2, Manage R2 API Tokens.
- Public URL: configure custom domain or R2 public development URL for public product images only.

Resend:

- API key: Resend Dashboard, API Keys.
- Sender email: verified domain sender, for example `orders@teah-treats.com`.

Gmail SMTP:

- Enable two-step verification on the Google account.
- Create App Password under Google Account Security.
- Use Gmail only for local/staging tests, not serious production sending.

Twilio:

- Account SID and auth token: Twilio Console.
- SMS sender: verified Twilio phone number.
- WhatsApp sender: Twilio WhatsApp sender, often `whatsapp:+14155238886` for sandbox.

Backup notifications:

- Telegram: create a bot with BotFather, send a message to the bot, get chat ID via Telegram API.
- Discord: Server Settings, Integrations, Webhooks.
- Slack: Slack App, Incoming Webhooks.
- Teams: Channel, Workflows or Incoming Webhook connector.

## GitHub Actions CI/CD

CI is in `.github/workflows/ci.yml` and runs:

- install
- Prisma validate/generate
- format check
- shared typecheck/build/test
- API typecheck/lint/build/test
- web typecheck/lint/build/test
- root typecheck/lint/test

Deployment is in `.github/workflows/deploy.yml`.

Recommended repository variables:

```txt
ENABLE_VERCEL_DEPLOY=true
ENABLE_RENDER_DEPLOY=true
ENABLE_DB_MIGRATIONS=true
ENABLE_SERVER_DEPLOY=false
NEXT_PUBLIC_API_BASE_URL=https://your-api.onrender.com/api/v1
NEXT_PUBLIC_TENANT_ID=platform
SERVER_APP_DIR=/opt/snacks-commerce
```

Recommended repository secrets:

```txt
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
RENDER_API_DEPLOY_HOOK_URL
RENDER_WORKER_DEPLOY_HOOK_URL
STAGING_DATABASE_URL
PRODUCTION_DATABASE_URL
SSH_HOST
SSH_USER
SSH_PRIVATE_KEY
DATABASE_URL
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
DISCORD_WEBHOOK_URL
SLACK_WEBHOOK_URL
TEAMS_WEBHOOK_URL
```

Production deployment should be protected with a GitHub Environment approval. Do not auto-deploy production until migration rollback, backup restore rehearsal, provider webhooks, and admin MFA are confirmed.

## Database Deployment

Staging:

```bash
DATABASE_URL='staging_database_url' pnpm db:deploy
```

Production:

```bash
DATABASE_URL='production_database_url' pnpm db:backup
DATABASE_URL='production_database_url' pnpm db:deploy
```

Rules:

- Use Prisma migrations for staging/prod.
- Never run `prisma db push` against staging/prod.
- Run a backup before destructive migrations.
- Prefer roll-forward hotfixes.
- For destructive migrations, write and rehearse a manual repair/down SQL script.

Restore rehearsal checklist:

1. Create a temporary database.
2. Restore the latest backup.
3. Point staging API at the restored database.
4. Run health, storefront products, admin login, cart checkout reservation, and order list smoke checks.
5. Run full OpenSearch reindex.
6. Record restore duration and any manual steps.

## Backups

GitHub Actions scheduled backup is in `.github/workflows/db-backup.yml`.

Manual backup:

```bash
DATABASE_URL='postgres_url' pnpm db:backup
```

Backup delivery:

- Telegram receives the `.sql.gz` backup file when `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set.
- Discord receives the `.sql.gz` backup file when `DISCORD_WEBHOOK_URL` is set.
- Slack receives status only through `SLACK_WEBHOOK_URL`.
- Teams receives status only through `TEAMS_WEBHOOK_URL`.
- GitHub stores a short-lived artifact for operator download.

## Redis Deployment

Use Redis for:

- BullMQ queues
- notification/outbox workers
- rate limiting
- realtime fanout
- short-lived cache

Guidance:

- Lowest budget: Upstash Redis starter.
- Render staging: Render Redis.
- Enterprise: managed Redis with persistence and monitoring.
- Use `allkeys-lru` or provider equivalent only for cache-heavy instances.
- For BullMQ, avoid aggressive eviction on queue keys. If traffic grows, split queue Redis and cache Redis.

## OpenSearch Deployment

MVP:

- Keep OpenSearch optional.
- Use PostgreSQL fallback search if OpenSearch is unavailable.
- Do not block checkout or product browsing on OpenSearch.

Low budget:

- Delay OpenSearch until product count/search complexity justifies the cost.
- Use a small managed OpenSearch provider if available.
- Self-host only when memory and maintenance are acceptable.

Enterprise:

- Use managed OpenSearch or Elastic-compatible managed search.
- Monitor indexing failures and query latency.
- Keep a reindex runbook and index versioning.

Full reindex:

```bash
curl -X POST 'https://your-api-domain/api/v1/admin/search/products/reindex' \
  -H 'content-type: application/json' \
  -H 'x-tenant-id: platform' \
  -b 'admin_session_cookie'
```

Run reindex per active tenant. If the tenant is platform super-admin and aggregate indexing is later added, use the aggregate admin tool for all tenants.

## Media Deployment

Product images:

- Public read.
- JPG, JPEG, PNG, or WebP.
- Prefer Cloudinary transformations for optimized storefront delivery.
- Keep image metadata in PostgreSQL.

Payment receipts/private media:

- Private by default.
- Separate Cloudinary folder/preset or separate R2 prefix/bucket.
- Never show raw private provider credentials to the browser.
- Render receipt previews through stored secure URLs or signed read URLs.

## Payment Deployment

Embedded checkout requires:

- Stripe Payment Element in `apps/web`.
- PayPal Buttons in `apps/web`.
- Stripe and PayPal SDKs are already installed in the repo.
- Provider secrets only on API/worker.
- Webhooks as final reconciliation source of truth.

Webhook docs:

- [Payment Webhooks](./payment-webhooks.md)

Why webhooks are still required:

- Browser success callbacks can be closed, blocked, refreshed, or spoofed.
- Webhooks are provider-signed server-to-server events.
- Order status should become paid only after backend reconciliation.

## Security Checklist

- Strong auth secrets.
- `AUTH_COOKIE_SECURE=true` in production.
- `AUTH_COOKIE_SAMESITE=none` when web/API are on different domains over HTTPS.
- CORS limited to real Vercel domains.
- CSRF enabled for unsafe cookie-auth browser mutations.
- Redis-backed rate limiting before multi-instance production.
- Admin MFA enabled before broad admin rollout.
- Webhook signatures verified.
- Upload content type and size limits enforced.
- Product images and receipt media separated.
- Tenant scoping enforced on all tenant-owned data.
- Sensitive errors hidden from users.
- Provider dashboards protected by MFA.
- Legal/privacy/refund/allergy pages published and reviewed by business/legal owner.

## Observability

Minimum:

- Monitor `/api/v1/health`.
- Review Render API logs and worker logs separately.
- Review Vercel function/build logs.
- Track failed BullMQ jobs.
- Track outbox lag.
- Track notification failures.
- Track payment webhook failures.

Recommended:

- Add Sentry for API and web errors.
- Add uptime checks for `/api/v1/health` and storefront homepage.
- Add alerts for checkout failure rate, payment reconciliation failures, and notification delivery failures.
- Add Prometheus-compatible metrics when hosting supports it.

## Smoke Tests

After deployment:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain/api/v1 pnpm smoke:health
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain/api/v1 pnpm smoke:storefront
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain/api/v1 pnpm smoke:admin-login
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain/api/v1 pnpm smoke:customer-auth
```

Manual smoke checks:

- Admin login.
- Dashboard/report load.
- Storefront products.
- Cart add/update/remove.
- Checkout reservation.
- Stripe gateway status.
- PayPal gateway status.
- Manual proof upload.
- Admin payment proof review.
- Notification smoke test.
- Order readiness notification.

## Low-Budget Production Plan

Smallest reasonable paid setup:

- Vercel Hobby/Pro for web.
- Render API and worker starter instances, or one small VPS if Render cost is too high.
- Neon or Supabase Postgres starter.
- Upstash Redis starter.
- Cloudinary free/starter plus Cloudflare R2 for storage.
- Resend free/starter.
- Twilio pay-as-you-go.
- OpenSearch postponed until needed.

Approximate rule: protect PostgreSQL first, then Redis/queues, then search.

## Enterprise Production Plan

- Vercel Pro/Enterprise for web.
- API and worker on Render Pro, Fly.io, Kubernetes, ECS, Cloud Run, or similar.
- Managed PostgreSQL with PITR, read replicas, and rehearsed restore.
- Dedicated Redis for queues and separate Redis for cache/rate limits.
- Managed OpenSearch with snapshots and index lifecycle.
- Cloudflare R2 with lifecycle policies and signed private access.
- Sentry, metrics, uptime checks, log drains, alert escalation.
- GitHub Environments with approval gates.
- Infrastructure as code after the provider choices stabilize.

## Provider Tradeoffs

- Render: simple API/worker deployment, good for MVP/staging, straightforward logs and deploy hooks.
- Fly.io: strong global app placement, more operational skill required.
- Railway: very fast MVP setup, costs can surprise as services grow.
- AWS/GCP/Azure: best long-term enterprise control, slower and more expensive to set up correctly.
- Neon/Supabase Postgres: excellent low-budget managed PostgreSQL.
- Render Postgres: convenient for Render staging, review pricing/backups carefully for production.
- Upstash Redis: easy low-cost Redis, validate BullMQ compatibility and persistence expectations for your plan.
- Render Redis: convenient for staging.
- Aiven/OpenSearch managed providers: easier than self-hosting search.
- Self-hosted OpenSearch: cheapest cash cost, highest operations cost.
- Cloudinary: best for image transformations and admin-friendly media.
- R2: best low-cost object storage and private receipts.

## Final Deployment Checklist

Local readiness:

- `pnpm dev:bootstrap` passes.
- API, worker, and web run.
- `pnpm smoke:local` passes.

Staging readiness:

- Render API health is green.
- Render worker is running.
- `pnpm db:deploy` has run.
- Vercel points to staging API.
- Stripe test webhook and PayPal sandbox webhook are configured.
- Notification smoke test sends through configured providers.
- Backup workflow runs and sends at least one backup artifact.

Production readiness:

- CI is green.
- Production approval environment exists.
- Production secrets are in provider secret managers.
- Database backup and restore rehearsal completed.
- Admin MFA rollout plan approved.
- Redis-backed rate limiting confirmed for multi-instance production.
- Legal/privacy/refund/allergy pages published.
- OpenSearch fallback and reindex procedure confirmed.
- Payment webhooks configured with live provider secrets.
- Smoke checks pass after deployment.

Known blockers before broad launch:

- Formal restore rehearsal must be recorded.
- Destructive migration rollback/repair scripts must be rehearsed.
- Admin MFA provider should be enabled for all privileged users.
- Full OpenSearch reindex operation should be tested on staging.
- Legal/privacy/refund/allergy copy must be reviewed by the business owner.
