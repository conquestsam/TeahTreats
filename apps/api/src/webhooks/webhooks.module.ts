import { Module } from '@nestjs/common';
import { PaymentsModule } from '../modules/payments/payments.module.js';
import { StripeWebhookController } from './stripe.webhook.js';
import { PaypalWebhookController } from './paypal.webhook.js';

@Module({
  imports: [PaymentsModule],
  controllers: [StripeWebhookController, PaypalWebhookController]
})
export class WebhooksModule {}
