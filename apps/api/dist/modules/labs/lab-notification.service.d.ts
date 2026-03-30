import { Queue } from 'bullmq';
import { LabOrder } from '../../database/entities/lab-order.entity';
import { LabTrial } from '../../database/entities/lab-trial.entity';
export declare const LAB_NOTIFICATIONS_QUEUE = "lab-notifications";
export interface TrialScheduledPayload {
    type: 'trial_scheduled';
    orderId: string;
    trialId: string;
    channel: 'whatsapp' | 'email' | 'both';
    customMessage?: string;
}
export interface TrialReminderPayload {
    type: 'trial_reminder';
    orderId: string;
    trialId: string;
    channel: 'whatsapp' | 'email' | 'both';
}
export interface OrderReadyPayload {
    type: 'order_ready';
    orderId: string;
    channel: 'whatsapp' | 'email' | 'both';
}
export type LabNotificationJobPayload = TrialScheduledPayload | TrialReminderPayload | OrderReadyPayload;
export declare class LabNotificationService {
    private readonly queue;
    constructor(queue: Queue<LabNotificationJobPayload>);
    sendTrialScheduledNotification(trial: LabTrial, order: LabOrder & {
        patient?: {
            firstName: string;
            lastName: string;
            phone?: string | null;
            email?: string | null;
        };
        branch?: {
            name: string;
            phone?: string | null;
        };
    }, channel: 'whatsapp' | 'email' | 'both', customMessage?: string): Promise<void>;
    sendTrialReminderNotification(trialId: string, orderId: string, channel: 'whatsapp' | 'email' | 'both'): Promise<void>;
    sendOrderReadyNotification(orderId: string, channel: 'whatsapp' | 'email' | 'both'): Promise<void>;
}
