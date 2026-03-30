import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PrescriptionItemDto {
  @IsString()
  @MaxLength(255)
  medication!: string;

  @IsString()
  @MaxLength(100)
  dosage!: string;

  @IsString()
  @MaxLength(100)
  frequency!: string;

  @IsString()
  @MaxLength(100)
  duration!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  instructions?: string;
}

export class CreatePrescriptionDto {
  @IsUUID()
  patientId!: string;

  @IsOptional()
  @IsUUID()
  treatmentPlanId?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items!: PrescriptionItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}
