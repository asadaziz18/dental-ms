import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Supplier } from './supplier.entity';
import { PurchaseOrderLine } from './purchase-order-line.entity';

export type PurchaseOrderStatus = 'Draft' | 'Submitted' | 'PartiallyReceived' | 'Received' | 'Cancelled';

@Entity('purchase_orders')
export class PurchaseOrder extends BaseEntity {
  @Column({ type: 'uuid' })
  branchId!: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch!: Branch;

  @Column({ type: 'uuid' })
  supplierId!: string;

  @ManyToOne(() => Supplier, (s) => s.purchaseOrders, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplierId' })
  supplier!: Supplier;

  @Column({ type: 'varchar', length: 50, nullable: true })
  orderNumber!: string | null;

  @Column({ type: 'varchar', length: 30, default: 'Draft' })
  status!: PurchaseOrderStatus;

  @Column({ type: 'date', nullable: true })
  expectedDate!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @OneToMany(() => PurchaseOrderLine, (line) => line.purchaseOrder, { cascade: true })
  lines!: PurchaseOrderLine[];
}
