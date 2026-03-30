import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Supplier,
  InventoryItem,
  StockLevel,
  StockTransaction,
  PurchaseOrder,
  PurchaseOrderLine,
} from '../../database/entities';
import { SuppliersService } from './suppliers.service';
import { InventoryItemsService } from './inventory-items.service';
import { StockService } from './stock.service';
import { PurchaseOrdersService } from './purchase-orders.service';
import { InventoryGateway } from './inventory.gateway';
import { SuppliersController } from './suppliers.controller';
import { InventoryItemsController } from './inventory-items.controller';
import { StockController } from './stock.controller';
import { PurchaseOrdersController } from './purchase-orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Supplier,
      InventoryItem,
      StockLevel,
      StockTransaction,
      PurchaseOrder,
      PurchaseOrderLine,
    ]),
  ],
  controllers: [
    SuppliersController,
    InventoryItemsController,
    StockController,
    PurchaseOrdersController,
  ],
  providers: [
    SuppliersService,
    InventoryItemsService,
    StockService,
    PurchaseOrdersService,
    InventoryGateway,
  ],
  exports: [
    SuppliersService,
    InventoryItemsService,
    StockService,
    PurchaseOrdersService,
  ],
})
export class InventoryModule {}
