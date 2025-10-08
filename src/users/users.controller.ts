import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator'; 
import type { AuthUser } from '../common/decorators/current-user.decorator'; 


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me - Get the current authenticated user's profile
   * @param user - The current authenticated user
   * @returns The current authenticated user's profile
   */
  @Get('me')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
  async getMe(@CurrentUser() user: AuthUser) {
    return this.usersService.findOneById(user.id); 
  }

  /**
   * PATCH /users/me - Update the current authenticated user's profile
   * @param updateUserDto - The updated user profile data
   * @param user - The current authenticated user
   * @returns The updated user profile
   */
  @Patch('me')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
  updateMe(
    @Body() updateUserDto: UpdateUserDto, 
    @CurrentUser() user: AuthUser 
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  /**
   * GET /users - Get all users in the organization
   * Restricted access: only Owners and Managers can view the full team list
   * @param user - The current authenticated user
   * @returns The list of users in the organization
   */
  @Get()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  findAll(@CurrentUser() user: AuthUser) {
    return this.usersService.findAllInOrganization(user.organizationId);
  }
}