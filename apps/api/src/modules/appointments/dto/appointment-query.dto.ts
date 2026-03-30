import { IsOptional, IsDateString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class AppointmentQueryDto {
  @IsOptional()
  @IsUUID('all')
  branchId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsUUID('all')
  doctorId?: string;

  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;
}
