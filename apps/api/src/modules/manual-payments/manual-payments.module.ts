import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ManualPaymentReviewService } from './application/manual-payment-review.service.js';
import { ManualPaymentReviewController } from './presentation/manual-payment-review.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ManualPaymentReviewController],
  providers: [ManualPaymentReviewService]
})
export class ManualPaymentsModule {}
