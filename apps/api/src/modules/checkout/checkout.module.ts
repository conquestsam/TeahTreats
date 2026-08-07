import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PromotionsModule } from '../promotions/promotions.module.js';
import { CheckoutService } from './application/checkout.service.js';
import { CheckoutController } from './presentation/checkout.controller.js';

@Module({
  imports: [JwtModule.register({}), PromotionsModule],
  controllers: [CheckoutController],
  providers: [CheckoutService]
})
export class CheckoutModule {}
