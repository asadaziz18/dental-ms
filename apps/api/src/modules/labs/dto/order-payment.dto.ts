import { IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class OrderPaymentDto {
  @IsBoolean()
  isPaid!: boolean;

  @IsOptional()
  @IsNumber()
  labFee?: number | null;
}
