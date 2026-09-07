import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength
} from 'class-validator';

const notificationChannels = ['email', 'sms', 'whatsapp'] as const;

export class SettingsBusinessAddressDto {
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

export class UpdateBusinessProfileDto {
  @ApiProperty({ example: 'Downtown Snacks' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'ops@downtownsnacks.local' })
  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  businessPhone?: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  defaultCurrency!: string;

  @ApiProperty({ example: 'America/New_York' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  timezone!: string;

  @ApiPropertyOptional({ type: SettingsBusinessAddressDto })
  @IsOptional()
  @IsObject()
  businessAddress?: SettingsBusinessAddressDto;
}

export class UpdateApprovalSettingsDto {
  @ApiProperty({ default: true })
  @IsBoolean()
  delegatedRoleApprovalRequired!: boolean;
}

export class UpdateNotificationChannelsDto {
  @ApiProperty({ enum: notificationChannels, isArray: true })
  @IsArray()
  @IsIn(notificationChannels, { each: true })
  orderReadinessNotificationChannels!: Array<(typeof notificationChannels)[number]>;
}

export class CreateManualPaymentMethodDto {
  @ApiProperty({ example: 'zelle' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  key!: string;

  @ApiProperty({ example: 'Zelle' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  label!: string;

  @ApiProperty({ example: 'Send payment to billing@example.com and upload your receipt.' })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  instructions!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateManualPaymentMethodDto extends PartialType(CreateManualPaymentMethodDto) {}

export class CreateDeliverySlotDto {
  @ApiProperty({ example: 'Afternoon Handoff Window' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  label!: string;

  @ApiProperty({ example: 'delivery_handoff', enum: ['delivery_handoff', 'store_pickup', 'scheduled_delivery'] })
  @IsIn(['delivery_handoff', 'store_pickup', 'scheduled_delivery'])
  method!: 'delivery_handoff' | 'store_pickup' | 'scheduled_delivery';

  @ApiProperty({ example: '13:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;

  @ApiProperty({ example: '16:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime!: string;

  @ApiProperty({ example: 1500 })
  @IsInt()
  @Min(0)
  feeCents!: number;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiProperty({ example: '11:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  cutoffTime!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ example: 'atlanta-central' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  hubId?: string;

  @ApiPropertyOptional({ example: 'atlanta-main' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  storeId?: string;
}

export class UpdateDeliverySlotDto extends PartialType(CreateDeliverySlotDto) {}
