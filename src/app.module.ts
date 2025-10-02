/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { TimeTrackingModule } from './time-tracking/time-tracking.module';

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
    TimeTrackingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
