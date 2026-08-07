import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

const notificationStatuses = ['pending', 'sent', 'failed', 'skipped', 'processing'] as const;

export class ListNotificationsQueryDto {
  @ApiPropertyOptional({ enum: notificationStatuses })
  @IsOptional()
  @IsIn(notificationStatuses)
  status?: (typeof notificationStatuses)[number];
}
