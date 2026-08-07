# Deployment And Production Readiness

This document is the operational companion to `docs/adr/0001-system-architecture.md`.

## Local Commands

```bash
pnpm install
pnpm dev:env
pnpm infra:start
pnpm db:generate
pnpm dev:db:push
pnpm db:seed
pnpm dev:api
pnpm dev:worker
pnpm dev:web
pnpm smoke:local
```

Use `pnpm dev:bootstrap` for the setup shortcut.

For non-interactive shells, use `CI=true` with pnpm commands if dependency verification would otherwise prompt:

```bash
CI=true pnpm db:validate
```

## Runtime Processes

- Web: Next.js on Vercel.
- API: NestJS HTTP runtime from `apps/api/src/main.ts`.
- Worker: NestJS application context runtime from `apps/api/src/worker.ts`.
- PostgreSQL: source of truth.
- Redis: BullMQ, cache, rate limiting, pub/sub helper.
- OpenSearch: search read model.

API and worker should be deployed as separate processes using the same image.

## Staging Sequence

1. Create staging PostgreSQL, Redis, OpenSearch, R2 bucket, Resend domain, Twilio numbers, Stripe test keys, and PayPal sandbox app.
2. Copy `.env.production.example` to the staging secret store and replace every placeholder.
3. Deploy backend image.
4. Run `pnpm db:deploy` once against staging.
5. Start one API process and one worker process.
6. Deploy Vercel web with `NEXT_PUBLIC_API_BASE_URL` pointing to staging API.
7. Run smoke checks:

```bash
NEXT_PUBLIC_API_BASE_URL=https://staging-api.example.com/api/v1 pnpm smoke:local
```

8. Manually verify admin login, storefront product list, cart, checkout reservation, manual proof upload, and admin order readiness.

## Production Recommendation

Recommended lowest-budget production shape:

- Web: Vercel.
- API and worker: one small Hetzner/Railway/Render/Fly.io server using Docker Compose.
- PostgreSQL: managed free/low-cost Neon or Supabase first. Use self-hosted PostgreSQL only if you accept manual backup/restore responsibility.
- Redis: Upstash Redis free/low-cost first. Self-host Redis on the same VPS only for beta traffic.
- OpenSearch: self-host on the VPS for MVP, use PostgreSQL fallback if memory is tight, then move to managed OpenSearch when search becomes business-critical.
- Object storage: Cloudflare R2 with separate public product-image and private receipt prefixes or buckets.
- Email: Resend with verified sender domain.
- SMS/WhatsApp: Twilio with verified sender setup.
- Errors: Sentry or equivalent before public launch.
- Metrics/logs: provider logs plus Prometheus-compatible metrics where the host supports it.

Smallest practical budget plan:

1. Vercel Hobby for the web.
2. Neon/Supabase free or starter PostgreSQL for the database.
3. Upstash free/starter Redis for queues, rate limits, and realtime fanout.
4. One 2 GB RAM VPS for API, worker, and optional OpenSearch. If OpenSearch is unstable on 2 GB RAM, keep the app running with database search fallback and add OpenSearch when budget allows.
5. Cloudflare R2 free tier for product images and receipts.
6. Resend free tier for email. Twilio pay-as-you-go only for real SMS/WhatsApp.

Minimum VPS setup:

```bash
sudo apt-get update
sudo apt-get install -y git curl ca-certificates ufw fail2ban
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
git clone git@github.com:YOUR_ORG/YOUR_REPO.git /opt/snacks-commerce
cd /opt/snacks-commerce
cp .env.production.example .env.production
cp docker-compose.prod.example.yml docker-compose.prod.yml
```

Edit `.env.production`, point DNS at the server, and place Caddy or Nginx Proxy Manager in front of the API for HTTPS. Keep PostgreSQL and Redis managed when possible; it is usually cheaper than losing orders.

## Production Deployment Sequence

1. Freeze schema-changing feature work.
2. Confirm CI is green.
3. Build and push API image.
4. Run database backup.
5. Run `pnpm db:deploy`.
6. Deploy API process.
7. Deploy worker process after API health is green.
8. Deploy Vercel web.
9. Run smoke checks against production.
10. Watch logs, queue depth, outbox lag, payment webhooks, notification failures, and checkout errors for at least 30 minutes.

## Automatic Deployment

GitHub Actions includes `.github/workflows/deploy.yml`.

Web deployment:

- Set repository variable `ENABLE_VERCEL_DEPLOY=true`.
- Set repository variables `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_TENANT_ID`.
- Set secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`.
- Vercel also supports direct Git integration. Use either Vercel Git integration or the workflow, not both, to avoid duplicate deployments.

API and worker deployment:

- Set repository variable `ENABLE_SERVER_DEPLOY=true`.
- Set repository variable `SERVER_APP_DIR=/opt/snacks-commerce`.
- Set secrets `SSH_HOST`, `SSH_USER`, and `SSH_PRIVATE_KEY`.
- The server must have Docker, Git, Corepack, `docker-compose.prod.yml`, and `.env.production`.
- On every push to `main`, the workflow SSHes into the server, pulls latest code, runs Prisma deploy, rebuilds API/worker containers, and prunes old images.

Recommended server files:

```bash
/opt/snacks-commerce/.env.production
/opt/snacks-commerce/docker-compose.prod.yml
```

Run the first deployment manually once:

```bash
cd /opt/snacks-commerce
corepack enable
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:deploy
docker compose -f docker-compose.prod.yml up -d --build api worker
```

## Secrets

Never commit production secrets. Store them in the deployment provider secret manager.

Required production secrets:

- `AUTH_ACCESS_TOKEN_SECRET`
- `AUTH_REFRESH_TOKEN_SECRET`
- `MFA_ISSUER`
- `MFA_SECRET_ENCRYPTION_KEY`
- `DATABASE_URL`
- `REDIS_URL`
- `OPENSEARCH_NODE`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_ENVIRONMENT`
- `PAYPAL_WEBHOOK_ID`

## Backup And Restore

- PostgreSQL: daily backups minimum; PITR preferred.
- Restore rehearsal: once before production launch and after major schema changes.
- R2: enable lifecycle and retention policies for private payment receipts.
- Redis: do not rely on Redis for durable business records.
- OpenSearch: can be rebuilt from PostgreSQL through reindex jobs.
- GitHub Actions includes a scheduled database backup workflow in `.github/workflows/db-backup.yml`.
- Backup notifications support Telegram document upload and Discord document upload.
- Slack and Teams incoming webhooks receive backup status messages; they do not receive file uploads through incoming webhook URLs.

Manual backup command:

```bash
pnpm db:backup
```

Required backup secrets for GitHub Actions:

- `DATABASE_URL`
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` for Telegram file delivery.
- `DISCORD_WEBHOOK_URL` for Discord file delivery.
- `SLACK_WEBHOOK_URL` for Slack status notification.
- `TEAMS_WEBHOOK_URL` for Teams status notification.

Restore order:

1. Restore PostgreSQL.
2. Reconfigure API and worker to restored database.
3. Start API read-only or maintenance mode if available.
4. Rebuild OpenSearch indexes.
5. Resume worker processing.
6. Run smoke checks.

Migration rollback playbook:

1. Before every destructive migration, run `pnpm db:backup` and confirm the artifact exists.
2. Deploy migrations during a quiet window.
3. If migration fails before app deploy, restore the pre-migration backup and redeploy the previous image.
4. If migration succeeds but app deploy fails, roll forward with a hotfix whenever possible. Prisma migrations are not automatically reversible.
5. For destructive changes, write an explicit down/repair SQL script and rehearse it against staging first.

Restore rehearsal:

1. Create a temporary database.
2. Restore the latest backup into it.
3. Point a staging API at the restored database.
4. Run health, storefront, admin login, product list, checkout reservation, and order list smoke checks.
5. Run `POST /api/v1/admin/search/products/reindex` for each active tenant.
6. Record restore duration and any manual fixes.

## Security Checklist

- Strong auth token secrets.
- Production cookies: `httpOnly`, `secure`, and sane `sameSite`.
- CORS limited to real web domains.
- CSRF enabled for unsafe browser-cookie mutations.
- Admin MFA enabled before unrestricted admin access.
- Redis-backed rate limits on auth, checkout, search, and upload endpoints.
- Payment webhook signatures configured and enforced.
- Product uploads restricted to image content types and size limits.
- Receipt uploads private and size-limited.
- Tenant scoping enforced on every tenant-owned route.
- Audit logs available for privileged actions.
- Database backups enabled.
- Provider dashboards locked behind team MFA.

## Observability Checklist

- `/api/v1/health` monitored.
- API logs include request ID and structured errors.
- Worker logs monitored separately from API logs.
- Queue depth and failed jobs reviewed daily during beta.
- Outbox lag alert threshold defined.
- Notification failure queue reviewed.
- Payment webhook failures reviewed.
- Checkout error rate reviewed after every deployment.

## Remaining Production Blockers

- Finish full automated tests for checkout, inventory concurrency, payment webhook idempotency, tenant isolation, and manual payment approval.
- Rehearse restore and destructive migration rollback in staging before launch.
- Review privacy, terms, refund policy, and allergy disclaimer with a qualified legal/business owner.

## Payment Webhook Rationale

Stripe PaymentIntent and PayPal in-app checkout create payment intent/order records, but they do not make the browser the source of truth. Webhooks are required because:

- The customer can close the browser after paying.
- Provider settlement can be delayed, denied, refunded, or reversed after the UI says success.
- Duplicate provider events must be reconciled idempotently.
- Admin order status, inventory reservation release, notifications, and audit logs must follow provider-confirmed state.

The app should show provider intent status in the UI, then let webhook reconciliation finalize paid, failed, refunded, or action-required states.
