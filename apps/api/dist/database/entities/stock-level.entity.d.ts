import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { InventoryItem } from './inventory-item.entity';
export declare class StockLevel extends BaseEntity {
    branchId: string;
    branch: Branch;
    itemId: string;
    item: InventoryItem;
    quantity: number;
}
