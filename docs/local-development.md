# Local Development

Use this flow when running the snacks e-commerce app locally.

## First Setup

```bash
cp .env.example .env
pnpm install
pnpm dev:bootstrap
```

`pnpm dev:bootstrap` starts Docker infrastructure, generates Prisma, syncs the local database, and seeds sample data.

In non-interactive shells such as CI or Codex tasks, prefix pnpm commands with `CI=true` if pnpm tries to prompt while checking workspace dependencies:

```bash
CI=true pnpm db:validate
```

Equivalent explicit commands:

```bash
pnpm infra:start
pnpm db:generate
pnpm dev:db:push
pnpm db:seed
```

## Run The App

Use three terminals for the complete local runtime:

```bash
pnpm dev:api
```

```bash
pnpm dev:worker
```

```bash
pnpm dev:web
```

The web app runs at `http://localhost:3000`.
The API runs at `http://localhost:4000/api/v1`.
The worker process runs BullMQ processors for outbox events, notifications, inventory reservation expiry, cache invalidation, and OpenSearch sync.

## Smoke Checks

Run these after the API starts:

```bash
pnpm smoke:health
pnpm smoke:storefront
pnpm smoke:admin-login
pnpm smoke:customer-auth
```

Or run all checks:

```bash
pnpm smoke:local
```

## Common Failure

If the browser shows `ERR_CONNECTION_REFUSED` for `localhost:4000`, the API is not running. Start it with:

```bash
pnpm dev:api
```

If product requests fail with tenant errors, make sure `.env` contains:

```bash
NEXT_PUBLIC_TEMP_TENANT_ID=platform
```

If side effects do not happen, such as notifications, search sync, or reservation expiry, start the worker:

```bash
pnpm dev:worker
```

If Prisma client errors reference stale generated files, run:

```bash
pnpm db:generate
```
