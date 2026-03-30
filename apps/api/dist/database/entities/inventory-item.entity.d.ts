import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { StockLevel } from './stock-level.entity';
import { StockTransaction } from './stock-transaction.entity';
export declare class InventoryItem extends BaseEntity {
    branchId: string;
    branch: Branch;
    name: string;
    sku: string;
    category: string | null;
    unit: string;
    reorderThreshold: number;
    stockLevels: StockLevel[];
    transactions: StockTransaction[];
}
