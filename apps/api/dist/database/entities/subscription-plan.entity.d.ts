import { BaseEntity } from './base.entity';
export interface PlanFeatures {
    maxPatients?: number;
    maxStaff?: number;
    maxBranches?: number;
    imaging?: boolean;
    reports?: boolean;
    inventory?: boolean;
    [key: string]: unknown;
}
export declare class SubscriptionPlan extends BaseEntity {
    name: string;
    slug: string;
    description: string | null;
    priceMonthly: string;
    priceYearly: string;
    billingInterval: 'month' | 'year';
    features: PlanFeatures | null;
    isActive: boolean;
}
