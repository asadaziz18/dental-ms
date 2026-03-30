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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryItem = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const branch_entity_1 = require("./branch.entity");
const stock_level_entity_1 = require("./stock-level.entity");
const stock_transaction_entity_1 = require("./stock-transaction.entity");
let InventoryItem = class InventoryItem extends base_entity_1.BaseEntity {
    branchId;
    branch;
    name;
    sku;
    category;
    unit;
    reorderThreshold;
    stockLevels;
    transactions;
};
exports.InventoryItem = InventoryItem;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], InventoryItem.prototype, "branchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_entity_1.Branch, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'branchId' }),
    __metadata("design:type", branch_entity_1.Branch)
], InventoryItem.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], InventoryItem.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 80 }),
    __metadata("design:type", String)
], InventoryItem.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], InventoryItem.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, default: 'unit' }),
    __metadata("design:type", String)
], InventoryItem.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "reorderThreshold", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => stock_level_entity_1.StockLevel, (sl) => sl.item),
    __metadata("design:type", Array)
], InventoryItem.prototype, "stockLevels", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => stock_transaction_entity_1.StockTransaction, (t) => t.item),
    __metadata("design:type", Array)
], InventoryItem.prototype, "transactions", void 0);
exports.InventoryItem = InventoryItem = __decorate([
    (0, typeorm_1.Entity)('inventory_items'),
    (0, typeorm_1.Index)(['branchId', 'sku'], { unique: true })
], InventoryItem);
//# sourceMappingURL=inventory-item.entity.js.map