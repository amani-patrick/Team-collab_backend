/* eslint-disable prettier/prettier */
import { IsOptional, IsDateString, IsUUID } from 'class-validator';
/**
 * Common filters for all reports, scoped by organization implicitly.
 */
export class ReportFilterDto {
  @IsOptional()
  @IsDateString()
  startDate?: string; // e.g., '2024-01-01'

  @IsOptional()
  @IsDateString()
  endDate?: string; // e.g., '2024-01-31'

  @IsOptional()
  @IsUUID()
  projectId?: string; // Filter by a specific project

  @IsOptional()
  @IsUUID()
  userId?: string; // Filter by a specific user (employee)
}