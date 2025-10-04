import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { StartTimerDto } from './dto/start-timer.dto';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Request } from 'express';

// Everyone can log time
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE) 
@Controller('time-tracking')
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  // POST /time-tracking/start
  @Post('start')
  startTimer(@Body() startDto: StartTimerDto, @Req() req: Request) {
    const { userId } = req.user as any;
    // We don't need organizationId here if the service validates the Task scope
    return this.timeTrackingService.startTimer(startDto.taskId, userId);
  }

  // POST /time-tracking/stop 
  @Post('stop')
  stopTimer(@Body() entryDto: CreateTimeEntryDto, @Req() req: Request) {
    const { userId } = req.user as any;
    // The service handles scope validation via the linked task
    return this.timeTrackingService.stopTimer(userId, entryDto);
  }


  // Manual time entry allows backdating and detailed logging
  @Post('manual')
  logManual(@Body() entryDto: CreateTimeEntryDto, @Req() req: Request) {
    const { userId, organizationId } = req.user as any;
    // Ensure manual entry flag is set and save
    return this.timeTrackingService.logManualEntry(entryDto, userId, organizationId);
  }
}