# Scaffold Notes

This scaffold follows `docs/adr/0001-system-architecture.md`.

## Important Implementation Rules

- PostgreSQL is the source of truth.
- Redis is used for hot state, queues, rate limits, locks, and realtime support.
- OpenSearch is an eventually consistent read model.
- Side effects must flow through outbox events and workers.
- Delivery is off-platform. The app ends at readiness notification and completion marking.
- Tenant scoping belongs in backend policies and repository queries.
- TypeScript is pinned to `6.0.3` as the ecosystem-stable fallback. TypeScript 7.0.2 is newer, but it
  does not expose the compiler API required by current lint/build tooling in this stack. Move to TS7
  after Next.js, NestJS, Prisma, and typescript-eslint all validate cleanly together.

## First Vertical Slice Recommendation

Build product catalog next:

1. Tenant-scoped product CRUD.
2. SKU creation.
3. Product image signed upload URL through Cloudflare R2.
4. Product change outbox event.
5. Redis cache invalidation worker.
6. OpenSearch sync worker.
7. Admin product table in the Next.js app.
