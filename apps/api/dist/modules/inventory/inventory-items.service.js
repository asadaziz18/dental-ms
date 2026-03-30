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
exports.InventoryItemsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventory_item_entity_1 = require("../../database/entities/inventory-item.entity");
const stock_level_entity_1 = require("../../database/entities/stock-level.entity");
let InventoryItemsService = class InventoryItemsService {
    itemRepo;
    stockRepo;
    constructor(itemRepo, stockRepo) {
        this.itemRepo = itemRepo;
        this.stockRepo = stockRepo;
    }
    async findByBranch(branchId) {
        return this.itemRepo.find({
            where: { branchId },
            relations: ['stockLevels'],
            order: { name: 'ASC' },
        });
    }
    async findOne(branchId, id) {
        const item = await this.itemRepo.findOne({
            where: { id, branchId },
            relations: ['stockLevels'],
        });
        if (!item)
            throw new common_1.NotFoundException('Inventory item not found');
        return item;
    }
    async create(branchId, dto) {
        const existing = await this.itemRepo.findOne({
            where: { branchId, sku: dto.sku },
        });
        if (existing)
            throw new common_1.BadRequestException(`SKU "${dto.sku}" already exists in this branch`);
        const item = this.itemRepo.create({
            ...dto,
            branchId,
            unit: dto.unit ?? 'unit',
            reorderThreshold: dto.reorderThreshold ?? 0,
        });
        const saved = await this.itemRepo.save(item);
        const level = this.stockRepo.create({
            branchId,
            itemId: saved.id,
            quantity: 0,
        });
        await this.stockRepo.save(level);
        return this.findOne(branchId, saved.id);
    }
    async update(branchId, id, dto) {
        const item = await this.findOne(branchId, id);
        if (dto.sku !== undefined && dto.sku !== item.sku) {
            const existing = await this.itemRepo.findOne({
                where: { branchId, sku: dto.sku },
            });
            if (existing)
                throw new common_1.BadRequestException(`SKU "${dto.sku}" already exists`);
        }
        Object.assign(item, dto);
        return this.itemRepo.save(item);
    }
    async remove(branchId, id) {
        const item = await this.findOne(branchId, id);
        await this.itemRepo.remove(item);
    }
};
exports.InventoryItemsService = InventoryItemsService;
exports.InventoryItemsService = InventoryItemsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_item_entity_1.InventoryItem)),
    __param(1, (0, typeorm_1.InjectRepository)(stock_level_entity_1.StockLevel)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], InventoryItemsService);
//# sourceMappingURL=inventory-items.service.js.map