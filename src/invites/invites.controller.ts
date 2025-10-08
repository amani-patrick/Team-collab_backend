import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';

import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import type { AuthUser } from '../common/decorators/current-user.decorator'; 
import { UserRole } from '../common/enums/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invites')
export class InvitesController {
  constructor(
    private readonly invitesService: InvitesService,
  ) {}

  @Get()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  findAll(@CurrentUser() user: AuthUser) {
    return this.invitesService.findAllInOrganization(user.organizationId);
  }

  /**
   * POST /invites - Create a new invite
   * @param createInviteDto - The invite data
   * @param user - The current authenticated user
   * @returns The created invite
   */
  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  async create(
    @Body() createInviteDto: CreateInviteDto, 
    @CurrentUser() user: AuthUser, 
  ) {
    const { organizationId, id: userId } = user; 

    return this.invitesService.createInvite(
      createInviteDto,
      organizationId,
      userId,
    );
  }

}