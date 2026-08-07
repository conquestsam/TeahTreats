import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OutboxModule } from '../outbox/outbox.module.js';
import { AdminSettingsService } from './application/admin-settings.service.js';
import { AdminSettingsController } from './presentation/admin-settings.controller.js';

@Module({
  imports: [JwtModule.register({}), OutboxModule],
  controllers: [AdminSettingsController],
  providers: [AdminSettingsService],
  exports: [AdminSettingsService]
})
export class AdminSettingsModule {}
