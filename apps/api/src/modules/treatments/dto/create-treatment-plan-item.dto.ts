import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsIn,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

const TOOTH_CONDITIONS = [
  'caries',
  'crown',
  'rct',
  'extraction',
  'implant',
  'bridge',
  'filling',
  'healthy',
  'missing',
] as const;

export class CreateTreatmentPlanItemDto {
  @IsInt()
  @Min(11)
  @Max(48)
  @Type(() => Number)
  toothNumber!: number;

  @IsUUID()
  procedureId!: string;

  @IsOptional()
  @IsString()
  @IsIn(TOOTH_CONDITIONS)
  conditionTag?: string | null;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  doctorId?: string | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  estimatedCost?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  priority?: number;
}
