import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SubscriptionInvoicesService } from './subscription-invoices.service';
export declare const SUBSCRIPTION_QUEUE = "subscription";
export declare class SubscriptionProcessor extends WorkerHost {
    private readonly invoicesService;
    constructor(invoicesService: SubscriptionInvoicesService);
    process(job: Job<{
        type: string;
    }, void, string>): Promise<void>;
}
