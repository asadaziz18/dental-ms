export declare class PurchaseOrderLineDto {
    itemId: string;
    quantityOrdered: number;
    unitPrice?: number | null;
}
export declare class CreatePurchaseOrderDto {
    supplierId: string;
    orderNumber?: string | null;
    expectedDate?: string | null;
    notes?: string | null;
    lines: PurchaseOrderLineDto[];
}
