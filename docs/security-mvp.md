# MVP Security Notes

## Local Development

- Local development keeps MFA non-blocking.
- Admin MFA placeholder accepts `000000` only when `NODE_ENV` is not `production`.
- Cookie `secure` defaults to true in production and may be overridden with `AUTH_COOKIE_SECURE`.
- `AUTH_COOKIE_SAMESITE=none` forces secure cookies.

## Webhooks

- Stripe webhooks verify `stripe-signature` when `STRIPE_WEBHOOK_SECRET` is configured.
- Production rejects Stripe webhooks if `STRIPE_WEBHOOK_SECRET` is missing.
- PayPal webhook handling validates the expected transmission headers and keeps the provider verification boundary ready for PayPal's remote verification API.
- Webhook payloads are reconciled idempotently by provider event ID.

## Uploads

- Product images are limited to JPG, JPEG, PNG, or WebP.
- Product image signed upload requests are capped at 5 MB.
- Receipt uploads are limited to JPG, JPEG, PNG, WebP, or PDF.
- Receipt signed upload requests are capped at 10 MB.
- Object keys are generated server-side and do not use client filenames.

## Rate Limits

MVP in-memory rate limits protect:

- Admin login
- Customer signup and login
- Payment receipt upload and proof submission
- Storefront search
- Checkout start

Use Redis-backed limits before multi-instance production deployment.
