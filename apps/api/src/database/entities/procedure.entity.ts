import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('procedures')
export class Procedure extends BaseEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  defaultFee!: string;
}
