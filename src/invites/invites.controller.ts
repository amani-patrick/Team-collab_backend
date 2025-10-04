// src/invites/invites.controller.ts

import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';

// --- Guards and Decorators for Security ---
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; // Now imported
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

// --- Type Imports ---
import type { AuthUser } from '../common/decorators/current-user.decorator'; // Use import type
import { UserRole } from '../common/enums/user-role.enum';

// --- Global Guards for Private Endpoints ---
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invites')
export class InvitesController {
  constructor(
    // Removed: private readonly authService: AuthService
    private readonly invitesService: InvitesService,
  ) {}

  // POST /invites
  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  async create(
    @Body() createInviteDto: CreateInviteDto, 
    @CurrentUser() user: AuthUser, 
  ) {
    // Multi-Tenancy Key: organizationId is retrieved securely from the token payload.
    const { organizationId, id: userId } = user; 

    return this.invitesService.createInvite(
      createInviteDto,
      organizationId,
      userId,
    );
  }

}