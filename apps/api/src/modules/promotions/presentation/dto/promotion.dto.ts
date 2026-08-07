import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

const statuses = ['draft', 'active', 'archived'] as const;
const discountTypes = ['percentage', 'fixed_amount', 'bundle', 'free_shipping', 'first_order'] as const;
const targetTypes = ['all_products', 'products', 'categories', 'brands', 'customers'] as const;

export class PromotionCouponDto {
  @ApiProperty({ example: 'WELCOME10' })
  @IsString()
  @Matches(/^[A-Z0-9][A-Z0-9_-]{1,31}$/)
  code!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;
}

export class CreatePromotionDto {
  @ApiProperty({ example: 'First snack order' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'Give new customers a simple first order discount.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ enum: statuses, default: 'draft' })
  @IsOptional()
  @IsIn(statuses)
  status?: (typeof statuses)[number];

  @ApiProperty({ enum: discountTypes })
  @IsIn(discountTypes)
  discountType!: (typeof discountTypes)[number];

  @ApiProperty({ minimum: 0, description: 'Percentage points or cents, depending on discount type.' })
  @IsInt()
  @Min(0)
  @Max(10000000)
  discountValue!: number;

  @ApiPropertyOptional({ enum: targetTypes, default: 'all_products' })
  @IsOptional()
  @IsIn(targetTypes)
  targetType?: (typeof targetTypes)[number];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetProductIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCategories?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetBrands?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCustomerIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  perCustomerLimit?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minimumOrderAmountCents?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  stackable?: boolean;

  @ApiPropertyOptional({ type: [PromotionCouponDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromotionCouponDto)
  couponCodes?: PromotionCouponDto[];
}

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {}

export class ValidateCouponDto {
  @ApiProperty({ example: 'WELCOME10' })
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  code!: string;

  @ApiPropertyOptional({ example: 'ada@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
