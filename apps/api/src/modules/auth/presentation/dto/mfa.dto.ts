import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class VerifyAdminMfaDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 12)
  code!: string;
}
