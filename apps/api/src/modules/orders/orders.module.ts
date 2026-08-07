import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { QueueModule } from '../../infrastructure/queue/queue.module.js';
import { OrdersService } from './application/orders.service.js';
import { AdminOrdersController } from './presentation/admin-orders.controller.js';
import { CustomerOrdersController } from './presentation/customer-orders.controller.js';

@Module({
  imports: [JwtModule.register({}), QueueModule],
  controllers: [AdminOrdersController, CustomerOrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule {}
