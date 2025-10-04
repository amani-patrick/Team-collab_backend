import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

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

  // NOTE: phoneNumber, role (OWNER), and organizationId are set in the AuthService, not here.
}