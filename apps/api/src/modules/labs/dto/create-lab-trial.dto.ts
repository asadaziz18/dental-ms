import { IsString, IsOptional, IsDateString, IsBoolean, IsEnum } from 'class-validator';

export class CreateLabTrialDto {
  @IsDateString()
  trialDate!: string;

  @IsOptional()
  @IsString()
  doctorNotes?: string | null;

  @IsOptional()
  @IsString()
  labInstructions?: string | null;

  @IsOptional()
  @IsBoolean()
  notifyPatient?: boolean;

  @IsOptional()
  @IsEnum(['whatsapp', 'email', 'both'])
  channel?: 'whatsapp' | 'email' | 'both';
}
