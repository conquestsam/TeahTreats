import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CartService } from './application/cart.service.js';
import { CartController } from './presentation/cart.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService]
})
export class CartModule {}
