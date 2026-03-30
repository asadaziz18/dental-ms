import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { InventoryItem } from './inventory-item.entity';

export type StockTransactionType = 'in' | 'out';

export type StockTransactionReference =
  | 'purchase'
  | 'usage'
  | 'adjustment';

@Entity('stock_transactions')
export class StockTransaction extends BaseEntity {
  @Column({ type: 'uuid' })
  branchId!: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch!: Branch;

  @Column({ type: 'uuid' })
  itemId!: string;

  @ManyToOne(() => InventoryItem, (item) => item.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item!: InventoryItem;

  @Column({ type: 'varchar', length: 10 })
  type!: StockTransactionType;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'varchar', length: 30, nullable: true })
  referenceType!: StockTransactionReference | null;

  @Column({ type: 'uuid', nullable: true })
  referenceId!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
