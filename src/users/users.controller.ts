import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Request } from 'express';

// Secure all routes in this controller
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/me - Get the current authenticated user's profile
  @Get('me')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
  async getMe(@Req() req: Request) {
    const { userId } = req.user as any;
    // The service handles finding and hydrating the user data
    return this.usersService.findOneById(userId); 
  }

  // PATCH /users/me - Update the current authenticated user's profile
  @Patch('me')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
  updateMe(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    const { userId } = req.user as any;
    // Update the user identified by the JWT
    return this.usersService.update(userId, updateUserDto);
  }

  // GET /users - Get all users in the organization
  // Restricted access: only Owners and Managers can view the full team list
  @Get()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  findAll(@Req() req: Request) {
    const { organizationId } = req.user as any;
    // CRITICAL: Scoping the query to the user's organization
    return this.usersService.findAllInOrganization(organizationId);
  }
}