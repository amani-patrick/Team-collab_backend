import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AcceptInviteDto {
  /**
   * The unique, time-limited token received in the invitation link.
   * This is used to find the corresponding Invite record and link the user to the organization.
   */
  @IsNotEmpty()
  @IsString()
  token: string;

  /**
   * The user's full name, which will be saved in the User entity.
   */
  @IsNotEmpty()
  @IsString()
  fullName: string; 

  /**
   * The user's email address, which will be saved in the User entity.
   */
  @IsNotEmpty()
  @IsString()
  email: string;

  /**
   * The user's chosen password.
   * We enforce a minimum length for security.
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;
}