import { IsNotEmpty, IsString, IsUUID,IsDateString,IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string; 

  @IsOptional()
  @IsDateString()
  deadline?: Date;
}
