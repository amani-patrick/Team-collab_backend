
import { IsOptional, IsDateString, IsUUID } from 'class-validator';
/**
 * Common filters for all reports, scoped by organization implicitly.
 */
export class ReportFilterDto {
  @IsOptional()
  @IsDateString()
  startDate?: string; 

  @IsOptional()
  @IsDateString()
  endDate?: string; 

  @IsOptional()
  @IsUUID()
  projectId?: string; 

  @IsOptional()
  @IsUUID()
  userId?: string; 
}