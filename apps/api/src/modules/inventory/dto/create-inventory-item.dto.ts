import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryItemDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(80)
  sku!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  unit?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  reorderThreshold?: number;
}
