import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripePaymentService {
  private readonly stripe: Stripe | null;

  constructor(config: ConfigService) {
    const secretKey = config.get<string>('STRIPE_SECRET_KEY');
    this.stripe = secretKey ? new Stripe(secretKey) : null;
  }

  isConfigured(): boolean {
    return this.stripe !== null;
  }

  async createPaymentIntent(input: {
    amountCents: number;
    currency: string;
    orderId: string;
    tenantId: string;
    idempotencyKey?: string;
  }) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured for this store.');
    }

    const intent = await this.stripe.paymentIntents.create(
      {
        amount: input.amountCents,
        currency: input.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        capture_method: 'automatic',
        metadata: {
          tenantId: input.tenantId,
          orderId: input.orderId
        }
      },
      input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
    );

    if (!intent.client_secret) {
      throw new BadRequestException('Stripe did not return a client secret. Check the Stripe account configuration.');
    }

    return intent;
  }
}
