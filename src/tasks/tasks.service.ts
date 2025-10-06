import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entity/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ProjectsService } from '../projects/projects.service'; 

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
        const project = await this.projectsService.findOne(dto.projectId, organizationId);
        if (!project) {
            throw new BadRequestException('Project not found or does not belong to your organization.');
        }
        const newTask = this.tasksRepository.create({
            ...dto,
        });
        
        const savedTask = await this.tasksRepository.save(newTask);
        
        // Notify on new task creation
        this.notificationsGateway.sendToOrganization(
            organizationId, 
            'newTask', 
            { taskId: savedTask.id, title: savedTask.title }
        );
        
        return savedTask;
    }

    // 2. Find All Tasks for a Project 
    async findAllByProject(projectId: string, organizationId: string): Promise<Task[]> {
        const project = await this.projectsService.findOne(projectId, organizationId);
        if (!project) {
            throw new NotFoundException('Project not found.');
        }
        // 2. Find all tasks linked to that project
        return this.tasksRepository.find({
            where: { projectId },
            relations: ['assignee'],
        });
    }

    // 3. Update Task (Scoped)
    async update(id: string, dto: UpdateTaskDto, organizationId: string): Promise<Task> {
        const task = await this.tasksRepository.findOne({
            where: { id },
            relations: ['project'],
        });

        if (!task) {
            throw new NotFoundException(`Task with ID "${id}" not found.`);
        }
        if (task.project.organizationId !== organizationId) {
            throw new NotFoundException(`Task with ID "${id}" not found in your organization.`);
        }
        this.tasksRepository.merge(task, dto);
        const updatedTask = await this.tasksRepository.save(task);

        this.notificationsGateway.sendToOrganization(
            organizationId,
            'taskUpdated',
            {
                taskId: updatedTask.id,
                status: updatedTask.status,
                title: updatedTask.title,
            }
        );
        
        return updatedTask;
    }

    // 4. Find Single Task (Scoped) - ADDED THIS METHOD TO FIX THE DEPENDENCY ISSUE
    /**
     * Finds a single task, scoped by the task ID and the organization ID.
     * This method is used by other services (like TimeTrackingService) for validation.
     * Throws NotFoundException if the task does not exist or fails the scope check.
     */
    async findOne(id: string, organizationId: string): Promise<Task> {
        const task = await this.tasksRepository.findOne({
            where: { id },
            // We need the project relation to check the organizationId scope, 
            // as the Task's organization ID is inherited from its Project.
            relations: ['project']
        });

        // Check if task exists AND if its associated project belongs to the organization
        if (!task || task.project.organizationId !== organizationId) {
            throw new NotFoundException(`Task with ID "${id}" not found in your organization.`);
        }

        return task;
    }
}