# REST API Conventions

Base path: `/api/v1`

Route groups:

- `/shop/*`
- `/auth/*`
- `/account/*`
- `/admin/*`
- `/vendor/*`
- `/webhooks/*`
- `/realtime/*`

Dangerous writes must support an `Idempotency-Key` header.

Tenant-scoped admin/vendor requests must include tenant context through authenticated claims. During
early local development, `x-tenant-id` can be used before full auth is implemented.
