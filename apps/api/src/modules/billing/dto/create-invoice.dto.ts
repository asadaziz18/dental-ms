import {
  IsOptional,
  IsString,
  IsUUID,
  IsIn,
  IsNumber,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

const STATUSES = ['Draft', 'Sent', 'PartiallyPaid', 'Paid', 'Overdue', 'Cancelled'] as const;

export class CreateInvoiceDto {
  @IsUUID()
  patientId!: string;

  @IsOptional()
  @IsUUID()
  treatmentPlanId?: string | null;

  @IsOptional()
  @IsUUID()
  doctorId?: string | null;

  @IsOptional()
  @IsString()
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  taxRatePercent?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}
