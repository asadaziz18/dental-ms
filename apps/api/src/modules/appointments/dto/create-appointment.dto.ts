import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsIn,
  IsUUID,
  MaxLength,
} from 'class-validator';

const TYPES = ['consultation', 'procedure', 'follow-up'] as const;
const STATUSES = ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No-Show'] as const;

export class CreateAppointmentDto {
  @IsUUID('all')
  patientId!: string;

  @IsOptional()
  @IsUUID('all')
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
