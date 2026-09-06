# Contabo Backend Deployment Runbook

This project runs the customer/admin web app on Vercel and the backend stack on a Contabo VPS.

## Production Shape

- Vercel: `apps/web`
- Contabo VPS: API, worker, PostgreSQL, Redis, OpenSearch
- Public backend port: `4000`, normally placed behind a reverse proxy with TLS
- Private container network: `postgres`, `redis`, and `opensearch` are not exposed publicly

OpenSearch is included because the API imports `SearchInfrastructureModule`, the health check verifies OpenSearch, storefront search uses it with PostgreSQL fallback, and admin search can rebuild the product index.

## One-Time Server Setup

Use SSH with the real server username and password or, preferably, an SSH key. Do not paste production passwords into commits or chats.

```bash
ssh root@62.169.16.51
apt update
apt install -y ca-certificates curl git ufw
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 4000/tcp
ufw --force enable
```

## App Bootstrap

```bash
mkdir -p /srv/teshtreats
cd /srv/teshtreats
git clone <YOUR_REPOSITORY_URL> .
cp .env.production.example .env.production
nano .env.production
```

Minimum `.env.production` values for Contabo:

```bash
NODE_ENV=production
APP_CORS_ORIGIN=https://your-vercel-domain.vercel.app
WEB_APP_URL=https://your-vercel-domain.vercel.app
POSTGRES_USER=snacks
POSTGRES_PASSWORD=<strong-postgres-password>
POSTGRES_DB=snacks_commerce
REDIS_PASSWORD=<strong-redis-password>
OPENSEARCH_INITIAL_ADMIN_PASSWORD=<strong-opensearch-password>
AUTH_ACCESS_TOKEN_SECRET=<strong-random-secret>
AUTH_REFRESH_TOKEN_SECRET=<strong-random-secret>
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAMESITE=none
API_PUBLIC_PORT=4000
```

Add provider secrets as needed:

```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
RESEND_API_KEY=
GMAIL_USER=
GMAIL_APP_PASSWORD=
GMAIL_FROM_EMAIL=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
```

## First Deploy

```bash
cd /srv/teshtreats
docker compose -f docker-compose.prod.yml build api
docker compose -f docker-compose.prod.yml up -d postgres redis opensearch
docker compose -f docker-compose.prod.yml --profile migrate run --rm migrate
docker compose -f docker-compose.prod.yml up -d api worker
docker compose -f docker-compose.prod.yml ps
curl -fsS http://127.0.0.1:4000/api/v1/health
```

## Vercel Frontend

Set these Vercel environment variables:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com/api/v1
NEXT_PUBLIC_TENANT_ID=<tenant-id>
NEXT_PUBLIC_TEMP_TENANT_ID=<tenant-id>
```

Deploy `apps/web` from Vercel or the GitHub Actions workflow.

## CI/CD Secrets

GitHub repository secrets:

```bash
SSH_HOST=62.169.16.51
SSH_USER=<server-user>
SSH_PRIVATE_KEY=<private-key-for-deploy-user>
PRODUCTION_DATABASE_URL=postgresql://snacks:<password>@62.169.16.51:5432/snacks_commerce?schema=public
VERCEL_TOKEN=
VERCEL_ORG_ID=
VERCEL_PROJECT_ID=
DATABASE_URL=postgresql://snacks:<password>@62.169.16.51:5432/snacks_commerce?schema=public
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
DISCORD_WEBHOOK_URL=
SLACK_WEBHOOK_URL=
```

GitHub variables:

```bash
ENABLE_SERVER_DEPLOY=true
ENABLE_VERCEL_DEPLOY=true
ENABLE_DB_MIGRATIONS=false
SERVER_APP_DIR=/srv/teshtreats
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com/api/v1
NEXT_PUBLIC_TENANT_ID=<tenant-id>
```

Keep `ENABLE_DB_MIGRATIONS=false` when PostgreSQL is private inside Docker. The server deploy job runs migrations locally through Docker Compose.

## Daily Backup

The repository already includes `.github/workflows/db-backup.yml` and `scripts/backup-postgres.mjs`. It creates a gzipped PostgreSQL dump and can send it to Telegram and Discord as an attachment, and Slack or Teams as a text notification.

For a private Docker-only database, run backup from the VPS instead of GitHub-hosted runners:

```bash
cd /srv/teshtreats
mkdir -p backups
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump "$DATABASE_URL" --no-owner --no-privileges | gzip > "backups/teshtreats-$(date -u +%Y%m%d-%H%M%S).sql.gz"
```

Recommended production backup policy:

- Daily logical dump retained for 14 days.
- Weekly off-server copy to object storage.
- Telegram or Discord receives the dump file only if your data policy allows it.
- Slack receives status and failure alerts, not the database file.

## Deployment Simulation

1. Push code to `main`.
2. GitHub runs CI.
3. Vercel builds and deploys `apps/web`.
4. GitHub SSH deploy connects to `62.169.16.51`.
5. Server pulls latest code into `/srv/teshtreats`.
6. Docker rebuilds `snacks-api:latest`.
7. PostgreSQL, Redis, and OpenSearch stay on persistent Docker volumes.
8. Prisma migrations run.
9. API and worker restart.
10. Health endpoint confirms database, Redis, and OpenSearch.
11. Customer order placement creates outbox events.
12. Worker processes notifications, payments, inventory expiry, and realtime events.
13. Daily backup runs and posts status or files to configured notification channels.
