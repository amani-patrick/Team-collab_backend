/* eslint-disable prettier/prettier */
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
  // The timestamp when the work started
  startTime: Date;

  @IsOptional()
  @IsDateString()
  // The timestamp when the work stopped
  endTime?: Date; 

  @IsNotEmpty()
  @IsNumber()
  // The calculated duration in seconds. Should be validated server-side.
  durationInSeconds: number;

  @IsOptional()
  @IsBoolean()
  // Flag to indicate a manual entry, typically requiring manager approval
  isManualEntry?: boolean = false;
}