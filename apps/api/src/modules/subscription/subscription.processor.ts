import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SubscriptionInvoicesService } from './subscription-invoices.service';

export const SUBSCRIPTION_QUEUE = 'subscription';

@Processor(SUBSCRIPTION_QUEUE)
export class SubscriptionProcessor extends WorkerHost {
  constructor(private readonly invoicesService: SubscriptionInvoicesService) {
    super();
  }

  async process(job: Job<{ type: string }, void, string>): Promise<void> {
    switch (job.name) {
      case 'issue-invoices':
        await this.invoicesService.issueInvoicesForPeriod();
        break;
      case 'grace-period':
        await this.invoicesService.moveOverdueToGrace();
        break;
      case 'suspension':
        await this.invoicesService.suspendAfterGrace(7);
        break;
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }
}
