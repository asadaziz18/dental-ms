import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { InventoryItem } from './inventory-item.entity';
export type StockTransactionType = 'in' | 'out';
export type StockTransactionReference = 'purchase' | 'usage' | 'adjustment';
export declare class StockTransaction extends BaseEntity {
    branchId: string;
    branch: Branch;
    itemId: string;
    item: InventoryItem;
    type: StockTransactionType;
    quantity: number;
    referenceType: StockTransactionReference | null;
    referenceId: string | null;
    notes: string | null;
}
