/**
 * Subscription & Billing types (platform subscription for branches/tenants)
 */
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'grace' | 'suspended' | 'cancelled';
export type SubscriptionInvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
export interface PlanFeatures {
    maxPatients?: number;
    maxStaff?: number;
    maxBranches?: number;
    imaging?: boolean;
    reports?: boolean;
    inventory?: boolean;
    [key: string]: unknown;
}
export interface SubscriptionPlan {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    priceMonthly: string;
    priceYearly: string;
    billingInterval: 'month' | 'year';
    features: PlanFeatures | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface BranchSubscriptionDto {
    id: string;
    branchId: string;
    planId: string;
    planName?: string;
    planSlug?: string;
    status: SubscriptionStatus;
    trialEndsAt: string | null;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelledAt: string | null;
    features: PlanFeatures | null;
}
export interface SubscriptionInvoiceDto {
    id: string;
    branchId: string;
    planId: string;
    invoiceNumber: string;
    amount: string;
    status: SubscriptionInvoiceStatus;
    dueDate: string;
    paidAt: string | null;
    periodStart: string | null;
    periodEnd: string | null;
    plan?: SubscriptionPlan;
    branch?: {
        id: string;
        name: string;
    };
}
export interface PlanLimitUsage {
    planId: string;
    planName: string;
    features: PlanFeatures | null;
    limits: {
        maxPatients: number;
        maxStaff: number;
        maxBranches: number;
        imaging: boolean;
        reports: boolean;
        inventory: boolean;
    };
    usage: {
        patients: number;
        staff: number;
        branches: number;
    };
    canAddPatient: boolean;
    canAddStaff: boolean;
}
export interface TenantListItem {
    branchId: string;
    branchName: string;
    branchAddress?: string | null;
    planId: string | null;
    planName: string | null;
    planSlug: string | null;
    status: SubscriptionStatus | null;
    currentPeriodEnd: string | null;
    trialEndsAt: string | null;
}
//# sourceMappingURL=subscription.d.ts.map