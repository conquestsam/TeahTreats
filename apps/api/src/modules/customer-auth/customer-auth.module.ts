import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CartModule } from '../cart/cart.module.js';
import { CustomerAuthCookieService } from './application/customer-auth-cookie.service.js';
import { CustomerAuthService } from './application/customer-auth.service.js';
import { CustomerAuthController } from './presentation/customer-auth.controller.js';

@Module({
  imports: [JwtModule.register({}), CartModule],
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService, CustomerAuthCookieService],
  exports: [CustomerAuthService]
})
export class CustomerAuthModule {}
