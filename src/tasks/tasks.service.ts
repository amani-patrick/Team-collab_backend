/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entity/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ProjectsService } from '../projects/projects.service'; // We need this for validation

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private projectsService: ProjectsService, 
    private notificationsGateway: NotificationsGateway,
  ) {}

  // 1. Create Task (with FK and Scope Validation)
  async create(dto: CreateTaskDto, organizationId: string): Promise<Task> {
    // CRITICAL: 1. Verify the projectId belongs to the user's organization
    // This method needs to be added to ProjectsService.
    const project = await this.projectsService.findOneByIdAndOrg(dto.projectId, organizationId);
    if (!project) {
        throw new BadRequestException('Project not found or does not belong to your organization.');
    }

    const newTask = this.tasksRepository.create({
      ...dto,
      // The task inherently inherits the organization scope from the project
    });
    return this.tasksRepository.save(newTask);
  }

  // 2. Find All Tasks for a Project (Scoped)
  async findAllByProject(projectId: string, organizationId: string): Promise<Task[]> {
    // CRITICAL: 1. Check project scope
    const project = await this.projectsService.findOneByIdAndOrg(projectId, organizationId);
    if (!project) {
        throw new NotFoundException('Project not found.');
    }

    // 2. Find all tasks linked to that project
    return this.tasksRepository.find({
      where: { projectId },
      relations: ['assignee'], // Optionally load the assignee's data
    });
  }

  // 3. Update Task (Scoped)
  async update(id: string, dto: UpdateTaskDto, organizationId: string): Promise<Task> {
    // 3a. Find the project associated with the task
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['project'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found.`);
    }

    // CRITICAL: 3b. Verify the task's project belongs to the user's organization
    if (task.project.organizationId !== organizationId) {
        throw new NotFoundException(`Task with ID "${id}" not found in your organization.`);
    }

    // 3c. Update and save
    this.tasksRepository.merge(task, dto);
    return this.tasksRepository.save(task);
  }
  async findOneByIdAndOrg(dto.taskId, organizationId);
    if (!task) {
        throw new NotFoundException(`Task with ID "${id}" not found in your organization.`);
    }
    // CRITICAL: 4. Broadcast the update event to the organization room
    this.notificationsGateway.sendToOrganization(
        organizationId, 
        'taskUpdated', 
        { 
            taskId: updatedTask.id, 
            status: updatedTask.status, 
            title: updatedTask.title,
            // Include minimal necessary data
        }
    );
    return udpatedTask;
