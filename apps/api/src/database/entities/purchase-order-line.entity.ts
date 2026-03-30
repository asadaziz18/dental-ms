import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { InventoryItem } from './inventory-item.entity';

@Entity('purchase_order_lines')
export class PurchaseOrderLine extends BaseEntity {
  @Column({ type: 'uuid' })
  purchaseOrderId!: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder!: PurchaseOrder;

  @Column({ type: 'uuid' })
  itemId!: string;

  @ManyToOne(() => InventoryItem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'itemId' })
  item!: InventoryItem;

  @Column({ type: 'int' })
  quantityOrdered!: number;

  @Column({ type: 'int', default: 0 })
  quantityReceived!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  unitPrice!: string | null;
}
