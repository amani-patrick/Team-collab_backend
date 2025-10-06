import { IsString, IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';

export class AcceptInviteDto {
  /**
   * The unique token provided in the invitation link/email. 
   * Used to find and validate the invitation record.
   */
  @IsString()
  @IsNotEmpty()
  token: string;

  /**
   * The new user's full name.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  fullName: string;

  /**
   * The password the user is setting for their new account.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(8) 
  password: string;

  /**
   * (Optional but recommended) The user's email, primarily for confirmation 
   * against the email stored in the invitation record.
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;
}