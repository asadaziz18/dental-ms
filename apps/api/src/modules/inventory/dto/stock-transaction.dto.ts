import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStockTransactionDto {
  @IsUUID()
  itemId!: string;

  @IsEnum(['in', 'out'])
  type!: 'in' | 'out';

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity!: number;

  @IsOptional()
  @IsEnum(['purchase', 'usage', 'adjustment'])
  referenceType?: 'purchase' | 'usage' | 'adjustment' | null;

  @IsOptional()
  @IsUUID()
  referenceId?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
