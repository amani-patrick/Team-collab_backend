import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TimeEntry } from '../entity/time-entry.entity'; // Use the TimeEntry entity
@Module({
  imports:[TypeOrmModule.forFeature([TimeEntry])],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
