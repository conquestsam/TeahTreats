import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CancelOrderDto {
  @ApiProperty({ example: 'Customer requested cancellation.' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class CompleteCustomerOrderDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(7)
  phone!: string;
}
