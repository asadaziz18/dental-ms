import { Repository } from 'typeorm';
import { LabTrial } from '../../database/entities/lab-trial.entity';
import { LabOrder } from '../../database/entities/lab-order.entity';
import { LabNotificationService } from './lab-notification.service';
export declare class LabSchedulerService {
    private readonly trialRepo;
    private readonly orderRepo;
    private readonly notificationService;
    constructor(trialRepo: Repository<LabTrial>, orderRepo: Repository<LabOrder>, notificationService: LabNotificationService);
    sendTrialReminders(): Promise<void>;
    flagOverdueOrders(): Promise<void>;
}
