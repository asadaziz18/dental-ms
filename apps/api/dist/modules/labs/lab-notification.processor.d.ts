import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { LabOrder } from '../../database/entities/lab-order.entity';
import { LabTrial } from '../../database/entities/lab-trial.entity';
import { LabNotification } from '../../database/entities/lab-notification.entity';
import { type LabNotificationJobPayload } from './lab-notification.service';
import { LabNotificationSender } from './lab-notification-sender.service';
export declare class LabNotificationProcessor extends WorkerHost {
    private readonly orderRepo;
    private readonly trialRepo;
    private readonly notificationRepo;
    private readonly sender;
    constructor(orderRepo: Repository<LabOrder>, trialRepo: Repository<LabTrial>, notificationRepo: Repository<LabNotification>, sender: LabNotificationSender);
    process(job: Job<LabNotificationJobPayload>): Promise<void>;
    private sendAndLog;
}
