import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    // 1a. Validate Task Scope: Ensure the task exists and belongs to the user's organization
    // We assume TasksService has a method to find a task by ID and validate its scope.
    const task = await this.tasksService.findOneByIdAndOrg(dto.taskId, organizationId);
    if (!task) {
        throw new BadRequestException('Task not found or does not belong to your organization.');
    }

    // 1b. Validate Duration: Prevent negative or extremely long entries (e.g., > 12 hours)
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

    // 2b. Start new timer entry (endTime and duration will be null/0 initially)
    const newEntry = this.timeEntryRepository.create({
      taskId,
      userId,
      startTime: new Date(),
      durationInSeconds: 0, 
      isManualEntry: false,
      // NOTE: We rely on the Frontend to calculate duration and send the final entry, 
      // but we start the DB record here for persistence/tracking.
    });

    // In a real system, you might only save the "START" event to Redis 
    // and only persist the full entry on "STOP". But saving here simplifies reporting.
    return this.timeEntryRepository.save(newEntry);
  }
  
  // Find an active timer entry (where endTime is NULL/empty)
  async findActiveTimer(userId: string): Promise<TimeEntry | null> {
    return this.timeEntryRepository.findOne({
      where: { userId, endTime: null },
      order: { startTime: 'DESC' },
    });
  }

  // --- 3. STOP Timer Logic (Persisting the final entry) ---
  async stopTimer(userId: string, entryData: CreateTimeEntryDto): Promise<TimeEntry> {
    // In a production app, you would retrieve the initial "active" timer entry,
    // calculate the duration based on `startTime` and the current time,
    // and then update that existing record.
    
    // For simplicity, we'll proceed assuming the frontend calculates and sends the final entry.
    // If an active timer was running, we'd delete/mark it and save the new final record.
    
    // For now, treat 'stop' as a full 'saveEntry' with a check for active timers.
    const activeTimer = await this.findActiveTimer(userId);
    if (activeTimer) {
        await this.timeEntryRepository.delete(activeTimer.id); // Delete the initial 'start' placeholder
    }

    // Save the final, calculated entry
    return this.saveEntry(entryData, userId, 'N/A' /* organizationId validation needed here */);
  }

  // --- 4. Manual Log Entry ---
  async logManualEntry(dto: CreateTimeEntryDto, userId: string, organizationId: string): Promise<TimeEntry> {
    dto.isManualEntry = true;
    return this.saveEntry(dto, userId, organizationId);
  }
}