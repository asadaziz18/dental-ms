import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

const ROLES = ['SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist', 'Nurse'] as const;

export class CreateStaffDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsString()
  @MaxLength(100)
  fullName!: string;

  @IsEnum(ROLES)
  role!: (typeof ROLES)[number];

  @IsOptional()
  @IsUUID()
  branchId?: string | null;

  @IsOptional()
  isActive?: boolean;
}
