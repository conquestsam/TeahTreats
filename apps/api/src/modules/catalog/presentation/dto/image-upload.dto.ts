import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';

export const imageContentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;

export class CreateProductImageUploadDto {
  @ApiProperty({ enum: imageContentTypes, example: 'image/jpeg' })
  @IsString()
  @IsIn(imageContentTypes)
  contentType!: (typeof imageContentTypes)[number];

  @ApiPropertyOptional({ example: 1048576, maximum: 5242880 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5 * 1024 * 1024)
  sizeBytes?: number;
}

export const productImageStorageProviders = ['cloudinary', 'r2'] as const;

export class CreateProductImageDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/snacks/meat-pie.jpg' })
  @IsString()
  @IsUrl({ require_tld: false })
  url!: string;

  @ApiPropertyOptional({ example: 'snacks/platform/products/product-id/image.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  objectKey?: string;

  @ApiPropertyOptional({ enum: productImageStorageProviders, default: 'cloudinary' })
  @IsOptional()
  @IsIn(productImageStorageProviders)
  storageProvider?: (typeof productImageStorageProviders)[number];

  @ApiPropertyOptional({ enum: imageContentTypes, example: 'image/webp' })
  @IsOptional()
  @IsIn(imageContentTypes)
  contentType?: (typeof imageContentTypes)[number];

  @ApiPropertyOptional({ example: 'Golden fresh meat pie on a tray' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  alt?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateProductImageDto {
  @ApiPropertyOptional({ example: 'Golden fresh meat pie on a tray' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  alt?: string | null;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
