import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entity/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>, 
    ) { }

    // CREATE
    async create(dto: CreateProjectDto, organizationId: string, createdByUserId: string): Promise<Project> {
        const newProject = this.projectsRepository.create({
            ...dto,
            organizationId,
            createdByUserId,
        });
        return this.projectsRepository.save(newProject);
    }

    // FIND ALL (Matches controller call: this.projectService.findAll(organizationId))
    async findAll(organizationId: string): Promise<Project[]> {
        return this.projectsRepository.find({
            where: { organizationId },
        });
    }

    // FIND ONE (Used by the controller for specific details)
    async findOne(id: string, organizationId: string): Promise<Project> {
        const project = await this.projectsRepository.findOne({
            where: { id, organizationId },
        });
        if (!project) {
            throw new NotFoundException(`Project with ID "${id}" not found in your organization.`);
        }
        return project;
    }

    // UPDATE
    async update(id: string, dto: UpdateProjectDto, organizationId: string): Promise<Project> {
        const project = await this.projectsRepository.findOne({
            where: { id, organizationId },
        });
        if (!project) {
            throw new NotFoundException(`Project with ID "${id}" not found in your organization.`);
        }
        this.projectsRepository.merge(project, dto);

        return this.projectsRepository.save(project);
    }

    async remove(id: string, organizationId: string): Promise<void> {
        const result = await this.projectsRepository.delete({ id, organizationId });

        if (result.affected === 0) {
            throw new NotFoundException(`Project with ID "${id}" not found in your organization.`);
        }
    }

}