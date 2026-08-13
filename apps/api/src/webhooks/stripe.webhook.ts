import { BadRequestException, Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { ApiPublicEndpoint } from '../common/decorators/openapi.decorator.js';
import { PaymentProvider } from '@prisma/client';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { PaymentReconciliationService } from '../modules/payments/application/payment-reconciliation.service.js';

@ApiTags('webhooks/stripe')
@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(
    private readonly config: ConfigService,
    private readonly reconciliation: PaymentReconciliationService,
  ) {}

  @Post()
  @ApiPublicEndpoint('Receive Stripe payment webhooks.', 'Provider webhook endpoint. Signature verification is enforced when webhook secrets are configured.')
  async handle(@Req() request: RawBodyRequest<Request>, @Headers('stripe-signature') signature?: string) {
    const rawBody = this.getRawBody(request);
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (secret) {
      this.verifyStripeSignature(rawBody, signature, secret);
    } else if (this.config.get<string>('NODE_ENV') === 'production') {
      throw new BadRequestException('Stripe webhook secret is not configured.');
    }

    const event = JSON.parse(rawBody.toString('utf8')) as StripeWebhookEvent;
    const object = this.readObject(event);
    const common = {
      provider: PaymentProvider.stripe,
      eventId: event.id,
      eventType: event.type,
      providerRef: this.readStripeProviderRef(object),
      orderId: this.readOrderId(object),
      amountCents: this.readStripeAmount(object),
      currency: this.readCurrency(object),
      payload: event as unknown as Record<string, unknown>
    };

    if (event.type === 'payment_intent.succeeded' || event.type === 'charge.succeeded') {
      return { data: await this.reconciliation.reconcileProviderSuccess(common) };
    }

    if (event.type === 'payment_intent.payment_failed' || event.type === 'charge.failed') {
      return { data: await this.reconciliation.reconcileProviderFailure(common) };
    }

    if (event.type === 'charge.refunded' || event.type === 'refund.created' || event.type === 'refund.updated') {
      return { data: await this.reconciliation.recordRefundPlaceholder(common) };
    }

    return {
      data: {
        received: true,
        provider: 'stripe',
        eventId: event.id,
        eventType: event.type,
        ignored: true
      }
    };
  }

  private getRawBody(request: RawBodyRequest<Request>) {
    if (request.rawBody) {
      return request.rawBody;
    }
    if (Buffer.isBuffer(request.body)) {
      return request.body;
    }
    if (request.body && typeof request.body === 'object') {
      return Buffer.from(JSON.stringify(request.body));
    }
    throw new BadRequestException('Stripe raw body is required.');
  }

  private verifyStripeSignature(rawBody: Buffer, signatureHeader: string | undefined, secret: string) {
    if (!signatureHeader) {
      throw new BadRequestException('Stripe signature is required.');
    }
    const parts = new Map(
      signatureHeader.split(',').map((part) => {
        const [key, value] = part.split('=');
        return [key, value] as const;
      }),
    );
    const timestamp = parts.get('t');
    const signature = parts.get('v1');
    if (!timestamp || !signature) {
      throw new BadRequestException('Stripe signature is malformed.');
    }
    const timestampMs = Number(timestamp) * 1000;
    if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
      throw new BadRequestException('Stripe signature timestamp is outside the allowed window.');
    }
    const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody.toString('utf8')}`).digest('hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    const receivedBuffer = Buffer.from(signature, 'hex');
    if (expectedBuffer.length !== receivedBuffer.length || !timingSafeEqual(expectedBuffer, receivedBuffer)) {
      throw new BadRequestException('Stripe signature verification failed.');
    }
  }

  private readObject(event: StripeWebhookEvent) {
    return event.data?.object && typeof event.data.object === 'object' ? event.data.object : {};
  }

  private readStripeProviderRef(object: Record<string, unknown>) {
    if (typeof object.id === 'string' && String(object.object) === 'payment_intent') {
      return object.id;
    }
    if (typeof object.payment_intent === 'string') {
      return object.payment_intent;
    }
    return typeof object.id === 'string' ? object.id : null;
  }

  private readOrderId(object: Record<string, unknown>) {
    const metadata = object.metadata && typeof object.metadata === 'object' && !Array.isArray(object.metadata)
      ? object.metadata as Record<string, unknown>
      : {};
    return typeof metadata.orderId === 'string' ? metadata.orderId : null;
  }

  private readStripeAmount(object: Record<string, unknown>) {
    for (const key of ['amount_received', 'amount_captured', 'amount']) {
      if (typeof object[key] === 'number') {
        return object[key];
      }
    }
    return null;
  }

  private readCurrency(object: Record<string, unknown>) {
    return typeof object.currency === 'string' ? object.currency.toUpperCase() : null;
  }
}

interface StripeWebhookEvent {
  id: string;
  type: string;
  data?: {
    object?: Record<string, unknown>;
  };
}
