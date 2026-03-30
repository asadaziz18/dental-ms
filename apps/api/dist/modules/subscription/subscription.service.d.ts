import { Repository } from 'typeorm';
import { BranchSubscription } from '../../database/entities/branch-subscription.entity';
import type { SubscriptionStatus } from '../../database/entities/branch-subscription.entity';
export declare class SubscriptionService {
    private readonly subRepo;
    constructor(subRepo: Repository<BranchSubscription>);
    getByBranchId(branchId: string): Promise<{
        id: string;
        branchId: string;
        planId: string;
        planName: string;
        planSlug: string;
        status: SubscriptionStatus;
        trialEndsAt: string | null;
        currentPeriodStart: string;
        currentPeriodEnd: string;
        cancelledAt: string | null;
        features: import("../../database/entities/subscription-plan.entity").PlanFeatures | null;
    } | null>;
    updateStatus(branchId: string, status: SubscriptionStatus): Promise<{
        id: string;
        branchId: string;
        planId: string;
        planName: string;
        planSlug: string;
        status: SubscriptionStatus;
        trialEndsAt: string | null;
        currentPeriodStart: string;
        currentPeriodEnd: string;
        cancelledAt: string | null;
        features: import("../../database/entities/subscription-plan.entity").PlanFeatures | null;
    } | null>;
}
