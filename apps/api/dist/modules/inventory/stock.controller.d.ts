import { StockService } from './stock.service';
import { CreateStockTransactionDto } from './dto/stock-transaction.dto';
export declare class StockController {
    private readonly stockService;
    constructor(stockService: StockService);
    getLevels(branchId: string): Promise<import("../../database/entities").StockLevel[]>;
    getLevel(branchId: string, itemId: string): Promise<import("../../database/entities").StockLevel>;
    recordTransaction(branchId: string, dto: CreateStockTransactionDto): Promise<import("../../database/entities").StockTransaction>;
    getTransactions(branchId: string, itemId?: string, limit?: string): Promise<import("../../database/entities").StockTransaction[]>;
}
