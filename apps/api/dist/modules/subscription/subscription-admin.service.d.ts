import { Repository } from 'typeorm';
import { Branch } from '../../database/entities/branch.entity';
import { BranchSubscription } from '../../database/entities/branch-subscription.entity';
import { SubscriptionPlan } from '../../database/entities/subscription-plan.entity';
export declare class SubscriptionAdminService {
    private readonly branchRepo;
    private readonly subRepo;
    private readonly planRepo;
    constructor(branchRepo: Repository<Branch>, subRepo: Repository<BranchSubscription>, planRepo: Repository<SubscriptionPlan>);
    listTenants(): Promise<{
        branchId: string;
        branchName: string;
        branchAddress: string | null;
        planId: string | null;
        planName: string | null;
        planSlug: string | null;
        status: import("../../database/entities/branch-subscription.entity").SubscriptionStatus | null;
        currentPeriodEnd: string | null;
        trialEndsAt: string | null;
    }[]>;
    assignPlan(branchId: string, planId: string, trialDays?: number): Promise<BranchSubscription | null>;
}
