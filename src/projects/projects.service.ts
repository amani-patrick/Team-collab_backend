import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Project } from '../entity/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>,
        @Inject(forwardRef(() => TasksService))
        private tasksService: TasksService,
        private dataSource: DataSource,
    ) { }

    // CREATE
    async create(dto: CreateProjectDto, organizationId: string, createdByUserId: string): Promise<Project> {
        const { tasks, ...projectData } = dto;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const newProject = this.projectsRepository.create({
                ...projectData,
                organizationId,
                createdBy: { id: createdByUserId },
            });

            const savedProject = await queryRunner.manager.save(newProject);

            if (tasks && tasks.length > 0) {
                for (const taskDto of tasks) {
                    await this.tasksService.create(
                        { ...taskDto, projectId: savedProject.id },
                        organizationId,
                    );
                }
            }

            await queryRunner.commitTransaction();
            
            // Re-fetch the created project with its relations to return a complete object
            return this.findOne(savedProject.id, organizationId);

        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    // FIND ALL
    async findAll(organizationId: string): Promise<Project[]> {
        return this.projectsRepository.find({
            where: { organizationId },
            relations: ['createdBy'],
            select: {
                createdBy: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        });
    }

    // FIND ONE
    async findOne(id: string, organizationId: string): Promise<Project> {
        const project = await this.projectsRepository.findOne({
            where: { id, organizationId },
            relations: ['createdBy'],
            select: {
                createdBy: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        });
        if (!project) {
            throw new NotFoundException(`Project with ID "${id}" not found in your organization.`);
        }
        return project;
    }

    // UPDATE
    async update(id: string, dto: UpdateProjectDto, organizationId: string): Promise<Project> {
        const project = await this.findOne(id, organizationId);

        this.projectsRepository.merge(project, dto);

        return this.projectsRepository.save(project);
    }

    // REMOVE
    async remove(id: string, organizationId: string): Promise<void> {
        const result = await this.projectsRepository.delete({ id, organizationId });

        if (result.affected === 0) {
            throw new NotFoundException(`Project with ID "${id}" not found in your organization.`);
        }
    }

}