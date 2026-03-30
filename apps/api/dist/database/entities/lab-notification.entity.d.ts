import { BaseEntity } from './base.entity';
import { LabOrder } from './lab-order.entity';
import { LabTrial } from './lab-trial.entity';
import { Patient } from './patient.entity';
export type LabNotificationChannel = 'whatsapp' | 'email';
export type LabNotificationType = 'trial_scheduled' | 'trial_reminder' | 'order_ready' | 'order_delayed' | 'delivery_confirmed';
export type LabNotificationStatus = 'sent' | 'failed' | 'pending';
export declare class LabNotification extends BaseEntity {
    labOrderId: string;
    labOrder: LabOrder;
    labTrialId: string | null;
    labTrial: LabTrial | null;
    patientId: string;
    patient: Patient;
    channel: LabNotificationChannel;
    type: LabNotificationType;
    message: string;
    status: LabNotificationStatus;
    sentAt: Date | null;
    errorMessage: string | null;
}
