import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const auditKinds = ['auth', 'payment', 'tenant', 'settings', 'inventory', 'catalog', 'iam', 'all'] as const;

export class AuditLogQueryDto {
  @ApiPropertyOptional({ enum: auditKinds })
  @IsOptional()
  @IsIn(auditKinds)
  kind?: (typeof auditKinds)[number];

  @ApiPropertyOptional({ example: 'payment.manual-proof-approved' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  action?: string;
}
