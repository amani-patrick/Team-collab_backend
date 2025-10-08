import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsEmail, IsPhoneNumber, ValidateIf } from 'class-validator';



class BaseUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

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
  password?: string;
}

export class UpdateUserDto extends PartialType(BaseUserDto) {}