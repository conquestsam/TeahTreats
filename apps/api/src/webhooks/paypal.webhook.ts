import { BadRequestException, Body, Controller, Headers, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentProvider } from '@prisma/client';
import { PaymentReconciliationService } from '../modules/payments/application/payment-reconciliation.service.js';

@ApiTags('webhooks/paypal')
@Controller('webhooks/paypal')
export class PaypalWebhookController {
  constructor(
    private readonly config: ConfigService,
    private readonly reconciliation: PaymentReconciliationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Receive PayPal payment webhooks.' })
  async handle(@Headers() headers: Record<string, string | undefined>, @Body() body: PaypalWebhookEvent) {
    await this.verifyPaypalSignature(headers, body);
    const resource = body.resource && typeof body.resource === 'object' ? body.resource : {};
    const common = {
      provider: PaymentProvider.paypal,
      eventId: body.id,
      eventType: body.event_type,
      providerRef: this.readPaypalProviderRef(resource),
      orderId: this.readOrderId(resource),
      amountCents: this.readAmountCents(resource),
      currency: this.readCurrency(resource),
      payload: body as unknown as Record<string, unknown>
    };

    if (body.event_type === 'PAYMENT.CAPTURE.COMPLETED' || body.event_type === 'CHECKOUT.ORDER.APPROVED') {
      return { data: await this.reconciliation.reconcileProviderSuccess(common) };
    }

    if (
      body.event_type === 'PAYMENT.CAPTURE.DENIED' ||
      body.event_type === 'PAYMENT.CAPTURE.DECLINED' ||
      body.event_type === 'CHECKOUT.ORDER.VOIDED'
    ) {
      return { data: await this.reconciliation.reconcileProviderFailure(common) };
    }

    if (body.event_type === 'PAYMENT.CAPTURE.REFUNDED' || body.event_type === 'PAYMENT.CAPTURE.REVERSED') {
      return { data: await this.reconciliation.recordRefundPlaceholder(common) };
    }

    return {
      data: {
        received: true,
        provider: 'paypal',
        eventId: body.id,
        eventType: body.event_type,
        ignored: true
      }
    };
  }

  private async verifyPaypalSignature(headers: Record<string, string | undefined>, body: PaypalWebhookEvent) {
    const webhookId = this.config.get<string>('PAYPAL_WEBHOOK_ID');
    const production = this.config.get<string>('NODE_ENV') === 'production';
    const required = [
      'paypal-transmission-id',
      'paypal-transmission-time',
      'paypal-transmission-sig',
      'paypal-cert-url',
      'paypal-auth-algo'
    ];
    const missing = required.filter((header) => !headers[header]);
    if (missing.length > 0) {
      if (!production) {
        return;
      }
      throw new BadRequestException('PayPal webhook signature headers are incomplete.');
    }
    if (!webhookId) {
      if (!production) {
        return;
      }
      throw new BadRequestException('PayPal webhook ID is not configured.');
    }

    const accessToken = await this.createPaypalAccessToken();
    const response = await fetch(`${this.paypalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: body
      })
    });

    if (!response.ok) {
      throw new BadRequestException('PayPal webhook signature verification failed.');
    }
    const result = (await response.json()) as { verification_status?: string };
    if (result.verification_status !== 'SUCCESS') {
      throw new BadRequestException('PayPal webhook signature verification failed.');
    }
  }

  private async createPaypalAccessToken() {
    const clientId = this.config.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.config.get<string>('PAYPAL_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new BadRequestException('PayPal credentials are not configured.');
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch(`${this.paypalBaseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new BadRequestException('PayPal webhook verification authentication failed.');
    }
    const result = (await response.json()) as { access_token?: string };
    if (!result.access_token) {
      throw new BadRequestException('PayPal webhook verification authentication failed.');
    }
    return result.access_token;
  }

  private paypalBaseUrl() {
    return this.config.get<string>('PAYPAL_ENVIRONMENT') === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private readPaypalProviderRef(resource: Record<string, unknown>) {
    if (typeof resource.id === 'string') {
      return resource.id;
    }
    if (typeof resource.capture_id === 'string') {
      return resource.capture_id;
    }
    return null;
  }

  private readOrderId(resource: Record<string, unknown>) {
    if (typeof resource.invoice_id === 'string') {
      return resource.invoice_id;
    }
    if (typeof resource.custom_id === 'string') {
      return resource.custom_id;
    }
    const supplementary = resource.supplementary_data && typeof resource.supplementary_data === 'object' && !Array.isArray(resource.supplementary_data)
      ? resource.supplementary_data as Record<string, unknown>
      : {};
    return typeof supplementary.order_id === 'string' ? supplementary.order_id : null;
  }

  private readAmountCents(resource: Record<string, unknown>) {
    const amount = resource.amount && typeof resource.amount === 'object' && !Array.isArray(resource.amount)
      ? resource.amount as Record<string, unknown>
      : {};
    if (typeof amount.value !== 'string') {
      return null;
    }
    return Math.round(Number(amount.value) * 100);
  }

  private readCurrency(resource: Record<string, unknown>) {
    const amount = resource.amount && typeof resource.amount === 'object' && !Array.isArray(resource.amount)
      ? resource.amount as Record<string, unknown>
      : {};
    return typeof amount.currency_code === 'string' ? amount.currency_code.toUpperCase() : null;
  }
}

interface PaypalWebhookEvent {
  id: string;
  event_type: string;
  resource?: Record<string, unknown>;
}
