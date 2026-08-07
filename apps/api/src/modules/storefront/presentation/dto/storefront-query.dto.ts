import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { storefrontSortOptions, type StorefrontSortOption } from '@snacks/shared';

function trimQueryValue({ value }: TransformFnParams) {
  const candidate = value as unknown;
  return typeof candidate === 'string' ? candidate.trim() : candidate;
}

export class StorefrontProductListQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 48, default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(48)
  pageSize = 12;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(trimQueryValue)
  q?: string;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(trimQueryValue)
  category?: string;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(trimQueryValue)
  brand?: string;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(trimQueryValue)
  tag?: string;

  @ApiPropertyOptional({ enum: storefrontSortOptions, default: 'newest' })
  @IsOptional()
  @IsIn(storefrontSortOptions)
  sort: StorefrontSortOption = 'newest';
}

export class StorefrontSearchQueryDto extends StorefrontProductListQueryDto {}
