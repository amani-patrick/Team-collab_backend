import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

import { CurrentUser } from '../common/decorators/current-user.decorator'; 
import type { AuthUser } from '../common/decorators/current-user.decorator'; 


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectService: ProjectsService) { }

    /*
    * Create project but owners and managers only are allowed
    */
    @Post()
    @Roles(UserRole.OWNER, UserRole.MANAGER)
    async create(
        @Body() createProjectDto: CreateProjectDto, 
        @CurrentUser() user: AuthUser,
    ) {
        const { organizationId, id: userId } = user;
        return this.projectService.create(createProjectDto, organizationId, userId);
    }



    /*
    * Get all projects in your organization  and everyone can view them 
    */
    @Get()
    @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
    async findAll(
        @CurrentUser() user: AuthUser,
    ) {
        const { organizationId } = user;
        return await this.projectService.findAll(organizationId); 
    }

    /*
    * Update project but owners and managers only are allowed
    */
    @Patch(':id')
    @Roles(UserRole.OWNER, UserRole.MANAGER)
    async update(
        @Param('id') id: string, 
        @Body() updateProjectDto: UpdateProjectDto, 
        @CurrentUser() user: AuthUser,
    ) {
        const { organizationId } = user;
        return this.projectService.update(id, updateProjectDto, organizationId);
    }

    /*
    * Only Manager and Owner can delete projects
    */
    @Delete(':id')
    @Roles(UserRole.OWNER, UserRole.MANAGER)
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: AuthUser,
    ) {
        const { organizationId } = user;
        return this.projectService.remove(id, organizationId);
    }

    @Get(':id')
    @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
    async findOne(
        @Param('id') id: string,
        @CurrentUser() user: AuthUser,
    ) {
        const { organizationId } = user;
        return this.projectService.findOne(id, organizationId);
    }
}