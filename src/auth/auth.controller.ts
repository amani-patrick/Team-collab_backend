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

  // --- 1. REGISTRATION (Creating the Owner/Organization) ---
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // --- 2. LOGIN (Local Authentication) ---
  /**
   * Protected by LocalAuthGuard, which calls LocalStrategy to validate credentials.
   */
  @UseGuards(LocalAuthGuard) 
  @Post('login')
  // NOTE: login is not async in the controller, as the service call is not awaited here.
  login(@Body() loginDto: LoginDto, @CurrentUser() user: AuthUser) { 
    return this.authService.login(user);
  }

  // --- 3. INVITE ACCEPTANCE (Public Endpoint) ---
  /**
   * Public endpoint that allows an invited user to set their password using a token.
   * This endpoint must remain public (no guards).
   */
  @Post('accept-invite')
  async acceptInvite(@Body() acceptInviteDto: AcceptInviteDto) {
    // FIX: The service method must be awaited since it performs database operations.
    return this.authService.acceptInvite(acceptInviteDto);
  }
}