import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export class CustomerSignupDto {
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

  @ApiProperty({ example: 'Password3' })
  @IsString()
  @Matches(passwordPattern, {
    message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number.'
  })
  password!: string;
}

export class CustomerLoginDto {
  @ApiProperty({ example: 'ada@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password3' })
  @IsString()
  @MinLength(8)
  password!: string;
}
