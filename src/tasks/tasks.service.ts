import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { Repository } from 'typeorm';
import { Task } from '../entity/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ProjectsService } from '../projects/projects.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
        @Inject(forwardRef(() => ProjectsService))
        private projectsService: ProjectsService,
        private usersService: UsersService,
        private notificationsGateway: NotificationsGateway,
    ) {}

    async create(dto: CreateTaskDto, organizationId: string): Promise<Task> {
        const project = await this.projectsService.findOne(dto.projectId, organizationId);
        if (!project) {
            throw new BadRequestException('Project not found or does not belong to your organization.');
        }
        const newTask = this.tasksRepository.create({
            ...dto,
        });
        
        const savedTask = await this.tasksRepository.save(newTask);
        
        this.notificationsGateway.sendToOrganization(
            organizationId, 
            'newTask', 
            { taskId: savedTask.id, title: savedTask.title }
        );
        
        return savedTask;
    }

    async findAllByProject(projectId: string, organizationId: string): Promise<Task[]> {
        const project = await this.projectsService.findOne(projectId, organizationId);
        if (!project) {
            throw new NotFoundException('Project not found.');
        }
        return this.tasksRepository.find({
            where: { projectId },
            relations: ['assignee'],
        });
    }

    async update(id: string, dto: UpdateTaskDto, organizationId: string): Promise<Task> {
        const task = await this.tasksRepository.findOne({
            where: { id },
            relations: ['project'],
        });

        if (!task || task.project.organizationId !== organizationId) {
            throw new NotFoundException(`Task with ID "${id}" not found in your organization.`);
        }

        if (dto.assigneeId) {
            const assignee = await this.usersService.findOneByIdAndOrg(dto.assigneeId, organizationId);
            if (!assignee) {
                throw new BadRequestException(`Assignee with ID "${dto.assigneeId}" not found in your organization.`);
            }
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

    async findOne(id: string, organizationId: string): Promise<Task> {
        const task = await this.tasksRepository.findOne({
            where: { id },
            relations: ['project']
        });

        if (!task || task.project.organizationId !== organizationId) {
            throw new NotFoundException(`Task with ID "${id}" not found in your organization.`);
        }

        return task;
    }
}