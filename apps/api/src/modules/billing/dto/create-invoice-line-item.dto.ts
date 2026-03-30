import { IsOptional, IsString, IsUUID, IsNumber, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceLineItemDto {
  @IsOptional()
  @IsUUID()
  procedureId?: string | null;

  @IsString()
  @MaxLength(255)
  description!: string;

  @IsOptional()
  @IsNumber()
  @Min(0.001)
  @Type(() => Number)
  quantity?: number;

  @IsNumber()
  @Type(() => Number)
  unitPrice!: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discountAmount?: number;
}
