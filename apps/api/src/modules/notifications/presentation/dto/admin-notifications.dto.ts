import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const notificationStatuses = ['pending', 'sent', 'failed', 'skipped', 'processing'] as const;
const notificationChannels = ['email', 'sms', 'whatsapp', 'in_app'] as const;

export class ListNotificationsQueryDto {
  @ApiPropertyOptional({ enum: notificationStatuses })
  @IsOptional()
  @IsIn(notificationStatuses)
  status?: (typeof notificationStatuses)[number];
}

export class SmokeTestNotificationDto {
  @ApiPropertyOptional({ enum: notificationChannels, isArray: true })
  @IsOptional()
  @IsIn(notificationChannels, { each: true })
  channels?: Array<(typeof notificationChannels)[number]>;

  @ApiPropertyOptional({ example: 'admin@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;
}
