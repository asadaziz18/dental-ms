"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../../database/entities");
const suppliers_service_1 = require("./suppliers.service");
const inventory_items_service_1 = require("./inventory-items.service");
const stock_service_1 = require("./stock.service");
const purchase_orders_service_1 = require("./purchase-orders.service");
const inventory_gateway_1 = require("./inventory.gateway");
const suppliers_controller_1 = require("./suppliers.controller");
const inventory_items_controller_1 = require("./inventory-items.controller");
const stock_controller_1 = require("./stock.controller");
const purchase_orders_controller_1 = require("./purchase-orders.controller");
let InventoryModule = class InventoryModule {
};
exports.InventoryModule = InventoryModule;
exports.InventoryModule = InventoryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.Supplier,
                entities_1.InventoryItem,
                entities_1.StockLevel,
                entities_1.StockTransaction,
                entities_1.PurchaseOrder,
                entities_1.PurchaseOrderLine,
            ]),
        ],
        controllers: [
            suppliers_controller_1.SuppliersController,
            inventory_items_controller_1.InventoryItemsController,
            stock_controller_1.StockController,
            purchase_orders_controller_1.PurchaseOrdersController,
        ],
        providers: [
            suppliers_service_1.SuppliersService,
            inventory_items_service_1.InventoryItemsService,
            stock_service_1.StockService,
            purchase_orders_service_1.PurchaseOrdersService,
            inventory_gateway_1.InventoryGateway,
        ],
        exports: [
            suppliers_service_1.SuppliersService,
            inventory_items_service_1.InventoryItemsService,
            stock_service_1.StockService,
            purchase_orders_service_1.PurchaseOrdersService,
        ],
    })
], InventoryModule);
//# sourceMappingURL=inventory.module.js.map