import type { LabOrderStatus } from '../../../database/entities/lab-order.entity';
export declare class OrderStatusDto {
    status: LabOrderStatus;
    reason?: string;
}
