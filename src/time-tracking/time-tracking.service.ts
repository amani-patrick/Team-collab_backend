import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TimeEntry } from '../entity/time-entry.entity';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class TimeTrackingService {
    constructor(
        @InjectRepository(TimeEntry)
        private timeEntryRepository: Repository<TimeEntry>,
        private tasksService: TasksService,
    ) {}

    private async saveEntry(dto: CreateTimeEntryDto, userId: string, organizationId: string): Promise<TimeEntry> {
        const task = await this.tasksService.findOne(dto.taskId, organizationId);
        if (!task) { 
            throw new BadRequestException('Task not found or does not belong to your organization.');
        }

        if (dto.durationInSeconds <= 0 || dto.durationInSeconds > (12 * 3600)) {
            throw new BadRequestException('Invalid duration.');
        }

        const newEntry = this.timeEntryRepository.create({
            ...dto,
            userId,
        });
        return this.timeEntryRepository.save(newEntry);
    }

    async startTimer(taskId: string, userId: string): Promise<TimeEntry> {
        const activeTimer = await this.findActiveTimer(userId);
        if (activeTimer) {
            throw new ConflictException(`User already has an active timer on task ${activeTimer.taskId}. Must stop first.`);
        }
        
        const newEntry = this.timeEntryRepository.create({
            taskId,
            userId,
            startTime: new Date(),
            durationInSeconds: 0,
            isManualEntry: false,
        });

        return this.timeEntryRepository.save(newEntry);
    }
    
    async findActiveTimer(userId: string): Promise<TimeEntry | null> {
        return this.timeEntryRepository.findOne({
            where: { 
                userId, 
                endTime: IsNull(),
            },
            order: { startTime: 'DESC' },
        });
    }

    async stopTimer(userId: string): Promise<TimeEntry> {
        const activeTimer = await this.findActiveTimer(userId);
        if (!activeTimer) {
            throw new NotFoundException('No active timer found to stop.');
        }

        const endTime = new Date();
        const durationInSeconds = Math.round((endTime.getTime() - activeTimer.startTime.getTime()) / 1000);

        activeTimer.endTime = endTime;
        activeTimer.durationInSeconds = durationInSeconds;

        return this.timeEntryRepository.save(activeTimer);
    }

    async logManualEntry(dto: CreateTimeEntryDto, userId: string, organizationId: string): Promise<TimeEntry> {
        dto.isManualEntry = true;
        return this.saveEntry(dto, userId, organizationId);
    }
}