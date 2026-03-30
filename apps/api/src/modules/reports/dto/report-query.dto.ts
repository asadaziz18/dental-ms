import { IsOptional, IsUUID, IsIn, IsDateString } from 'class-validator';

export class ReportQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsUUID()
  doctorId?: string;

  /** For revenue trend: day | week | month */
  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  groupBy?: 'day' | 'week' | 'month';

  /** For dashboard: specific date (default today) */
  @IsOptional()
  @IsDateString()
  date?: string;
}
