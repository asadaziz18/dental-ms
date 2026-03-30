import { IsOptional, IsString, IsUUID, IsIn, MaxLength } from 'class-validator';

export class CreateTreatmentPlanDto {
  @IsUUID()
  patientId!: string;

  @IsOptional()
  @IsString()
  @IsIn(['Planned', 'In Progress', 'Completed'])
  status?: string;

  @IsOptional()
  @IsUUID()
  doctorId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  clinicalNotes?: string | null;
}
