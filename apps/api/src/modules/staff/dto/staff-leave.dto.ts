import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

const TYPES = ['annual', 'sick', 'unpaid', 'other'] as const;
const STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled'] as const;

export class CreateStaffLeaveDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  branchId!: string;

  @IsDateString()
  fromDate!: string;

  @IsDateString()
  toDate!: string;

  @IsOptional()
  @IsEnum(TYPES)
  type?: string;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class UpdateStaffLeaveDto {
  @IsOptional()
  @IsEnum(STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
