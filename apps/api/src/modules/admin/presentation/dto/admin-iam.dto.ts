import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MinLength
} from 'class-validator';

export class CreateAdminUserDto {
  @ApiProperty({ example: 'vendor@snacks.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Vendor Manager' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Password#23', minLength: 8 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  temporaryPassword?: string;
}

export class UpdateAdminUserDto {
  @ApiPropertyOptional({ example: 'Vendor Manager' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: '+15551234567' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateAdminRoleDto {
  @ApiProperty({ example: 'store-manager' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ type: [String], example: ['products:read', 'products:write'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissions!: string[];
}

export class AssignUserRoleDto {
  @ApiProperty()
  @IsUUID()
  roleId!: string;

  @ApiProperty()
  @IsUUID()
  tenantId!: string;

  @ApiPropertyOptional({ example: 'Covering weekend product updates.' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RejectApprovalDto {
  @ApiPropertyOptional({ example: 'Role is too broad for this user.' })
  @IsOptional()
  @IsString()
  reason?: string;
}
