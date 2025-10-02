import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeTrackingService } from './time-tracking.service';
import { TimeTrackingController } from './time-tracking.controller';
import { TimeEntry } from '../entity/time-entry.entity';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [TypeOrmModule.forFeature([TimeEntry]), TasksModule],
  providers: [TimeTrackingService],
  controllers: [TimeTrackingController],
  exports: [TimeTrackingService],
})
export class TimeTrackingModule {}
