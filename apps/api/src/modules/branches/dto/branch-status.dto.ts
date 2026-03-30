import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class BranchStatusDto {
  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}
