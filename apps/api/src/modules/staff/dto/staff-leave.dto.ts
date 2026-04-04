import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { IsUuidString } from '../../../common/validators/is-uuid-string.decorator';

const TYPES = ['annual', 'sick', 'unpaid', 'other'] as const;
const STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled'] as const;

export class CreateStaffLeaveDto {
  @IsUuidString()
  userId!: string;

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
