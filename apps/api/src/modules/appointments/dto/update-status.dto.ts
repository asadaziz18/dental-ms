import { IsIn } from 'class-validator';

const STATUSES = ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No-Show'] as const;

export class UpdateStatusDto {
  @IsIn(STATUSES)
  status!: (typeof STATUSES)[number];
}
