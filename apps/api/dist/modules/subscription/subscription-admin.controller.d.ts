import { SubscriptionAdminService } from './subscription-admin.service';
export declare class SubscriptionAdminController {
    private readonly adminService;
    constructor(adminService: SubscriptionAdminService);
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
    assignPlan(branchId: string, body: {
        planId: string;
        trialDays?: number;
    }): Promise<import("../../database/entities").BranchSubscription | null>;
}
