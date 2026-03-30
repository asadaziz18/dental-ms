import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';

@Entity('branches')
@Index(['tenantId', 'code'], { unique: true })
@Index(['parentBranchId'])
export class Branch extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  tenantId!: string | null;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant!: Tenant;

  @Column({ type: 'uuid', nullable: true })
  parentBranchId!: string | null;

  @ManyToOne(() => Branch, (b) => b.subBranches, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentBranchId' })
  parentBranch!: Branch | null;

  @OneToMany(() => Branch, (b) => b.parentBranch)
  subBranches!: Branch[];

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  code!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ type: 'uuid', nullable: true })
  managerUserId!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'managerUserId' })
  manager!: User | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 5, nullable: true })
  openingTime!: string | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  closingTime!: string | null;

  @Column({ type: 'jsonb', default: [], nullable: true })
  workingDays!: string[] | null;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
