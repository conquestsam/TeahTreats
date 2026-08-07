import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator';

const notificationChannels = ['email', 'sms', 'whatsapp'] as const;

export class TenantBusinessAddressDto {
  @ApiPropertyOptional({ example: '100 Market Street' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  line1?: string;

  @ApiPropertyOptional({ example: 'Suite 20' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  line2?: string;

  @ApiPropertyOptional({ example: 'Austin' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @ApiPropertyOptional({ example: 'TX' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  state?: string;

  @ApiPropertyOptional({ example: '78701' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;
}

export class CreateTenantDto {
  @ApiProperty({ example: 'Downtown Snacks' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'downtown-snacks' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @ApiPropertyOptional({ example: 'ops@downtownsnacks.local' })
  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  businessPhone?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  delegatedRoleApprovalRequired?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  manualPaymentEnabled?: boolean;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  defaultCurrency?: string;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  timezone?: string;

  @ApiPropertyOptional({ type: TenantBusinessAddressDto })
  @IsOptional()
  @IsObject()
  businessAddress?: TenantBusinessAddressDto;

  @ApiPropertyOptional({ enum: notificationChannels, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIn(notificationChannels, { each: true })
  orderReadinessNotificationChannels?: Array<(typeof notificationChannels)[number]>;
}

export class UpdateTenantDto extends PartialType(CreateTenantDto) {}

export class DeactivateTenantDto {
  @ApiProperty({ example: 'Store is no longer active.' })
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  reason!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

export class ReactivateTenantDto {
  @ApiPropertyOptional({ example: 'Store has reopened.' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}
