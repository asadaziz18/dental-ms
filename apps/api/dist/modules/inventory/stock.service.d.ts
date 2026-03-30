import { Repository } from 'typeorm';
import { StockLevel } from '../../database/entities/stock-level.entity';
import { StockTransaction } from '../../database/entities/stock-transaction.entity';
import { InventoryItem } from '../../database/entities/inventory-item.entity';
import { CreateStockTransactionDto } from './dto/stock-transaction.dto';
import { InventoryGateway } from './inventory.gateway';
export declare class StockService {
    private readonly levelRepo;
    private readonly txRepo;
    private readonly itemRepo;
    private readonly gateway;
    constructor(levelRepo: Repository<StockLevel>, txRepo: Repository<StockTransaction>, itemRepo: Repository<InventoryItem>, gateway: InventoryGateway);
    getLevel(branchId: string, itemId: string): Promise<StockLevel>;
    getLevelsByBranch(branchId: string): Promise<StockLevel[]>;
    recordTransaction(branchId: string, dto: CreateStockTransactionDto): Promise<StockTransaction>;
    getTransactions(branchId: string, itemId?: string, limit?: number): Promise<StockTransaction[]>;
    checkLowStockAndEmit(branchId: string, itemId?: string): Promise<void>;
}
