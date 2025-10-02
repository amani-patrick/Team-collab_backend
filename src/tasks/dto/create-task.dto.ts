/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, IsUUID,IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsUUID()
  // Ensure the task is linked to a valid project
  projectId: string;

  @IsOptional()
  @IsUUID()
  // UUID of the User who is assigned this task
  assigneeId?: string; 

  @IsOptional()
  @IsDateString()
  deadline?: Date;
}
