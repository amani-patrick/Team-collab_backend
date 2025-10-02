import { Organization } from './../entity/organization.entity';
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Request } from 'express'; // Used for type hinting the request object


@UseGuards(JwtAuthGuard,RolesGuard)
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectService: ProjectsService){   }
    //Manager and owner are able to create projects
    @Post()
    @Roles(UserRole.OWNER,UserRole.MANAGER)
    create(@Body() createProjectDto: CreateProjectDto @Req() req: Request){
        const { organizationId,userId} = req.user as any;
        return this.projectService.create(createProjectDto,organizationId,userId);
    }

    //Everyone in organization can  view projects
    @Get()
    @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
    findAll(@Req() req: Request){
        const { organizationId}=req.user as any;
        return this.projectService.findAll(organizationId);
    }

    //Allow managers and owners can update projects
    @Patch(':id')
    @Roles(UserRole.OWNER,UserRole.MANAGER)
    update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto ,@Req() req: Request){
        const { organizationId}= req.user as any;
        return this.projectService.update(id,updateProjectDto,organizationId);
    }

}
