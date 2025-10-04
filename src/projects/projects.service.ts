
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entity/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectrepository:  Repository<Project>,
    ){}
    async create(dto: CreateProjectDto, organizationId: string, createdByUserId: string): Promise<Project> {
    const newProject = this.projectsRepository.create({
      ...dto,
      organizationId,     
      createdByUserId,
    });
    return this.projectsRepository.save(newProject);


}
    async findAll(organizationId: string): Promise<Project[]> {
        // ALWAYS include the organizationId in the WHERE clause
        return this.projectsRepository.find({
        where: { organizationId },
        });
  }
   async update(id: string, dto: UpdateProjectDto, organizationId: string): Promise<Project> {
   
    const project = await this.projectsRepository.findOne({
      where: { id, organizationId },
    });
    if (!project) {
     
      throw new NotFoundException(`Project with ID "${id}" not found in your organization.`);
    }
    this.projectsRepository.merge(project, dto);
}
async findOne(id: string, organizationId: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id, organizationId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found in your organization.`);
    }
    return project;
  }
  async  delete(id: string, organizationId: string): Promise<void> {
    const project = await this.projectsRepository.findOne({
      where: { id, organizationId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found in your organization.`);
    }
    await this.projectsRepository.remove(project);
  }
  async findOneByIdAndOrg(id: string, organizationId: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id, organizationId } }); 
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found in your organization.`);
    }
    return project;
  }
}

