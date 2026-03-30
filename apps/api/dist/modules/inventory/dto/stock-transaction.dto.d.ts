export declare class CreateStockTransactionDto {
    itemId: string;
    type: 'in' | 'out';
    quantity: number;
    referenceType?: 'purchase' | 'usage' | 'adjustment' | null;
    referenceId?: string | null;
    notes?: string | null;
}
