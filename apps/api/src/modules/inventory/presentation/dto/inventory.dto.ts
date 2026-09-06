import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsObject, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength, NotEquals } from 'class-validator';

export class CreateInventoryBatchDto {
  @ApiProperty()
  @IsUUID()
  skuId!: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  quantity!: number;

  @ApiPropertyOptional({ example: '2026-08-10T18:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ example: 'Fresh batch received.' })
  @IsString()
  @MinLength(2)
  reason!: string;

  @ApiPropertyOptional({ example: 'BATCH-20260218-LK' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  batchCode?: string;

  @ApiPropertyOptional({ example: 'Cold Room 01' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  storageLocation?: string;

  @ApiPropertyOptional({ example: 'Bakery Station' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  storageZone?: string;

  @ApiPropertyOptional({ example: 'Internal Kitchen' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  qualityChecked?: boolean;

  @ApiPropertyOptional({ example: { supplier: 'Fresh Chef Prep' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class AdjustInventoryBatchDto {
  @ApiProperty({ example: -2 })
  @IsInt()
  @NotEquals(0)
  quantityDelta!: number;

  @ApiProperty({ example: 'Damaged during handling.' })
  @IsString()
  @MinLength(2)
  reason!: string;
}

export class ReserveInventoryDto {
  @ApiProperty()
  @IsUUID()
  skuId!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderId?: string;
}
