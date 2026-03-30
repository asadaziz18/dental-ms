import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
export type SubscriptionInvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
export declare class SubscriptionInvoice extends BaseEntity {
    branchId: string;
    planId: string;
    invoiceNumber: string;
    amount: string;
    status: SubscriptionInvoiceStatus;
    dueDate: Date;
    paidAt: Date | null;
    periodStart: Date | null;
    periodEnd: Date | null;
    branch: Branch;
    plan: SubscriptionPlan;
}
