import { IsOptional, IsUUID, IsEnum, IsDateString, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class LabVendorQueryDto {
  @IsOptional()
  @IsString()
  isActive?: string; // 'true' | 'false'

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  specialization?: string;
}

export class LabOrderQueryDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string; // order# or patient name
}
