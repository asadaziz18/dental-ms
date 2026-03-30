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
exports.PurchaseOrderLine = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const purchase_order_entity_1 = require("./purchase-order.entity");
const inventory_item_entity_1 = require("./inventory-item.entity");
let PurchaseOrderLine = class PurchaseOrderLine extends base_entity_1.BaseEntity {
    purchaseOrderId;
    purchaseOrder;
    itemId;
    item;
    quantityOrdered;
    quantityReceived;
    unitPrice;
};
exports.PurchaseOrderLine = PurchaseOrderLine;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PurchaseOrderLine.prototype, "purchaseOrderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => purchase_order_entity_1.PurchaseOrder, (po) => po.lines, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'purchaseOrderId' }),
    __metadata("design:type", purchase_order_entity_1.PurchaseOrder)
], PurchaseOrderLine.prototype, "purchaseOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PurchaseOrderLine.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inventory_item_entity_1.InventoryItem, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'itemId' }),
    __metadata("design:type", inventory_item_entity_1.InventoryItem)
], PurchaseOrderLine.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PurchaseOrderLine.prototype, "quantityOrdered", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], PurchaseOrderLine.prototype, "quantityReceived", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], PurchaseOrderLine.prototype, "unitPrice", void 0);
exports.PurchaseOrderLine = PurchaseOrderLine = __decorate([
    (0, typeorm_1.Entity)('purchase_order_lines')
], PurchaseOrderLine);
//# sourceMappingURL=purchase-order-line.entity.js.map