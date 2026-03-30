import { IsInt, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertStaffScheduleDto {
  @IsInt()
  @Min(0)
  @Max(6)
  @Type(() => Number)
  dayOfWeek!: number;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;
}
