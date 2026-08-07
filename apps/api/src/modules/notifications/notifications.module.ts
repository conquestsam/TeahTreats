import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminNotificationsService } from './application/admin-notifications.service.js';
import { NotificationTemplateService } from './application/notification-template.service.js';
import { AdminNotificationsController } from './presentation/admin-notifications.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AdminNotificationsController],
  providers: [AdminNotificationsService, NotificationTemplateService],
  exports: [NotificationTemplateService]
})
export class NotificationsModule {}
