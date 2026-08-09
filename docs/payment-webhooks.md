# Payment Webhooks

This app uses embedded in-app checkout:

- Stripe Payment Element in the browser.
- PayPal Buttons in the browser.
- Secret provider keys only on the NestJS API.
- Provider webhooks as the final source of truth for payment success, failure, refund, and reconciliation.

Frontend public identifiers are expected for embedded checkout:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`

These are not secret API keys. Secret keys stay backend-only:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`

## App Webhook URLs

Local API URLs:

- Stripe: `http://localhost:4000/api/v1/webhooks/stripe`
- PayPal: `http://localhost:4000/api/v1/webhooks/paypal`

Production API URLs:

- Stripe: `https://api.your-domain.com/api/v1/webhooks/stripe`
- PayPal: `https://api.your-domain.com/api/v1/webhooks/paypal`

Replace `api.your-domain.com` with the deployed API domain. Providers need a public HTTPS URL in staging and production.

## Stripe Local Setup

1. Install the Stripe CLI.
2. Log in:

```bash
stripe login
```

3. Forward local Stripe events to the API:

```bash
stripe listen --forward-to localhost:4000/api/v1/webhooks/stripe
```

4. Copy the displayed signing secret that starts with `whsec_`.
5. Set it in `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

6. Restart the API:

```bash
pnpm dev:api
```

7. Trigger a test event:

```bash
stripe trigger payment_intent.succeeded
```

For real checkout testing, create an order in the app, start card payment, and complete the Stripe Payment Element with Stripe test card data.

## Stripe Dashboard Setup

1. Open the Stripe Dashboard.
2. Go to Developers, then Webhooks.
3. Create an endpoint.
4. Use the deployed API URL:

```txt
https://api.your-domain.com/api/v1/webhooks/stripe
```

5. Subscribe at minimum to:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.succeeded`
- `charge.failed`
- `charge.refunded`
- `refund.created`
- `refund.updated`

6. Copy the endpoint signing secret.
7. Store it as `STRIPE_WEBHOOK_SECRET` in the API secret manager.
8. Do not put `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` in frontend env.

## PayPal Sandbox Setup

1. Open the PayPal Developer Dashboard.
2. Create or select a Sandbox REST app.
3. Copy the app client ID and secret.
4. Set API env:

```env
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_ENVIRONMENT=sandbox
```

5. Set web env:

```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
```

6. In the same PayPal app, create a webhook.
7. Use a public HTTPS URL for staging or production:

```txt
https://api.your-domain.com/api/v1/webhooks/paypal
```

For local-only testing, expose the API through a tunnel such as ngrok or Cloudflare Tunnel, then use the tunnel HTTPS URL:

```txt
https://your-tunnel-url.ngrok-free.app/api/v1/webhooks/paypal
```

8. Subscribe at minimum to:

- `CHECKOUT.ORDER.APPROVED`
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.DECLINED`
- `CHECKOUT.ORDER.VOIDED`
- `PAYMENT.CAPTURE.REFUNDED`
- `PAYMENT.CAPTURE.REVERSED`

9. Copy the PayPal webhook ID from the webhook details.
10. Set it in API env:

```env
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
```

11. Restart API and worker:

```bash
pnpm dev:api
pnpm dev:worker
```

## PayPal Production Setup

1. Create or select a Live PayPal REST app.
2. Use Live credentials:

```env
PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_client_secret
PAYPAL_ENVIRONMENT=production
PAYPAL_WEBHOOK_ID=your_live_webhook_id
```

3. Use the same live client ID for the browser-safe PayPal Buttons identifier:

```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id
```

4. Register the production webhook URL:

```txt
https://api.your-domain.com/api/v1/webhooks/paypal
```

5. Keep PayPal dashboard access behind team MFA.

## Production Hard Rules

- Stripe and PayPal secret keys must only exist in the API runtime.
- `STRIPE_WEBHOOK_SECRET` is required in production.
- `PAYPAL_WEBHOOK_ID` is required in production.
- Webhooks must not require browser cookies or CSRF tokens.
- Payment status in the UI is informational until backend reconciliation confirms it.
- Duplicate provider events must remain idempotent.
- Failed webhooks must not corrupt order or inventory state.

## Official References

- [Stripe webhooks](https://docs.stripe.com/webhooks)
- [Stripe CLI listen](https://docs.stripe.com/stripe-cli/listen)
- [Stripe Payment Element](https://docs.stripe.com/payments/payment-element)
- [PayPal Webhooks](https://developer.paypal.com/api/rest/webhooks/)
- [PayPal verify webhook signature API](https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post)
