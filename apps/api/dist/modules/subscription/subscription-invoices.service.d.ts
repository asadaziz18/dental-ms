import { Repository } from 'typeorm';
import { SubscriptionInvoice } from '../../database/entities/subscription-invoice.entity';
import { BranchSubscription } from '../../database/entities/branch-subscription.entity';
import { Branch } from '../../database/entities/branch.entity';
import { SubscriptionPlan } from '../../database/entities/subscription-plan.entity';
export declare class SubscriptionInvoicesService {
    private readonly invoiceRepo;
    private readonly subRepo;
    private readonly branchRepo;
    private readonly planRepo;
    constructor(invoiceRepo: Repository<SubscriptionInvoice>, subRepo: Repository<BranchSubscription>, branchRepo: Repository<Branch>, planRepo: Repository<SubscriptionPlan>);
    listByBranch(branchId: string): Promise<SubscriptionInvoice[]>;
    listAll(): Promise<SubscriptionInvoice[]>;
    markAsPaid(id: string): Promise<SubscriptionInvoice>;
    getNextInvoiceNumber(): Promise<string>;
    issueInvoicesForPeriod(): Promise<SubscriptionInvoice[]>;
    moveOverdueToGrace(): Promise<number>;
    suspendAfterGrace(graceDays?: number): Promise<number>;
}
