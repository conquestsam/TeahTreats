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
git clone <YOUR_REPOSITORY_URL> TeahTreats
cd TeahTreats
cp .env.production.example .env.production
nano .env.production
```

If the repository was cloned with `root` or another user and `deploy` later runs `git pull`, Git may stop with `fatal: detected dubious ownership`. Prefer fixing ownership so the deploy user owns the working copy:

```bash
sudo chown -R deploy:deploy /srv/teshtreats/TeahTreats
cd /srv/teshtreats/TeahTreats
git pull origin main
```

If ownership is intentionally shared and you only need a quick unblock, add the repo to Git's safe directory list for the current user:

```bash
git config --global --add safe.directory /srv/teshtreats/TeahTreats
git pull origin main
```

Always pass the production env file to Docker Compose:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml config
```

This matters because `env_file:` passes variables into containers, while `${POSTGRES_PASSWORD}` interpolation inside `docker-compose.prod.yml` is read from the shell or from the Compose env file. Using `--env-file .env.production` makes both paths use the same values.

If you edited `.env` instead of `.env.production`, copy the same values into `.env.production` before running production Compose commands:

```bash
cp .env .env.production
```

Minimum `.env.production` values for Contabo:

```bash
NODE_ENV=production
APP_CORS_ORIGIN=https://your-vercel-domain.vercel.app
WEB_APP_URL=https://your-vercel-domain.vercel.app
POSTGRES_USER=snacks
POSTGRES_PASSWORD=<strong-postgres-password>
POSTGRES_PASSWORD_URLENCODED=<url-encoded-postgres-password>
POSTGRES_DB=snacks_commerce
REDIS_PASSWORD=<strong-redis-password>
REDIS_PASSWORD_URLENCODED=<url-encoded-redis-password>
OPENSEARCH_INITIAL_ADMIN_PASSWORD=<strong-opensearch-password>
AUTH_ACCESS_TOKEN_SECRET=<strong-random-secret>
AUTH_REFRESH_TOKEN_SECRET=<strong-random-secret>
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAMESITE=none
API_PUBLIC_PORT=4000
```

Use the raw password for `POSTGRES_PASSWORD` and `REDIS_PASSWORD`. Use URL-encoded values for `POSTGRES_PASSWORD_URLENCODED` and `REDIS_PASSWORD_URLENCODED`, because these are inserted into `DATABASE_URL` and `REDIS_URL`.

Example:

```bash
POSTGRES_PASSWORD=FreshPie#2026!
POSTGRES_PASSWORD_URLENCODED=FreshPie%232026%21
REDIS_PASSWORD=FreshPie#2026!
REDIS_PASSWORD_URLENCODED=FreshPie%232026%21
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
cd /srv/teshtreats/TeahTreats
docker compose --env-file .env.production -f docker-compose.prod.yml build api
docker compose --env-file .env.production -f docker-compose.prod.yml up -d postgres redis opensearch
docker compose --env-file .env.production -f docker-compose.prod.yml --profile migrate run --rm migrate
docker compose --env-file .env.production -f docker-compose.prod.yml up -d api worker
docker compose --env-file .env.production -f docker-compose.prod.yml ps
curl -fsS http://127.0.0.1:4000/api/v1/health
```

## Fix Prisma P1000 During Migration

If migration fails with:

```text
P1000: Authentication failed against database server, the provided database credentials for `snacks` are not valid.
```

First confirm Compose is using the same env file you edited:

```bash
cd /srv/teshtreats/TeahTreats
docker compose --env-file .env.production -f docker-compose.prod.yml config | grep -E "POSTGRES_PASSWORD|DATABASE_URL"
```

Then check whether the existing Postgres volume was initialized with a different password:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps postgres
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=80 postgres
```

If this is a fresh server and there is no production data yet, reset the database volume and recreate Postgres with the password from `.env.production`:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml down
docker volume ls | grep '_postgres-data'
docker volume rm <compose-project>_postgres-data
docker compose --env-file .env.production -f docker-compose.prod.yml up -d postgres
docker compose --env-file .env.production -f docker-compose.prod.yml --profile migrate run --rm migrate
```

For the server output shown as `teahtreats-postgres-1`, the volume is usually:

```bash
docker volume rm teahtreats_postgres-data
```

Only remove the Postgres volume on a fresh setup. If the server already contains production data, do not remove the volume. Instead, connect with the old working password or reset the database user's password from inside Postgres, then update `.env.production` to match.

## Fix Prisma P1013 Invalid Database URL

If migration fails with:

```text
P1013: The provided database string is invalid. invalid port number in database URL.
```

The usual cause is a special character in the password, especially `#`, `@`, `/`, `:`, or `?`. In a URL, `#` starts a fragment, so this raw connection string is invalid:

```text
postgresql://snacks:FreshPie#2026!@postgres:5432/snacks_commerce?schema=public
```

Keep the raw password for the database container, but add the URL-encoded password for Prisma:

```bash
POSTGRES_PASSWORD=FreshPie#2026!
POSTGRES_PASSWORD_URLENCODED=FreshPie%232026%21
REDIS_PASSWORD=FreshPie#2026!
REDIS_PASSWORD_URLENCODED=FreshPie%232026%21
```

Then verify Compose renders a valid connection URL:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml config | grep -E "DATABASE_URL|REDIS_URL"
```

You should see:

```text
DATABASE_URL: postgresql://snacks:FreshPie%232026%21@postgres:5432/snacks_commerce?schema=public
REDIS_URL: redis://default:FreshPie%232026%21@redis:6379
```

Now rerun migration:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml --profile migrate run --rm migrate
```

## Vercel Frontend

Set these Vercel environment variables:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com/api/v1
NEXT_PUBLIC_TEMP_TENANT_ID=<tenant-id>
```

Deploy `apps/web` from Vercel or the GitHub Actions workflow.

## DNS Records

Use one apex/root domain for the customer-facing site and one API subdomain for the Contabo backend.

Recommended production names:

```text
teshtreats.com        -> Vercel frontend
www.teshtreats.com    -> Vercel frontend
api.teshtreats.com    -> Contabo backend
```

Set these records at your DNS provider:

| Type  | Name | Value | Proxy/CDN | Notes |
| ----- | ---- | ----- | --------- | ----- |
| A | `api` | `62.169.16.51` | DNS only | Backend API on Contabo. Use this for `https://api.teshtreats.com/api/v1`. |
| A | `@` | `76.76.21.21` | DNS only | Vercel apex/root domain. |
| CNAME | `www` | `cname.vercel-dns.com` | DNS only | Vercel `www` frontend domain. |

If your DNS provider supports ALIAS/ANAME/CNAME flattening, Vercel may instead ask for:

| Type | Name | Value |
| ---- | ---- | ----- |
| CNAME/ALIAS | `@` | `cname.vercel-dns.com` |
| CNAME | `www` | `cname.vercel-dns.com` |

Follow the exact Vercel domain screen if it gives provider-specific records.

After DNS is added, configure Vercel:

```text
Project Settings -> Domains
Add teshtreats.com
Add www.teshtreats.com
Set the preferred production domain.
```

Then set Vercel env:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.teshtreats.com/api/v1
NEXT_PUBLIC_TEMP_TENANT_ID=platform
```

Set Contabo API env:

```bash
APP_CORS_ORIGIN=https://teshtreats.com,https://www.teshtreats.com,https://your-vercel-domain.vercel.app
WEB_APP_URL=https://teshtreats.com
AUTH_COOKIE_DOMAIN=.teshtreats.com
AUTH_COOKIE_SAMESITE=none
AUTH_COOKIE_SECURE=true
```

For the API domain, terminate HTTPS with a reverse proxy on Contabo. Example with Caddy:

```bash
sudo apt install -y caddy
sudo nano /etc/caddy/Caddyfile
```

```caddyfile
api.teshtreats.com {
  reverse_proxy 127.0.0.1:4000
}
```

```bash
sudo systemctl reload caddy
curl -fsS https://api.teshtreats.com/api/v1/health
```

Keep port `4000` closed to the public after HTTPS proxying is confirmed:

```bash
sudo ufw deny 4000/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

## CI/CD Secrets

GitHub repository secrets:

```bash
SSH_HOST=62.169.16.51
SSH_USER=<server-user>
SSH_PRIVATE_KEY=<private-key-for-deploy-user>
VERCEL_TOKEN=
VERCEL_ORG_ID=
VERCEL_PROJECT_ID=
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
SERVER_APP_DIR=/srv/teshtreats/TeahTreats
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com/api/v1
NEXT_PUBLIC_TEMP_TENANT_ID=platform
```

Keep `ENABLE_DB_MIGRATIONS=false` when PostgreSQL is private inside Docker. Do not expose Postgres publicly just so GitHub Actions can connect to it. The server deploy job runs migrations locally through Docker Compose.

## Daily Backup

The repository already includes `.github/workflows/db-backup.yml` and `scripts/backup-postgres.mjs`. It creates a gzipped PostgreSQL dump and can send it to Telegram and Discord as an attachment, and Slack or Teams as a text notification.

For a private Docker-only database, run backup from the VPS instead of GitHub-hosted runners:

```bash
cd /srv/teshtreats/TeahTreats
mkdir -p backups
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T postgres sh -c 'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges' | gzip > "backups/teshtreats-$(date -u +%Y%m%d-%H%M%S).sql.gz"
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
5. Server pulls latest code into `/srv/teshtreats/TeahTreats`.
6. Docker rebuilds `snacks-api:latest`.
7. PostgreSQL, Redis, and OpenSearch stay on persistent Docker volumes.
8. Prisma migrations run.
9. API and worker restart.
10. Health endpoint confirms database, Redis, and OpenSearch.
11. Customer order placement creates outbox events.
12. Worker processes notifications, payments, inventory expiry, and realtime events.
13. Daily backup runs and posts status or files to configured notification channels.
