import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';

class BaseUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string; // Note: Changing email often requires re-verification

  @IsOptional()
  @IsPhoneNumber('ZZ') // 'ZZ' is a placeholder for global number validation
  phoneNumber?: string;
  
  @IsOptional()
  @IsString()
  // Optional: Allow updating password (will require current password validation in service)
  password?: string;
}

// PartialType makes all fields optional for updating
export class UpdateUserDto extends PartialType(BaseUserDto) {}