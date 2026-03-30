import {
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
  IsEmail,
} from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MaxLength(100)
  lastName!: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string | null;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsString()
  medicalHistory?: string | null;

  @IsOptional()
  @IsString()
  allergies?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  insuranceProvider?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  insuranceId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  avatarUrl?: string | null;
}
