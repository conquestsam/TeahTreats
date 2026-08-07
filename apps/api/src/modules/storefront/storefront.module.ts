import { Module } from '@nestjs/common';
import { StorefrontService } from './application/storefront.service.js';
import { StorefrontController } from './presentation/storefront.controller.js';

@Module({
  controllers: [StorefrontController],
  providers: [StorefrontService]
})
export class StorefrontModule {}
