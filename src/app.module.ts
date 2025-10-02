/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { TimeTrackingModule } from './time-tracking/time-tracking.module';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type:'postgres',
      host:'localhost',
      port:5433,
      username:'',
      password:'postgres',
      database:'team-collab',
      autoLoadEntities:true,
      synchronize:true // for development
    }),
    ProjectsModule,
    TasksModule,
    TimeTrackingModule,
    ReportsModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService, NotificationsGateway],
})
export class AppModule {}
