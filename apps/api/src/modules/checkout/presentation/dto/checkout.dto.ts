import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class StartCheckoutDto {
  @ApiProperty({ example: 'Ada Customer' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'ada@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+15551234567' })
  @IsString()
  @MinLength(7)
  phone!: string;

  @ApiProperty({ example: '123 Snack Street, Austin, TX' })
  @IsString()
  @MinLength(5)
  address!: string;

  @ApiProperty({ example: 'delivery_handoff', required: false })
  @IsOptional()
  @IsIn(['delivery_handoff', 'store_pickup', 'scheduled_delivery'])
  fulfillmentMethod?: 'delivery_handoff' | 'store_pickup' | 'scheduled_delivery';

  @ApiProperty({ example: 'Sophie Sterling', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  recipientName?: string;

  @ApiProperty({ example: '740 Park Avenue', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  addressLine1?: string;

  @ApiProperty({ example: 'Apt 14B', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  addressLine2?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  state?: string;

  @ApiProperty({ example: '10021', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiProperty({ example: 'Check in with front desk concierge.', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  handoffInstructions?: string;

  @ApiProperty({ example: '2026-09-06', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  deliveryDate?: string;

  @ApiProperty({ example: '4:00 PM - 7:00 PM', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  deliveryWindow?: string;

  @ApiProperty({ example: 'WELCOME10', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  couponCode?: string;
}
