import { IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SetCommissionRateDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  ratePercent!: number;
}
