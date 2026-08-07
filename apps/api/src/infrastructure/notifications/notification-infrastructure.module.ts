import { Global, Module } from '@nestjs/common';
import { EmailService } from './email/email.service.js';
import { SmsService } from './sms/sms.service.js';
import { WhatsappService } from './whatsapp/whatsapp.service.js';

@Global()
@Module({
  providers: [EmailService, SmsService, WhatsappService],
  exports: [EmailService, SmsService, WhatsappService]
})
export class NotificationInfrastructureModule {}
