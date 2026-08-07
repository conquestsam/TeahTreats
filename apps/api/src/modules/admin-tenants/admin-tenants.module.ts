import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OutboxModule } from '../outbox/outbox.module.js';
import { AdminTenantsService } from './application/admin-tenants.service.js';
import { AdminTenantsController } from './presentation/admin-tenants.controller.js';

@Module({
  imports: [JwtModule.register({}), OutboxModule],
  controllers: [AdminTenantsController],
  providers: [AdminTenantsService],
  exports: [AdminTenantsService]
})
export class AdminTenantsModule {}
