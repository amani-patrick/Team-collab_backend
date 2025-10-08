import { Controller, Get, Post, Body, Patch, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

import { CurrentUser } from '../common/decorators/current-user.decorator'; 
import type { AuthUser } from '../common/decorators/current-user.decorator'; 


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}


  /*
  * Managers and Owners are only allowed to create tasks
  */
  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  async create(
    @Body() createTaskDto: CreateTaskDto, 
    @CurrentUser() user: AuthUser 
  ) {
    const { organizationId } = user;
    return this.tasksService.create(createTaskDto, organizationId);
  }


  /*
  * Everyone can view tasks within a project they have access to.
  */
  @Get('by-project/:projectId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
  async findAllByProject(
    @Param('projectId') projectId: string, 
    @CurrentUser() user: AuthUser 
  ) {
    const { organizationId } = user;
    return this.tasksService.findAllByProject(projectId, organizationId);
  }

  /*
  * Employees can update the status (e.g., mark as DONE). 
  * Managers/Owners can update any field.
  */
  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
  async update(
    @Param('id') id: string, 
    @Body() updateTaskDto: UpdateTaskDto, 
    @CurrentUser() user: AuthUser
  ) {
    const { organizationId, role } = user;
    
    if (role === UserRole.EMPLOYEE) {
      const allowedKeys = ['status'];
      const updateKeys = Object.keys(updateTaskDto);
      
      if (updateKeys.some(key => !allowedKeys.includes(key))) {
          throw new BadRequestException('Employees can only update the task status.');
      }
    }
    return this.tasksService.update(id, updateTaskDto, organizationId);
  }
}