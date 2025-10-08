import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeEntry } from '../entity/time-entry.entity';
import { ReportFilterDto } from './dto/report-filter.dto';
import { TimeEntryFilterDto } from './dto/time-entry-filter.dto';

interface HoursByProject {
  projectId: string;
  projectTitle: string;
  totalDurationSeconds: number;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(TimeEntry)
    private timeEntryRepository: Repository<TimeEntry>,
  ) {}

  async getHoursByProject(organizationId: string, filter: ReportFilterDto): Promise<HoursByProject[]> {
    let query = this.timeEntryRepository.createQueryBuilder('entry')
      .select('project.id', 'projectId')
      .addSelect('project.title', 'projectTitle')
      .addSelect('SUM(entry.durationInSeconds)', 'totalDurationSeconds')
      .innerJoin('entry.task', 'task')
      .innerJoin('task.project', 'project')
      .where('project.organizationId = :organizationId', { organizationId })
      .andWhere('entry.durationInSeconds IS NOT NULL');

    if (filter.startDate && filter.endDate) {
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

    query = query
      .groupBy('project.id')
      .addGroupBy('project.title')

    return query.getRawMany();
  }

  async getTimeEntries(organizationId: string, filter: TimeEntryFilterDto): Promise<TimeEntry[]> {
    const query = this.timeEntryRepository.createQueryBuilder('entry')
      .leftJoinAndSelect('entry.task', 'task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('entry.user', 'user')
      .where('project.organizationId = :organizationId', { organizationId })
      .select([
        'entry.id',
        'entry.startTime',
        'entry.endTime',
        'entry.durationInSeconds',
        'task.id',
        'task.title',
        'project.id',
        'project.title',
        'user.id',
        'user.name',
      ])
      .orderBy('entry.startTime', 'DESC');

    if (filter.startDate && filter.endDate) {
      query.andWhere('entry.startTime BETWEEN :start AND :end', {
        start: filter.startDate,
        end: filter.endDate,
      });
    }

    if (filter.projectId) {
      query.andWhere('project.id = :projectId', { projectId: filter.projectId });
    }

    if (filter.userId) {
      query.andWhere('entry.userId = :userId', { userId: filter.userId });
    }

    return query.getMany();
  }
}