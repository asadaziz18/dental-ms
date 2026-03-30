import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'grace' | 'suspended' | 'cancelled';
export declare class BranchSubscription extends BaseEntity {
    branchId: string;
    planId: string;
    status: SubscriptionStatus;
    trialEndsAt: Date | null;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelledAt: Date | null;
    branch: Branch;
    plan: SubscriptionPlan;
}
