import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export type SubscriptionInvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';

@Entity('subscription_invoices')
export class SubscriptionInvoice extends BaseEntity {
  @Column({ type: 'uuid' })
  branchId!: string;

  @Column({ type: 'uuid' })
  planId!: string;

  @Column({ type: 'varchar', length: 60, unique: true })
  invoiceNumber!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 20, default: 'sent' })
  status!: SubscriptionInvoiceStatus;

  @Column({ type: 'date' })
  dueDate!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  periodStart!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  periodEnd!: Date | null;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch!: Branch;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'planId' })
  plan!: SubscriptionPlan;
}
