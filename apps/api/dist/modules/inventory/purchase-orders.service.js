"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const purchase_order_entity_1 = require("../../database/entities/purchase-order.entity");
const purchase_order_line_entity_1 = require("../../database/entities/purchase-order-line.entity");
const stock_level_entity_1 = require("../../database/entities/stock-level.entity");
const stock_transaction_entity_1 = require("../../database/entities/stock-transaction.entity");
const stock_service_1 = require("./stock.service");
let PurchaseOrdersService = class PurchaseOrdersService {
    poRepo;
    lineRepo;
    stockRepo;
    txRepo;
    stockService;
    constructor(poRepo, lineRepo, stockRepo, txRepo, stockService) {
        this.poRepo = poRepo;
        this.lineRepo = lineRepo;
        this.stockRepo = stockRepo;
        this.txRepo = txRepo;
        this.stockService = stockService;
    }
    async findByBranch(branchId) {
        return this.poRepo.find({
            where: { branchId },
            relations: ['supplier', 'lines', 'lines.item'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(branchId, id) {
        const po = await this.poRepo.findOne({
            where: { id, branchId },
            relations: ['supplier', 'lines', 'lines.item'],
        });
        if (!po)
            throw new common_1.NotFoundException('Purchase order not found');
        return po;
    }
    async create(branchId, dto) {
        const po = this.poRepo.create({
            branchId,
            supplierId: dto.supplierId,
            orderNumber: dto.orderNumber ?? null,
            status: 'Draft',
            expectedDate: dto.expectedDate ?? null,
            notes: dto.notes ?? null,
        });
        const saved = await this.poRepo.save(po);
        for (const line of dto.lines) {
            const pol = this.lineRepo.create({
                purchaseOrderId: saved.id,
                itemId: line.itemId,
                quantityOrdered: line.quantityOrdered,
                quantityReceived: 0,
                unitPrice: line.unitPrice != null ? String(line.unitPrice) : null,
            });
            await this.lineRepo.save(pol);
        }
        return this.findOne(branchId, saved.id);
    }
    async update(branchId, id, dto) {
        const po = await this.findOne(branchId, id);
        if (po.status !== 'Draft')
            throw new common_1.BadRequestException('Can only edit draft orders');
        if (dto.status !== undefined)
            po.status = dto.status;
        if (dto.orderNumber !== undefined)
            po.orderNumber = dto.orderNumber;
        if (dto.expectedDate !== undefined)
            po.expectedDate = dto.expectedDate;
        if (dto.notes !== undefined)
            po.notes = dto.notes;
        if (dto.lines !== undefined) {
            await this.lineRepo.delete({ purchaseOrderId: id });
            for (const line of dto.lines) {
                const pol = this.lineRepo.create({
                    purchaseOrderId: id,
                    itemId: line.itemId,
                    quantityOrdered: line.quantityOrdered,
                    quantityReceived: 0,
                    unitPrice: line.unitPrice != null ? String(line.unitPrice) : null,
                });
                await this.lineRepo.save(pol);
            }
        }
        await this.poRepo.save(po);
        return this.findOne(branchId, id);
    }
    async remove(branchId, id) {
        const po = await this.findOne(branchId, id);
        if (po.status !== 'Draft')
            throw new common_1.BadRequestException('Can only delete draft orders');
        await this.poRepo.remove(po);
    }
    async receive(branchId, id, dto) {
        const po = await this.findOne(branchId, id);
        if (po.status === 'Cancelled')
            throw new common_1.BadRequestException('Order is cancelled');
        for (const rec of dto.lines) {
            const line = po.lines?.find((l) => l.itemId === rec.itemId);
            if (!line)
                continue;
            const receiveQty = Math.min(rec.quantityReceived, line.quantityOrdered - line.quantityReceived);
            if (receiveQty <= 0)
                continue;
            let level = await this.stockRepo.findOne({
                where: { branchId, itemId: line.itemId },
            });
            if (!level) {
                level = this.stockRepo.create({ branchId, itemId: line.itemId, quantity: 0 });
                await this.stockRepo.save(level);
            }
            level.quantity += receiveQty;
            await this.stockRepo.save(level);
            const tx = this.txRepo.create({
                branchId,
                itemId: line.itemId,
                type: 'in',
                quantity: receiveQty,
                referenceType: 'purchase',
                referenceId: id,
                notes: `PO ${po.orderNumber ?? id}`,
            });
            await this.txRepo.save(tx);
            line.quantityReceived += receiveQty;
            await this.lineRepo.save(line);
        }
        const allReceived = po.lines?.every((l) => l.quantityReceived >= l.quantityOrdered) ?? true;
        po.status = allReceived ? 'Received' : 'PartiallyReceived';
        await this.poRepo.save(po);
        await this.stockService.checkLowStockAndEmit(branchId);
        return this.findOne(branchId, id);
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(purchase_order_entity_1.PurchaseOrder)),
    __param(1, (0, typeorm_1.InjectRepository)(purchase_order_line_entity_1.PurchaseOrderLine)),
    __param(2, (0, typeorm_1.InjectRepository)(stock_level_entity_1.StockLevel)),
    __param(3, (0, typeorm_1.InjectRepository)(stock_transaction_entity_1.StockTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        stock_service_1.StockService])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map