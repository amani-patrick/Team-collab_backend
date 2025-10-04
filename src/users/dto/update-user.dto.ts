import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsEmail, IsPhoneNumber, ValidateIf } from 'class-validator';



class BaseUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @ValidateIf(o => o.phoneNumber !== undefined)
  @IsPhoneNumber(
    undefined,
    {
      message: 'The phone number must be a valid international number, including the country code (e.g., +15551234567).',
    }
  )
  phoneNumber?: string;
  
  @IsOptional()
  @IsString()
  // Optional: Allow updating password 
  password?: string;
}

// PartialType makes all fields optional for updating
export class UpdateUserDto extends PartialType(BaseUserDto) {}