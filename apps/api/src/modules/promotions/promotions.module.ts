import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OutboxModule } from '../outbox/outbox.module.js';
import { PromotionsService } from './application/promotions.service.js';
import { AdminPromotionsController } from './presentation/admin-promotions.controller.js';
import { CustomerPromotionsController } from './presentation/customer-promotions.controller.js';

@Module({
  imports: [JwtModule.register({}), OutboxModule],
  controllers: [AdminPromotionsController, CustomerPromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService]
})
export class PromotionsModule {}
