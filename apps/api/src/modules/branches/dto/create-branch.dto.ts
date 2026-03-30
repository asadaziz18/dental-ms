import { IsString, IsOptional, IsBoolean, IsArray, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

const CODE_REGEX = /^[A-Z0-9\-]+$/;
const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
const WORKING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export class CreateBranchDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @IsString()
  @Matches(CODE_REGEX, { message: 'code must be uppercase alphanumeric and dashes only (e.g. KHI-01)' })
  @MaxLength(20)
  code!: string;

  @IsString()
  @MinLength(1)
  address!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  city!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string | null;

  @IsOptional()
  @IsUUID()
  managerUserId?: string | null;

  @IsString()
  @Matches(TIME_REGEX, { message: 'openingTime must be HH:mm' })
  openingTime!: string;

  @IsString()
  @Matches(TIME_REGEX, { message: 'closingTime must be HH:mm' })
  closingTime!: string;

  @IsArray()
  @IsString({ each: true })
  workingDays!: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateSubBranchDto extends CreateBranchDto {
  // parentBranchId is set from route param
}
