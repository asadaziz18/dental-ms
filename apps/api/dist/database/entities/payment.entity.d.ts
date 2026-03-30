import { BaseEntity } from './base.entity';
import { Invoice } from './invoice.entity';
import { Branch } from './branch.entity';
export type PaymentMethod = 'Cash' | 'Card' | 'Insurance' | 'Partial' | 'Other';
export declare class Payment extends BaseEntity {
    invoiceId: string;
    invoice: Invoice;
    branchId: string;
    branch: Branch;
    amount: string;
    method: PaymentMethod;
    reference: string | null;
    paidAt: Date;
}
