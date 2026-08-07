import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';
import { PaymentProvider } from '@prisma/client';

export class CustomerVerificationDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(7)
  phone!: string;
}

export class InitiatePaymentDto extends CustomerVerificationDto {
  @ApiProperty()
  @IsUUID()
  orderId!: string;

  @ApiProperty({ enum: PaymentProvider })
  @IsEnum(PaymentProvider)
  provider!: PaymentProvider;
}

export class CreateReceiptUploadDto extends CustomerVerificationDto {
  @ApiProperty()
  @IsUUID()
  orderId!: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsIn(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'])
  contentType!: string;

  @ApiPropertyOptional({ example: 1048576, maximum: 10485760 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024)
  sizeBytes?: number;
}

export class SubmitManualProofDto extends CustomerVerificationDto {
  @ApiProperty()
  @IsUUID()
  orderId!: string;

  @ApiProperty()
  @IsUUID()
  manualPaymentMethodId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(2048)
  receiptUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  objectKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storageProvider?: string;

  @ApiProperty()
  @IsIn(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'])
  contentType!: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class PaymentStatusLookupDto extends CustomerVerificationDto {
  @ApiProperty()
  @IsUUID()
  orderId!: string;
}
