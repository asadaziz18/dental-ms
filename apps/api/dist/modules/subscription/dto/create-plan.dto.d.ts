export declare class CreatePlanDto {
    name: string;
    slug: string;
    description?: string | null;
    priceMonthly?: number;
    priceYearly?: number;
    billingInterval?: 'month' | 'year';
    features?: Record<string, unknown> | null;
    isActive?: boolean;
}
