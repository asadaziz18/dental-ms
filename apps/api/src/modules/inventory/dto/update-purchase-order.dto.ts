import {
  IsArray,
  IsOptional,
  IsString,
  IsDateString,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseOrderLineDto } from './create-purchase-order.dto';

const STATUSES = ['Draft', 'Submitted', 'PartiallyReceived', 'Received', 'Cancelled'] as const;

export class UpdatePurchaseOrderDto {
  @IsOptional()
  @IsString()
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  orderNumber?: string | null;

  @IsOptional()
  @IsDateString()
  expectedDate?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderLineDto)
  lines?: PurchaseOrderLineDto[];
}
