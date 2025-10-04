import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TimeEntry } from '../entity/time-entry.entity';
import { ReportFilterDto } from './dto/report-filter.dto';

// Define the expected shape of the aggregated report result
interface HoursByProject {
  projectId: string;
  projectTitle: string;
  totalDurationSeconds: number;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(TimeEntry) // We need TimeEntry data
    private timeEntryRepository: Repository<TimeEntry>,
  ) {}

  /**
   * Generates a report of total hours worked, grouped by project, for the organization.
   * @param organizationId The multi-tenancy key.
   * @param filter The date/project/user filters.
   */
  async getHoursByProject(organizationId: string, filter: ReportFilterDto): Promise<HoursByProject[]> {
    
    // Start with the TypeORM Query Builder
    let query = this.timeEntryRepository.createQueryBuilder('entry')
      .select('project.id', 'projectId')
      .addSelect('project.title', 'projectTitle')
      .addSelect('SUM(entry.durationInSeconds)', 'totalDurationSeconds')
      .innerJoin('entry.task', 'task')
      .innerJoin('task.project', 'project')
      // CRITICAL: Scope by OrganizationId, linking through the Project entity
      .where('project.organizationId = :organizationId', { organizationId })
      .andWhere('entry.durationInSeconds IS NOT NULL'); // Ignore active timers

    // Apply Filters
    if (filter.startDate && filter.endDate) {
      // Filter entries by startTime within the given range
      query = query.andWhere('entry.startTime BETWEEN :start AND :end', { 
        start: filter.startDate, 
        end: filter.endDate 
      });
    }

    if (filter.projectId) {
      query = query.andWhere('project.id = :projectId', { projectId: filter.projectId });
    }
    
    if (filter.userId) {
      query = query.andWhere('entry.userId = :userId', { userId: filter.userId });
    }

    // Group and Order
    query = query
      .groupBy('project.id')
      .addGroupBy('project.title')
      .orderBy('totalDurationSeconds', 'DESC');

    // Execute the raw query and return
    return query.getRawMany() as Promise<HoursByProject[]>;
  }
}