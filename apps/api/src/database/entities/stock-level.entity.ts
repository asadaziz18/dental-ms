import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { InventoryItem } from './inventory-item.entity';

@Entity('stock_levels')
@Unique(['branchId', 'itemId'])
export class StockLevel extends BaseEntity {
  @Column({ type: 'uuid' })
  branchId!: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch!: Branch;

  @Column({ type: 'uuid' })
  itemId!: string;

  @ManyToOne(() => InventoryItem, (item) => item.stockLevels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item!: InventoryItem;

  @Column({ type: 'int', default: 0 })
  quantity!: number;
}
