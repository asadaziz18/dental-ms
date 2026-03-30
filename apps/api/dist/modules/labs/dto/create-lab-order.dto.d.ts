import type { LabOrderWorkType, LabOrderPriority } from '../../../database/entities/lab-order.entity';
export declare class CreateLabOrderDto {
    patientId: string;
    doctorId: string;
    vendorId: string;
    treatmentId?: string | null;
    workType: LabOrderWorkType;
    customWorkType?: string | null;
    toothNumbers: string[];
    shade?: string | null;
    material?: string | null;
    instructions?: string | null;
    priority?: LabOrderPriority;
    sentToLabAt?: string | null;
    expectedTrialDate?: string | null;
    finalDeliveryDate?: string | null;
    labFee?: number | null;
    isPaid?: boolean;
    attachments?: string[];
}
