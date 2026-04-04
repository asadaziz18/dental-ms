import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBookingSlipFooterDto {
  /** Omit to leave unchanged; send `null` or empty string to clear. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  productOwnerFooter?: string | null;
}
