import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Matches
} from 'class-validator';

export const productStatuses = ['draft', 'active', 'archived'] as const;
export type ProductStatusDto = (typeof productStatuses)[number];

export class CreateProductDto {
  @ApiProperty({ example: 'Fresh Meat Pie' })
  @IsString()
  @Length(2, 120)
  name!: string;

  @ApiPropertyOptional({ example: 'fresh-meat-pie' })
  @IsOptional()
  @IsString()
  @Length(2, 140)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @ApiPropertyOptional({ example: 'Warm snack pie prepared fresh.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'Snacks Kitchen' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  brand?: string;

  @ApiPropertyOptional({ example: 'Fresh Bites' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @ApiPropertyOptional({ enum: productStatuses, default: 'draft' })
  @IsOptional()
  @IsIn(productStatuses)
  status?: ProductStatusDto;

  @ApiPropertyOptional({ example: ['fresh', 'savory'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'Savory beef' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  flavor?: string;

  @ApiPropertyOptional({ example: 'Lunch' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  occasion?: string;

  @ApiPropertyOptional({ example: ['flour', 'beef', 'butter'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @ApiPropertyOptional({ example: ['wheat', 'milk'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @ApiPropertyOptional({ example: { calories: '420', protein: '14g' } })
  @IsOptional()
  @IsObject()
  nutritionFacts?: Record<string, string>;

  @ApiPropertyOptional({ example: ['high-protein'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryLabels?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPerishable?: boolean;

  @ApiPropertyOptional({ example: 'Keep refrigerated. Reheat before serving.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  storageInstructions?: string;

  @ApiPropertyOptional({ example: 'Best within 2 days of preparation.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shelfLifeNotes?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  bundleEligible?: boolean;

  @ApiPropertyOptional({ example: 'Fresh Meat Pie | Snacks Commerce' })
  @IsOptional()
  @IsString()
  @MaxLength(70)
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Order fresh meat pies with live availability.' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  seoDescription?: string;

  @ApiPropertyOptional({ example: { isPerishable: true, allergens: ['wheat'], tags: ['fresh'] } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Fresh Meat Pie' })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @ApiPropertyOptional({ example: 'Warm snack pie prepared fresh.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'Snacks Kitchen' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  brand?: string | null;

  @ApiPropertyOptional({ example: 'Fresh Bites' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string | null;

  @ApiPropertyOptional({ enum: productStatuses })
  @IsOptional()
  @IsIn(productStatuses)
  status?: ProductStatusDto;

  @ApiPropertyOptional({ example: ['fresh', 'savory'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'Savory beef' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  flavor?: string | null;

  @ApiPropertyOptional({ example: 'Lunch' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  occasion?: string | null;

  @ApiPropertyOptional({ example: ['flour', 'beef', 'butter'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @ApiPropertyOptional({ example: ['wheat', 'milk'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @ApiPropertyOptional({ example: { calories: '420', protein: '14g' } })
  @IsOptional()
  @IsObject()
  nutritionFacts?: Record<string, string>;

  @ApiPropertyOptional({ example: ['high-protein'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryLabels?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPerishable?: boolean;

  @ApiPropertyOptional({ example: 'Keep refrigerated. Reheat before serving.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  storageInstructions?: string | null;

  @ApiPropertyOptional({ example: 'Best within 2 days of preparation.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shelfLifeNotes?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  bundleEligible?: boolean;

  @ApiPropertyOptional({ example: 'Fresh Meat Pie | Snacks Commerce' })
  @IsOptional()
  @IsString()
  @MaxLength(70)
  seoTitle?: string | null;

  @ApiPropertyOptional({ example: 'Order fresh meat pies with live availability.' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  seoDescription?: string | null;

  @ApiPropertyOptional({ example: { isPerishable: true, allergens: ['wheat'], tags: ['fresh'] } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
