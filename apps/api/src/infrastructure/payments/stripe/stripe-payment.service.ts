import { Injectable } from '@nestjs/common';
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

  async createPaymentIntent(input: { amountCents: number; currency: string; orderId: string }) {
    if (!this.stripe) {
      return { skipped: true, reason: 'STRIPE_SECRET_KEY is not configured' };
    }

    return this.stripe.paymentIntents.create({
      amount: input.amountCents,
      currency: input.currency.toLowerCase(),
      metadata: {
        orderId: input.orderId
      }
    });
  }
}
