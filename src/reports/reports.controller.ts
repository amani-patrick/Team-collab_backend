import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { TimeEntryFilterDto } from './dto/time-entry-filter.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('time-entries')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  async getTimeEntries(
    @CurrentUser() user: AuthUser,
    @Query() filterDto: TimeEntryFilterDto,
  ) {
    const { organizationId } = user;
    return this.reportsService.getTimeEntries(organizationId, filterDto);
  }
}
