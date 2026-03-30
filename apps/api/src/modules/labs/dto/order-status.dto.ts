import { IsEnum, IsOptional, IsString } from 'class-validator';
import type { LabOrderStatus } from '../../../database/entities/lab-order.entity';

export class OrderStatusDto {
  @IsEnum([
    'draft',
    'sent_to_lab',
    'trial_scheduled',
    'trial_in_progress',
    'approved',
    'delivered',
    'cancelled',
    'rejected',
  ])
  status!: LabOrderStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
