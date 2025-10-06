import { IsEmail, IsNotEmpty, IsString, MinLength, IsInt, Min, IsOptional } from 'class-validator';

/**
 * Data Transfer Object for the initial registration flow (creating the Owner and Organization).
 */
export class RegisterDto {
  // --- Organization Details ---

  @IsNotEmpty()
  @IsString()
  organizationName: string;

  // Optional: To collect industry during sign-up
  @IsString()
  @IsNotEmpty()
  industry: string;

  /**
   * FIX: Added teamSize field. It's mandatory by the database, 
   * but we should assume '1' (the owner) if not supplied.
   * If the service logic doesn't explicitly set it to 1,
   * we must make it mandatory here or set a default in the entity.
   */
  @IsOptional() // Making it optional here allows the service to provide the default
  @IsInt()
  @Min(1)
  teamSize?: number; 
  
  // --- User (Owner) Details ---

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;

}