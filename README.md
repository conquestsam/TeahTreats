# Snacks Commerce

Production-grade monorepo scaffold for the snacks e-commerce platform described in
`docs/adr/0001-system-architecture.md`.

## Stack

- Next.js App Router, Mantine, Tailwind CSS, TanStack Query
- NestJS modular monolith
- PostgreSQL with Prisma
- Redis and BullMQ
- OpenSearch
- Cloudflare R2
- Resend, Twilio, Stripe, PayPal integration structure
- REST with OpenAPI
- SSE-first realtime architecture

## Local Services

```bash
docker compose up -d postgres redis opensearch
```

## App Commands

```bash
pnpm install
pnpm db:generate
pnpm typecheck
pnpm build
pnpm dev
```

## Local Admin Login

Seeded development admin:

```text
Email: admin@snacks.local
Password: Password#23
```

These credentials are for local development only.

## Architecture

The backend is a modular monolith. Critical writes belong in PostgreSQL transactions, and side
effects flow through outbox events and workers.
