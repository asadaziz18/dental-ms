import { BaseEntity } from './base.entity';
import { Invoice } from './invoice.entity';
import { Procedure } from './procedure.entity';
export declare class InvoiceLineItem extends BaseEntity {
    invoiceId: string;
    invoice: Invoice;
    procedureId: string | null;
    procedure: Procedure | null;
    description: string;
    quantity: string;
    unitPrice: string;
    discountAmount: string;
    lineTotal: string;
}
