import {
  IsEnum,
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
} from 'class-validator';
import type { LabTrialOutcome } from '../../../database/entities/lab-trial.entity';

export class CompleteTrialDto {
  @IsDateString()
  completedAt!: string;

  @IsEnum(['approved', 'adjustments_needed', 'rejected'])
  outcome!: LabTrialOutcome;

  @IsString()
  doctorNotes!: string;

  @IsOptional()
  @IsString()
  labInstructions?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
