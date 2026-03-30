import { InventoryItemsService } from './inventory-items.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
export declare class InventoryItemsController {
    private readonly itemsService;
    constructor(itemsService: InventoryItemsService);
    findByBranch(branchId: string): Promise<import("../../database/entities").InventoryItem[]>;
    findOne(branchId: string, id: string): Promise<import("../../database/entities").InventoryItem>;
    create(branchId: string, dto: CreateInventoryItemDto): Promise<import("../../database/entities").InventoryItem>;
    update(branchId: string, id: string, dto: UpdateInventoryItemDto): Promise<import("../../database/entities").InventoryItem>;
    remove(branchId: string, id: string): Promise<void>;
}
