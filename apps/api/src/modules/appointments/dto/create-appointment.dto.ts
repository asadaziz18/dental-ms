import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsIn,
  MaxLength,
} from 'class-validator';
import { IsUuidString } from '../../../common/validators/is-uuid-string.decorator';

const TYPES = ['consultation', 'procedure', 'follow-up'] as const;
const STATUSES = ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No-Show'] as const;

export class CreateAppointmentDto {
  @IsUuidString()
  patientId!: string;

  @IsOptional()
  @IsUuidString()
  doctorId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  chair?: string | null;

  @IsDateString()
  start!: string;

  @IsDateString()
  end!: string;

  @IsIn(TYPES)
  type!: (typeof TYPES)[number];

  @IsOptional()
  @IsIn(STATUSES)
  status?: (typeof STATUSES)[number];

  @IsOptional()
  @IsBoolean()
  sendReminder?: boolean;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
