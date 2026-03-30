import { IsBoolean } from 'class-validator';

export class VendorStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
