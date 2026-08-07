import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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

  @ApiProperty({ example: 'WELCOME10', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  couponCode?: string;
}
