import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SUBSCRIPTION_QUEUE } from './subscription.processor';

@Injectable()
export class SubscriptionSchedulerService implements OnModuleInit {
  constructor(
    @InjectQueue(SUBSCRIPTION_QUEUE)
    private readonly queue: Queue,
  ) {}

  async onModuleInit() {
    await this.queue.add(
      'issue-invoices',
      { type: 'issue-invoices' },
      { repeat: { pattern: '0 0 1 * *' } },
    );
    await this.queue.add(
      'grace-period',
      { type: 'grace-period' },
      { repeat: { pattern: '0 2 * * *' } },
    );
    await this.queue.add(
      'suspension',
      { type: 'suspension' },
      { repeat: { pattern: '0 3 * * *' } },
    );
  }
}
