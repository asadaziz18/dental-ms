import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateOrUpdateAttendanceDto {
  @IsDateString()
  date!: string;

  @IsOptional()
  @IsDateString()
  checkInAt?: string | null;

  @IsOptional()
  @IsDateString()
  checkOutAt?: string | null;
}
