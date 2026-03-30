import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Supplier } from './supplier.entity';
import { PurchaseOrderLine } from './purchase-order-line.entity';
export type PurchaseOrderStatus = 'Draft' | 'Submitted' | 'PartiallyReceived' | 'Received' | 'Cancelled';
export declare class PurchaseOrder extends BaseEntity {
    branchId: string;
    branch: Branch;
    supplierId: string;
    supplier: Supplier;
    orderNumber: string | null;
    status: PurchaseOrderStatus;
    expectedDate: string | null;
    notes: string | null;
    lines: PurchaseOrderLine[];
}
