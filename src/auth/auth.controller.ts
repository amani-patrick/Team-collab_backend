import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';

// Guards and Decorators
import { LocalAuthGuard } from '../common/guards/local-auth.guard'; 
import { CurrentUser } from '../common/decorators/current-user.decorator'; 
import type { AuthUser } from '../common/decorators/current-user.decorator'; 


@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {} 

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Protected by LocalAuthGuard, which calls LocalStrategy to validate credentials.
   */
  @UseGuards(LocalAuthGuard) 
  @Post('login')
  login(@Body() loginDto: LoginDto, @CurrentUser() user: AuthUser) { 
    return this.authService.login(user);
  }


  /**
   * Public endpoint that allows an invited user to set their password using a token.
   * This endpoint must remain public (no guards).
   */
  @Post('accept-invite')
  async acceptInvite(@Body() acceptInviteDto: AcceptInviteDto) {
    return this.authService.acceptInvite(acceptInviteDto);
  }
}