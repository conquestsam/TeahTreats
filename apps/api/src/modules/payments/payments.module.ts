import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PaymentReconciliationService } from './application/payment-reconciliation.service.js';
import { PaymentService } from './application/payment.service.js';
import { PaymentController } from './presentation/payment.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [PaymentController],
  providers: [PaymentReconciliationService, PaymentService],
  exports: [PaymentReconciliationService, PaymentService]
})
export class PaymentsModule {}
