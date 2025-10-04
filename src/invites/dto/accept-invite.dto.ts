import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AcceptInviteDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;
}

// src/auth/auth.service.ts (Add this new method)

// ... existing code ...

  
}

// src/auth/auth.controller.ts (Add this new endpoint)

// ... existing code ...

  // POST /auth/accept-invite
  // Public endpoint - No Guards needed
  @Post('accept-invite')
  async acceptInvite(@Body() acceptInviteDto: AcceptInviteDto) {
    return this.authService.acceptInvite(acceptInviteDto);
  }