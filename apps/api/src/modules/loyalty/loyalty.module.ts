import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LoyaltyFoundationsService } from './application/loyalty-foundations.service.js';
import { CustomerFoundationsController } from './presentation/customer-foundations.controller.js';
import { CustomerLoyaltyController } from './presentation/customer-loyalty.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [CustomerLoyaltyController, CustomerFoundationsController],
  providers: [LoyaltyFoundationsService],
  exports: [LoyaltyFoundationsService]
})
export class LoyaltyModule {}
