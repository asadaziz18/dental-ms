import { PurchaseOrderLineDto } from './create-purchase-order.dto';
export declare class UpdatePurchaseOrderDto {
    status?: string;
    orderNumber?: string | null;
    expectedDate?: string | null;
    notes?: string | null;
    lines?: PurchaseOrderLineDto[];
}
