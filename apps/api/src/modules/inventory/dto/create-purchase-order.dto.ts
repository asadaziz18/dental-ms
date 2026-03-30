import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  IsNumber,
  Min,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseOrderLineDto {
  @IsUUID()
  itemId!: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantityOrdered!: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  unitPrice?: number | null;
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  supplierId!: string;

  @IsOptional()
  @IsString()
  orderNumber?: string | null;

  @IsOptional()
  @IsDateString()
  expectedDate?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderLineDto)
  lines!: PurchaseOrderLineDto[];
}
