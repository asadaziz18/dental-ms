import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 60, unique: true })
  slug!: string;
}
