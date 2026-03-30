import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

/** Plan limits/features stored as JSON: e.g. { maxPatients: 500, maxStaff: 20, imaging: true } */
export interface PlanFeatures {
  maxPatients?: number;
  maxStaff?: number;
  maxBranches?: number;
  imaging?: boolean;
  reports?: boolean;
  inventory?: boolean;
  [key: string]: unknown;
}

@Entity('subscription_plans')
export class SubscriptionPlan extends BaseEntity {
  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 60, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceMonthly!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceYearly!: string;

  @Column({ type: 'varchar', length: 20, default: 'month' })
  billingInterval!: 'month' | 'year';

  @Column({ type: 'jsonb', nullable: true })
  features!: PlanFeatures | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;
}
