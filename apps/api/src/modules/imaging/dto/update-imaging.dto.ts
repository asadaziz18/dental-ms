import { IsOptional, IsInt, Min, Max, IsArray, IsObject } from 'class-validator';

export class UpdateImagingDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(32)
  toothNumber?: number | null;

  @IsOptional()
  @IsArray()
  annotations?: Array<Record<string, unknown>> | null;
}
