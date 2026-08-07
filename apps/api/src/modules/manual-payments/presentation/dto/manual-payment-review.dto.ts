import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RejectManualProofDto {
  @ApiProperty({ example: 'Receipt amount does not match the order total.' })
  @IsString()
  @MinLength(2)
  reason!: string;
}
