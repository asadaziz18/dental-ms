import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { PurchaseOrder } from './purchase-order.entity';
export declare class Supplier extends BaseEntity {
    branchId: string;
    branch: Branch;
    name: string;
    contactName: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    purchaseOrders: PurchaseOrder[];
}
