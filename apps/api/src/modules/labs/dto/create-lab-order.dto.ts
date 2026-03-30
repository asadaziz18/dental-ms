import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsUUID,
  IsNumber,
  MaxLength,
  IsDateString,
} from 'class-validator';
import type { LabOrderWorkType, LabOrderPriority } from '../../../database/entities/lab-order.entity';

export class CreateLabOrderDto {
  @IsUUID()
  patientId!: string;

  @IsUUID()
  doctorId!: string;

  @IsUUID()
  vendorId!: string;

  @IsOptional()
  @IsUUID()
  treatmentId?: string | null;

  @IsEnum(['crown_bridge', 'denture', 'orthodontic', 'veneer_laminate', 'implant', 'custom'])
  workType!: LabOrderWorkType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  customWorkType?: string | null;

  @IsArray()
  @IsString({ each: true })
  toothNumbers!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(20)
  shade?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  material?: string | null;

  @IsOptional()
  @IsString()
  instructions?: string | null;

  @IsOptional()
  @IsEnum(['normal', 'urgent'])
  priority?: LabOrderPriority;

  @IsOptional()
  @IsDateString()
  sentToLabAt?: string | null;

  @IsOptional()
  @IsDateString()
  expectedTrialDate?: string | null;

  @IsOptional()
  @IsDateString()
  finalDeliveryDate?: string | null;

  @IsOptional()
  @IsNumber()
  labFee?: number | null;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
