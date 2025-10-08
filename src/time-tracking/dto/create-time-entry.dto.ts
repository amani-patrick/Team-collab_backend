import { IsNotEmpty, IsUUID, IsNumber, IsDateString, IsOptional, IsBoolean } from 'class-validator';

/**
 * Used for logging time (either manual or stopping a timer).
 */
export class CreateTimeEntryDto {
  @IsNotEmpty()
  @IsUUID()
  taskId: string;

  @IsNotEmpty()
  @IsDateString()
  
  startTime: Date;

  @IsOptional()
  @IsDateString()
  endTime?: Date; 

  @IsNotEmpty()
  @IsNumber()
  durationInSeconds: number;

  @IsOptional()
  @IsBoolean()
  isManualEntry?: boolean = false;
}