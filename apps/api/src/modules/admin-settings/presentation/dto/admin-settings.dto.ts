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
