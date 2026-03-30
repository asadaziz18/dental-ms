import { BaseEntity } from './base.entity';
import { LabOrder } from './lab-order.entity';
import { User } from './user.entity';
export type LabTrialStatus = 'scheduled' | 'completed' | 'missed';
export type LabTrialOutcome = 'approved' | 'adjustments_needed' | 'rejected';
export declare class LabTrial extends BaseEntity {
    labOrderId: string;
    labOrder: LabOrder;
    trialNumber: number;
    trialDate: Date;
    status: LabTrialStatus;
    outcome: LabTrialOutcome | null;
    doctorNotes: string | null;
    labInstructions: string | null;
    completedAt: Date | null;
    completedBy: string | null;
    completedByUser: User | null;
    attachments: string[];
    patientNotified: boolean;
    patientNotifiedAt: Date | null;
    patientNotificationChannel: string | null;
}
