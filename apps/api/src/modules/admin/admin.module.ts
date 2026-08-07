import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OutboxModule } from '../outbox/outbox.module.js';
import { AdminIamService } from './application/admin-iam.service.js';
import { AdminIamController } from './presentation/admin-iam.controller.js';
import { AdminOperationsController } from './presentation/admin-operations.controller.js';

@Module({
  imports: [JwtModule.register({}), OutboxModule],
  controllers: [AdminOperationsController, AdminIamController],
  providers: [AdminIamService]
})
export class AdminModule {}
