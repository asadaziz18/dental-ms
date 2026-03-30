import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
export declare class PurchaseOrdersController {
    private readonly poService;
    constructor(poService: PurchaseOrdersService);
    findByBranch(branchId: string): Promise<import("../../database/entities").PurchaseOrder[]>;
    findOne(branchId: string, id: string): Promise<import("../../database/entities").PurchaseOrder>;
    create(branchId: string, dto: CreatePurchaseOrderDto): Promise<import("../../database/entities").PurchaseOrder>;
    update(branchId: string, id: string, dto: UpdatePurchaseOrderDto): Promise<import("../../database/entities").PurchaseOrder>;
    remove(branchId: string, id: string): Promise<void>;
    receive(branchId: string, id: string, dto: ReceivePurchaseOrderDto): Promise<import("../../database/entities").PurchaseOrder>;
}
