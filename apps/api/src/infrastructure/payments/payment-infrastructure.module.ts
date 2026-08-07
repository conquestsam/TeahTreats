import { Global, Module } from '@nestjs/common';
import { StripePaymentService } from './stripe/stripe-payment.service.js';
import { PaypalPaymentService } from './paypal/paypal-payment.service.js';
import { ManualPaymentService } from './manual/manual-payment.service.js';

@Global()
@Module({
  providers: [StripePaymentService, PaypalPaymentService, ManualPaymentService],
  exports: [StripePaymentService, PaypalPaymentService, ManualPaymentService]
})
export class PaymentInfrastructureModule {}
