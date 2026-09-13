# GitHub Actions Server CI/CD And Daily Backups

This repository has two production operations workflows:

- `.github/workflows/deploy.yml`: deploys API and worker to the server when code is pushed to `main`.
- `.github/workflows/db-backup.yml`: runs a daily PostgreSQL backup on the server and sends the `.sql.gz` file to Telegram.

## Required Server Setup

The production server must have:

- A Linux user dedicated to deployment, for example `deploy`.
- SSH access from GitHub Actions using a private key stored in GitHub secrets.
- Git installed.
- Docker and Docker Compose v2 installed.
- The repository cloned on the server, for example:

```bash
/srv/teshtreats/TeahTreats
```

- The deploy user must own the repo directory:

```bash
sudo chown -R deploy:deploy /srv/teshtreats/TeahTreats
```

- The server checkout must track the same GitHub repo and `main` branch:

```bash
cd /srv/teshtreats/TeahTreats
git remote -v
git branch --show-current
```

- Production env must exist on the server:

```bash
/srv/teshtreats/TeahTreats/.env.production
```

- Production compose file must exist on the server:

```bash
/srv/teshtreats/TeahTreats/docker-compose.prod.yml
```

- Docker services must use the compose service names from this repo:
  - `postgres`
  - `redis`
  - `opensearch`
  - `api`
  - `worker`
  - `migrate`

## Required `.env.production` Values On The Server

The server `.env.production` must include at minimum:

```env
POSTGRES_USER=snacks
POSTGRES_PASSWORD=strong_password
POSTGRES_PASSWORD_URLENCODED=url_encoded_strong_password
POSTGRES_DB=snacks_commerce

REDIS_PASSWORD=strong_redis_password
REDIS_PASSWORD_URLENCODED=url_encoded_strong_redis_password

OPENSEARCH_INITIAL_ADMIN_PASSWORD=strong_opensearch_password

APP_CORS_ORIGIN=https://teshtreats.com
WEB_APP_URL=https://teshtreats.com
NEXT_PUBLIC_SITE_URL=https://teshtreats.com

AUTH_ACCESS_TOKEN_SECRET=long_random_secret
AUTH_REFRESH_TOKEN_SECRET=long_random_secret
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAMESITE=lax

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=TeshTreats <info@mail.teshtreats.com>
EMAIL_LOGO_URL=https://teshtreats.com/brand/teshtreats-logo.jpg
ADMIN_ALERT_EMAIL=admin@example.com
```

Also include production values for Stripe, PayPal, Cloudinary/R2, Twilio, OAuth, and any other enabled providers.

## GitHub Repository Secrets

Set these in GitHub:

`Settings -> Secrets and variables -> Actions -> Secrets`

Required for server deploy and server backup:

```txt
SSH_HOST
SSH_USER
SSH_PRIVATE_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

Optional if you keep the existing Vercel/Render jobs enabled:

```txt
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
RENDER_API_DEPLOY_HOOK_URL
RENDER_WORKER_DEPLOY_HOOK_URL
PRODUCTION_DATABASE_URL
```

Notes:

- `SSH_HOST` is the server IP or hostname.
- `SSH_USER` is the deploy user, for example `deploy`.
- `SSH_PRIVATE_KEY` is the private key GitHub Actions uses to connect to the server.
- Add the matching public key to `/home/deploy/.ssh/authorized_keys` on the server.
- `TELEGRAM_BOT_TOKEN` comes from BotFather.
- `TELEGRAM_CHAT_ID` is the chat, group, or channel ID that should receive backup files.

## GitHub Repository Variables

Set these in GitHub:

`Settings -> Secrets and variables -> Actions -> Variables`

Recommended for server CI/CD:

```txt
ENABLE_SERVER_DEPLOY=true
ENABLE_DB_MIGRATIONS=false
ENABLE_VERCEL_DEPLOY=true
ENABLE_RENDER_DEPLOY=false
SERVER_APP_DIR=/srv/teshtreats/TeahTreats
SERVER_COMPOSE_FILE=docker-compose.prod.yml
BACKUP_RETENTION_DAYS=14
NEXT_PUBLIC_API_BASE_URL=https://api.teshtreats.com/api/v1
NEXT_PUBLIC_TEMP_TENANT_ID=platform
NEXT_PUBLIC_SITE_URL=https://teshtreats.com
```

Use `ENABLE_DB_MIGRATIONS=false` when PostgreSQL is private inside Docker. The server deploy job runs migrations through Docker Compose on the server, so GitHub does not need direct database access.

## Daily Backup Flow

`.github/workflows/db-backup.yml` runs daily at `07:00 UTC` and can also be run manually.

It does this:

1. SSH into the server.
2. `cd` into `SERVER_APP_DIR`.
3. Run `pg_dump` inside the `postgres` Docker Compose service.
4. Save a compressed file under `backups/teshtreats-YYYYMMDD-HHMMSS.sql.gz`.
5. Delete server backup files older than `BACKUP_RETENTION_DAYS`.
6. Download the new backup to the GitHub runner.
7. Send the `.sql.gz` file to Telegram with `sendDocument`.
8. Upload a short-lived GitHub Actions artifact for 3 days.
9. Send a Telegram failure message if the workflow fails.

## Push Deploy Flow

`.github/workflows/deploy.yml` runs when code is pushed to `main` and `ENABLE_SERVER_DEPLOY=true`.

It does this:

1. SSH into the server.
2. Create a pre-deploy compressed PostgreSQL backup.
3. Pull latest `main`:

```bash
git fetch origin main
git reset --hard origin/main
```

4. Start infrastructure services:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d postgres redis opensearch
```

5. Build the API image:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build api
```

6. Run migrations:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml --profile migrate run --rm migrate
```

7. Restart API and worker:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d api worker
```

8. Health-check the API container.
9. Prune unused Docker images.
10. Send Telegram success or failure status.

## Telegram Bot Setup

1. Open Telegram and message `@BotFather`.
2. Create a bot with `/newbot`.
3. Copy the bot token into GitHub secret `TELEGRAM_BOT_TOKEN`.
4. Send any message to the bot from the account or group that should receive backups.
5. Get the chat ID:

```bash
curl "https://api.telegram.org/bot<token>/getUpdates"
```

6. Copy the `chat.id` value into GitHub secret `TELEGRAM_CHAT_ID`.

For a Telegram group, add the bot to the group, send a message in the group, then call `getUpdates`.

## First Run Checklist

1. Confirm the server deploy user can run Docker:

```bash
ssh deploy@your-server
docker compose version
docker ps
```

2. Confirm the production stack works manually:

```bash
cd /srv/teshtreats/TeahTreats
docker compose --env-file .env.production -f docker-compose.prod.yml up -d postgres redis opensearch
docker compose --env-file .env.production -f docker-compose.prod.yml build api
docker compose --env-file .env.production -f docker-compose.prod.yml --profile migrate run --rm migrate
docker compose --env-file .env.production -f docker-compose.prod.yml up -d api worker
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T api wget -qO- http://127.0.0.1:4000/api/v1/health
```

3. Run `Daily Server Database Backup` manually from GitHub Actions.
4. Confirm Telegram receives the `.sql.gz`.
5. Push to `main`.
6. Confirm CI passes and the `Deploy` workflow updates API/worker on the server.
