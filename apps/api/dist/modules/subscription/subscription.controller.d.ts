import { SubscriptionService } from './subscription.service';
import { PlanLimitsService } from './plan-limits.service';
export declare class SubscriptionController {
    private readonly subscriptionService;
    private readonly planLimitsService;
    constructor(subscriptionService: SubscriptionService, planLimitsService: PlanLimitsService);
    getMySubscription(branchId: string): Promise<{
        id: string;
        branchId: string;
        planId: string;
        planName: string;
        planSlug: string;
        status: import("../../database/entities/branch-subscription.entity").SubscriptionStatus;
        trialEndsAt: string | null;
        currentPeriodStart: string;
        currentPeriodEnd: string;
        cancelledAt: string | null;
        features: import("../../database/entities/subscription-plan.entity").PlanFeatures | null;
    } | null>;
    getUsage(branchId: string): Promise<import("./plan-limits.service").PlanLimitUsage | null>;
}
