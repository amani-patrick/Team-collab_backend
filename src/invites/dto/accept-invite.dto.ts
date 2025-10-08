import { IsString, IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';

export class AcceptInviteDto {

  @IsString()
  @IsNotEmpty()
  token: string;


  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8) 
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}