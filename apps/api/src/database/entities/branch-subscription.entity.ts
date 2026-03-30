import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'grace'
  | 'suspended'
  | 'cancelled';

@Entity('branch_subscriptions')
export class BranchSubscription extends BaseEntity {
  @Column({ type: 'uuid' })
  branchId!: string;

  @Column({ type: 'uuid' })
  planId!: string;

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status!: SubscriptionStatus;

  @Column({ type: 'timestamptz', nullable: true })
  trialEndsAt!: Date | null;

  @Column({ type: 'timestamptz' })
  currentPeriodStart!: Date;

  @Column({ type: 'timestamptz' })
  currentPeriodEnd!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  cancelledAt!: Date | null;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch!: Branch;

  @ManyToOne(() => SubscriptionPlan, { eager: true })
  @JoinColumn({ name: 'planId' })
  plan!: SubscriptionPlan;
}
