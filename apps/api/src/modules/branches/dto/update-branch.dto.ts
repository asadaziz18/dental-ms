import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsArray, IsString, Matches, MaxLength } from 'class-validator';
import { CreateBranchDto } from './create-branch.dto';

const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

export class UpdateBranchDto extends PartialType(CreateBranchDto) {
  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'openingTime must be HH:mm' })
  openingTime?: string;

  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'closingTime must be HH:mm' })
  closingTime?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workingDays?: string[];
}
