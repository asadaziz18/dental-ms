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

const STATUSES = ['Draft', 'Submitted', 'Approved', 'Denied', 'Paid', 'Partial'] as const;

export class CreateInsuranceClaimDto {
  @IsUUID()
  patientId!: string;

  @IsOptional()
  @IsUUID()
  invoiceId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  claimNumber?: string | null;

  @IsOptional()
  @IsString()
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  insuranceProvider?: string | null;

  @IsOptional()
  @IsDateString()
  submittedAt?: string | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amountClaimed?: number | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amountApproved?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}
