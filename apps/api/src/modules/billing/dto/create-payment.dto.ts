import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export const PAYMENT_METHODS = ['Cash', 'Card', 'Insurance', 'Partial', 'Other'] as const;

export class CreatePaymentDto {
  @IsUUID()
  invoiceId!: string;

  @IsNumber()
  @Type(() => Number)
  amount!: number;

  @IsEnum(PAYMENT_METHODS)
  method!: (typeof PAYMENT_METHODS)[number];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reference?: string | null;

  @IsOptional()
  @IsString()
  paidAt?: string; // ISO date string; default now
}
