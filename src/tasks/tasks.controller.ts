/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Request } from 'express';

// Apply guards at the controller level
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}


  // Managers and Owners can create and assign new tasks.
  @Post()
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: Request) {
    const { organizationId } = req.user as any;
    return this.tasksService.create(createTaskDto, organizationId);
  }


  // Everyone can view tasks within a project they have access to.
  @Get('by-project/:projectId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
  findAllByProject(@Param('projectId') projectId: string, @Req() req: Request) {
    const { organizationId } = req.user as any;
    return this.tasksService.findAllByProject(projectId, organizationId);
  }

  // Employees can update the status (e.g., mark as DONE). 
  // Managers/Owners can update any field.
  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() req: Request) {
    const { organizationId, role, userId } = req.user as any;
    
    // Authorization Check:
    // If the user is an EMPLOYEE, they should ONLY be allowed to update status.
    if (role === UserRole.EMPLOYEE) {
        // Simple check: Ensure only 'status' is being updated.
        // In a complex app, you'd use a separate DTO for employee status updates.
        const allowedKeys = ['status'];
        const updateKeys = Object.keys(updateTaskDto);
        if (updateKeys.some(key => !allowedKeys.includes(key))) {
            throw new BadRequestException('Employees can only update the task status.');
        }
    }

    return this.tasksService.update(id, updateTaskDto, organizationId);
  }
}