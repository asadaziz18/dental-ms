import { OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
export declare class SubscriptionSchedulerService implements OnModuleInit {
    private readonly queue;
    constructor(queue: Queue);
    onModuleInit(): Promise<void>;
}
