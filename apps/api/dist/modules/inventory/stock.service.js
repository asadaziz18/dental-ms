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
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stock_level_entity_1 = require("../../database/entities/stock-level.entity");
const stock_transaction_entity_1 = require("../../database/entities/stock-transaction.entity");
const inventory_item_entity_1 = require("../../database/entities/inventory-item.entity");
const inventory_gateway_1 = require("./inventory.gateway");
let StockService = class StockService {
    levelRepo;
    txRepo;
    itemRepo;
    gateway;
    constructor(levelRepo, txRepo, itemRepo, gateway) {
        this.levelRepo = levelRepo;
        this.txRepo = txRepo;
        this.itemRepo = itemRepo;
        this.gateway = gateway;
    }
    async getLevel(branchId, itemId) {
        const level = await this.levelRepo.findOne({
            where: { branchId, itemId },
            relations: ['item'],
        });
        if (!level)
            throw new common_1.NotFoundException('Stock level not found');
        return level;
    }
    async getLevelsByBranch(branchId) {
        return this.levelRepo
            .createQueryBuilder('sl')
            .innerJoinAndSelect('sl.item', 'item')
            .where('sl.branchId = :branchId', { branchId })
            .orderBy('item.name', 'ASC')
            .getMany();
    }
    async recordTransaction(branchId, dto) {
        const item = await this.itemRepo.findOne({
            where: { id: dto.itemId, branchId },
        });
        if (!item)
            throw new common_1.NotFoundException('Inventory item not found');
        let level = await this.levelRepo.findOne({
            where: { branchId, itemId: dto.itemId },
        });
        if (!level) {
            level = this.levelRepo.create({ branchId, itemId: dto.itemId, quantity: 0 });
            await this.levelRepo.save(level);
        }
        const sign = dto.type === 'in' ? 1 : -1;
        const newQty = level.quantity + sign * dto.quantity;
        if (newQty < 0)
            throw new common_1.BadRequestException('Insufficient stock');
        level.quantity = newQty;
        await this.levelRepo.save(level);
        const tx = this.txRepo.create({
            branchId,
            itemId: dto.itemId,
            type: dto.type,
            quantity: dto.quantity,
            referenceType: dto.referenceType ?? null,
            referenceId: dto.referenceId ?? null,
            notes: dto.notes ?? null,
        });
        const saved = await this.txRepo.save(tx);
        await this.checkLowStockAndEmit(branchId, dto.itemId);
        return this.txRepo.findOneOrFail({
            where: { id: saved.id },
            relations: ['item'],
        });
    }
    async getTransactions(branchId, itemId, limit = 50) {
        const qb = this.txRepo
            .createQueryBuilder('t')
            .where('t.branchId = :branchId', { branchId })
            .orderBy('t.createdAt', 'DESC')
            .take(limit);
        if (itemId)
            qb.andWhere('t.itemId = :itemId', { itemId });
        return qb.getMany();
    }
    async checkLowStockAndEmit(branchId, itemId) {
        const qb = this.levelRepo
            .createQueryBuilder('sl')
            .innerJoinAndSelect('sl.item', 'item')
            .where('sl.branchId = :branchId', { branchId })
            .andWhere('sl.quantity <= item.reorderThreshold')
            .andWhere('item.reorderThreshold > 0');
        if (itemId)
            qb.andWhere('sl.itemId = :itemId', { itemId });
        const low = await qb.getMany();
        if (low.length > 0) {
            this.gateway.emitLowStockAlert(branchId, low.map((sl) => ({
                itemId: sl.itemId,
                itemName: sl.item.name,
                sku: sl.item.sku,
                quantity: sl.quantity,
                reorderThreshold: sl.item.reorderThreshold,
            })));
        }
    }
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stock_level_entity_1.StockLevel)),
    __param(1, (0, typeorm_1.InjectRepository)(stock_transaction_entity_1.StockTransaction)),
    __param(2, (0, typeorm_1.InjectRepository)(inventory_item_entity_1.InventoryItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        inventory_gateway_1.InventoryGateway])
], StockService);
//# sourceMappingURL=stock.service.js.map