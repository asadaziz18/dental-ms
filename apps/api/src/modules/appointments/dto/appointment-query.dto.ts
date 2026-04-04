import { IsOptional, IsDateString } from 'class-validator';
import { IsUuidString } from '../../../common/validators/is-uuid-string.decorator';

export class AppointmentQueryDto {
  @IsOptional()
  @IsUuidString()
  branchId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsUuidString()
  doctorId?: string;

  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;
}
