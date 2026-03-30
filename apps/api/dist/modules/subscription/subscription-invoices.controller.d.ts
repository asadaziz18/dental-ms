import { SubscriptionInvoicesService } from './subscription-invoices.service';
export declare class SubscriptionInvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: SubscriptionInvoicesService);
    listMyInvoices(branchId: string): Promise<import("../../database/entities").SubscriptionInvoice[]>;
    listAll(): Promise<import("../../database/entities").SubscriptionInvoice[]>;
    markAsPaid(id: string): Promise<import("../../database/entities").SubscriptionInvoice>;
}
