import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPassword#23', minLength: 8 })
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @ApiProperty({
    example: 'NewPassword#24',
    description: 'At least 8 characters with uppercase, lowercase, and a number.'
  })
  @IsString()
  @Matches(passwordPattern, {
    message: 'Password must contain uppercase, lowercase, and a number.'
  })
  newPassword!: string;
}
