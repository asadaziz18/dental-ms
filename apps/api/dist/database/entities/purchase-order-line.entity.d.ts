import { BaseEntity } from './base.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { InventoryItem } from './inventory-item.entity';
export declare class PurchaseOrderLine extends BaseEntity {
    purchaseOrderId: string;
    purchaseOrder: PurchaseOrder;
    itemId: string;
    item: InventoryItem;
    quantityOrdered: number;
    quantityReceived: number;
    unitPrice: string | null;
}
