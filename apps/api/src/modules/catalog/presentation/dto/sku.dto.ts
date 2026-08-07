import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsObject, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator';

export class CreateSkuDto {
  @ApiProperty({ example: 'Single pie' })
  @IsString()
  @Length(2, 120)
  name!: string;

  @ApiProperty({ example: 450 })
  @IsInt()
  @Min(1)
  priceCents!: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ example: '6 oz' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  size?: string;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsInt()
  @Min(1)
  packCount?: number;

  @ApiPropertyOptional({ example: 'box' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  unitLabel?: string;

  @ApiPropertyOptional({ example: '012345678905' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  barcode?: string;

  @ApiPropertyOptional({ example: '12 oz' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  weight?: string;

  @ApiPropertyOptional({ example: '8 x 4 x 2 in' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  dimensions?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  perishableOverride?: boolean;

  @ApiPropertyOptional({ example: { packSize: 'single' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateSkuDto {
  @ApiPropertyOptional({ example: 'Single pie' })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @ApiPropertyOptional({ example: 450 })
  @IsOptional()
  @IsInt()
  @Min(1)
  priceCents?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ example: '6 oz' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  size?: string | null;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsInt()
  @Min(1)
  packCount?: number | null;

  @ApiPropertyOptional({ example: 'box' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  unitLabel?: string | null;

  @ApiPropertyOptional({ example: '012345678905' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  barcode?: string | null;

  @ApiPropertyOptional({ example: '12 oz' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  weight?: string | null;

  @ApiPropertyOptional({ example: '8 x 4 x 2 in' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  dimensions?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  perishableOverride?: boolean | null;

  @ApiPropertyOptional({ example: { packSize: 'single' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
