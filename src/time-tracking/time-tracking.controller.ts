import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { StartTimerDto } from './dto/start-timer.dto';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.EMPLOYEE)
@Controller('time-tracking')
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  @Post('start')
  async startTimer(
    @Body() startDto: StartTimerDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.timeTrackingService.startTimer(startDto.taskId, user.id);
  }

  @Post('stop')
  async stopTimer(@CurrentUser() user: AuthUser) {
    return this.timeTrackingService.stopTimer(user.id);
  }

  @Post('manual')
  async logManual(
    @Body() entryDto: CreateTimeEntryDto,
    @CurrentUser() user: AuthUser,
  ) {
    const { id: userId, organizationId } = user;
    return this.timeTrackingService.logManualEntry(entryDto, userId, organizationId);
  }
}