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

    // --- 1. Core Create/Save Entry (Used by Stop and Manual Log) ---
    private async saveEntry(dto: CreateTimeEntryDto, userId: string, organizationId: string): Promise<TimeEntry> {
        // 1a. Validate Task Scope - This assumes TasksService.findOne() now exists.
        const task = await this.tasksService.findOne(dto.taskId, organizationId);
        
        // This 'if (!task)' check is often redundant if tasksService.findOne throws NotFoundException,
        // but it remains for explicit clarity if the Task entity is returned.
        if (!task) { 
            throw new BadRequestException('Task not found or does not belong to your organization.');
        }

        // 1b. Validate Duration
        if (dto.durationInSeconds <= 0 || dto.durationInSeconds > (12 * 3600)) {
            throw new BadRequestException('Invalid duration.');
        }

        // 1c. Create the entry
        const newEntry = this.timeEntryRepository.create({
            ...dto,
            userId,
        });
        return this.timeEntryRepository.save(newEntry);
    }

    // --- 2. START Timer Logic ---
    async startTimer(taskId: string, userId: string): Promise<TimeEntry> {
        // 2a. Check for existing active timer by the same user
        const activeTimer = await this.findActiveTimer(userId);
        if (activeTimer) {
            throw new ConflictException(`User already has an active timer on task ${activeTimer.taskId}. Must stop first.`);
        }
        
        // 2b. Start new timer entry
        const newEntry = this.timeEntryRepository.create({
            taskId,
            userId,
            startTime: new Date(),
            durationInSeconds: 0,
            isManualEntry: false,
        });

        return this.timeEntryRepository.save(newEntry);
    }
    
    // Find an active timer entry (where endTime is NULL/empty)
    async findActiveTimer(userId: string): Promise<TimeEntry | null> {
        return this.timeEntryRepository.findOne({
            where: { 
                userId, 
                endTime: IsNull(),
            },
            order: { startTime: 'DESC' },
        });
    }

    // --- 3. STOP Timer Logic (Persisting the final entry) ---
    async stopTimer(userId: string, entryData: CreateTimeEntryDto): Promise<TimeEntry> {
        const activeTimer = await this.findActiveTimer(userId);
        if (activeTimer) {
            // Delete the initial 'start' placeholder
            await this.timeEntryRepository.delete(activeTimer.id); 
        }

        // WARNING: organizationId must be passed from the controller or resolved here
        const organizationId = 'TODO_FETCH_ORG_ID'; 
        
        // Save the final, calculated entry
        return this.saveEntry(entryData, userId, organizationId);
    }

    // --- 4. Manual Log Entry ---
    async logManualEntry(dto: CreateTimeEntryDto, userId: string, organizationId: string): Promise<TimeEntry> {
        dto.isManualEntry = true;
        return this.saveEntry(dto, userId, organizationId);
    }
}