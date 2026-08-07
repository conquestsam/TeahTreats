import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CheckoutPaymentIntent, Client, Environment, OrdersController } from '@paypal/paypal-server-sdk';

@Injectable()
export class PaypalPaymentService {
  private readonly client: Client | null;

  constructor(config: ConfigService) {
    const clientId = config.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = config.get<string>('PAYPAL_CLIENT_SECRET');
    this.client =
      clientId && clientSecret
        ? new Client({
          clientCredentialsAuthCredentials: {
            oAuthClientId: clientId,
            oAuthClientSecret: clientSecret
          },
          environment:
            config.get<string>('PAYPAL_ENVIRONMENT') === 'production' ? Environment.Production : Environment.Sandbox
        })
        : null;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async createOrderIntent(input: { amountCents: number; currency: string; orderId: string }) {
    if (!this.client) {
      return {
        id: `paypal_local_${input.orderId}`,
        provider: 'paypal',
        status: 'skipped',
        reason: 'PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is not configured',
        custom_id: input.orderId,
        ...input
      };
    }
    try {
      const response = await new OrdersController(this.client).createOrder({
        paypalRequestId: input.orderId,
        prefer: 'return=representation',
        body: {
          intent: CheckoutPaymentIntent.Capture,
          purchaseUnits: [
            {
              referenceId: input.orderId,
              customId: input.orderId,
              amount: {
                currencyCode: input.currency.toUpperCase(),
                value: (input.amountCents / 100).toFixed(2)
              }
            }
          ]
        }
      });

      return {
        id: response.result.id,
        provider: 'paypal',
        status: response.result.status,
        custom_id: input.orderId,
        links: response.result.links,
        ...input
      };
    } catch (error: any) {
      const description = error?.result?.error_description || error?.message || 'Paypal authentication failed.';
      throw new BadRequestException(`Paypal gateway error: ${description}`);
    }
  }
}
