import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min, MinLength, NotEquals } from 'class-validator';

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
