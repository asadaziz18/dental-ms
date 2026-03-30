import { Repository } from 'typeorm';
import { InventoryItem } from '../../database/entities/inventory-item.entity';
import { StockLevel } from '../../database/entities/stock-level.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
export declare class InventoryItemsService {
    private readonly itemRepo;
    private readonly stockRepo;
    constructor(itemRepo: Repository<InventoryItem>, stockRepo: Repository<StockLevel>);
    findByBranch(branchId: string): Promise<InventoryItem[]>;
    findOne(branchId: string, id: string): Promise<InventoryItem>;
    create(branchId: string, dto: CreateInventoryItemDto): Promise<InventoryItem>;
    update(branchId: string, id: string, dto: UpdateInventoryItemDto): Promise<InventoryItem>;
    remove(branchId: string, id: string): Promise<void>;
}
