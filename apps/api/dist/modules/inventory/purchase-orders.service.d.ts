import { Repository } from 'typeorm';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseOrderLine } from '../../database/entities/purchase-order-line.entity';
import { StockLevel } from '../../database/entities/stock-level.entity';
import { StockTransaction } from '../../database/entities/stock-transaction.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
import { StockService } from './stock.service';
export declare class PurchaseOrdersService {
    private readonly poRepo;
    private readonly lineRepo;
    private readonly stockRepo;
    private readonly txRepo;
    private readonly stockService;
    constructor(poRepo: Repository<PurchaseOrder>, lineRepo: Repository<PurchaseOrderLine>, stockRepo: Repository<StockLevel>, txRepo: Repository<StockTransaction>, stockService: StockService);
    findByBranch(branchId: string): Promise<PurchaseOrder[]>;
    findOne(branchId: string, id: string): Promise<PurchaseOrder>;
    create(branchId: string, dto: CreatePurchaseOrderDto): Promise<PurchaseOrder>;
    update(branchId: string, id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder>;
    remove(branchId: string, id: string): Promise<void>;
    receive(branchId: string, id: string, dto: ReceivePurchaseOrderDto): Promise<PurchaseOrder>;
}
