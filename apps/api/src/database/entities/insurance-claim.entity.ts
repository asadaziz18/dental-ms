import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';
import { Invoice } from './invoice.entity';
import { Branch } from './branch.entity';

export type InsuranceClaimStatus =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'Denied'
  | 'Paid'
  | 'Partial';

@Entity('insurance_claims')
export class InsuranceClaim extends BaseEntity {
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
  invoiceId!: string | null;

  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn({ name: 'invoiceId' })
  invoice!: Invoice | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  claimNumber!: string | null;

  @Column({ type: 'varchar', length: 30, default: 'Draft' })
  status!: InsuranceClaimStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  insuranceProvider!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  submittedAt!: Date | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amountClaimed!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amountApproved!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
