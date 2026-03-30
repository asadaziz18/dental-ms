import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { StockLevel } from './stock-level.entity';
import { StockTransaction } from './stock-transaction.entity';

@Entity('inventory_items')
@Index(['branchId', 'sku'], { unique: true })
export class InventoryItem extends BaseEntity {
  @Column({ type: 'uuid' })
  branchId!: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch!: Branch;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 80 })
  sku!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category!: string | null;

  @Column({ type: 'varchar', length: 30, default: 'unit' })
  unit!: string;

  @Column({ type: 'int', default: 0 })
  reorderThreshold!: number;

  @OneToMany(() => StockLevel, (sl) => sl.item)
  stockLevels!: StockLevel[];

  @OneToMany(() => StockTransaction, (t) => t.item)
  transactions!: StockTransaction[];
}
