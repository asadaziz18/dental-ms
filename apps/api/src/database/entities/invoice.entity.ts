import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Patient } from './patient.entity';
import { TreatmentPlan } from './treatment-plan.entity';
import { User } from './user.entity';
import { InvoiceLineItem } from './invoice-line-item.entity';
import { Payment } from './payment.entity';

export type InvoiceStatus =
  | 'Draft'
  | 'Sent'
  | 'PartiallyPaid'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled';

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient!: Patient;

  @Column({ type: 'uuid' })
  branchId!: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch!: Branch;

  @Column({ type: 'uuid', nullable: true })
  treatmentPlanId!: string | null;

  @ManyToOne(() => TreatmentPlan, { nullable: true })
  @JoinColumn({ name: 'treatmentPlanId' })
  treatmentPlan!: TreatmentPlan | null;

  @Column({ type: 'uuid', nullable: true })
  doctorId!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'doctorId' })
  doctor!: User | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  invoiceNumber!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'Draft' })
  status!: InvoiceStatus;

  @Column({ type: 'date', nullable: true })
  dueDate!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRatePercent!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @OneToMany(() => InvoiceLineItem, (line) => line.invoice, { cascade: true })
  lineItems!: InvoiceLineItem[];

  @OneToMany(() => Payment, (p) => p.invoice)
  payments!: Payment[];
}
