import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Tenant } from './tenant.entity';
import { Branch } from './branch.entity';
import { Patient } from './patient.entity';
import { User } from './user.entity';
import { LabVendor } from './lab-vendor.entity';
import { TreatmentPlan } from './treatment-plan.entity';
import { LabTrial } from './lab-trial.entity';
import { LabNotification } from './lab-notification.entity';

export type LabOrderWorkType =
  | 'crown_bridge'
  | 'denture'
  | 'orthodontic'
  | 'veneer_laminate'
  | 'implant'
  | 'custom';

export type LabOrderStatus =
  | 'draft'
  | 'sent_to_lab'
  | 'trial_scheduled'
  | 'trial_in_progress'
  | 'approved'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export type LabOrderPriority = 'normal' | 'urgent';

@Entity('lab_orders')
@Index(['tenantId'])
@Index(['branchId'])
@Index(['patientId'])
@Index(['vendorId'])
@Index(['status'])
@Index(['sentToLabAt'])
export class LabOrder extends BaseEntity {
  @Column({ type: 'uuid' })
  tenantId!: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant!: Tenant;

  @Column({ type: 'uuid' })
  branchId!: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch!: Branch;

  @Column({ type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient!: Patient;

  @Column({ type: 'uuid' })
  doctorId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'doctorId' })
  doctor!: User;

  @Column({ type: 'uuid' })
  vendorId!: string;

  @ManyToOne(() => LabVendor, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vendorId' })
  vendor!: LabVendor;

  @Column({ type: 'uuid', nullable: true })
  treatmentId!: string | null;

  @ManyToOne(() => TreatmentPlan, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'treatmentId' })
  treatment!: TreatmentPlan | null;

  @Column({ type: 'varchar', length: 32, unique: true })
  orderNumber!: string;

  @Column({
    type: 'varchar',
    length: 32,
    enum: ['crown_bridge', 'denture', 'orthodontic', 'veneer_laminate', 'implant', 'custom'],
  })
  workType!: LabOrderWorkType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  customWorkType!: string | null;

  @Column({ type: 'jsonb', default: [] })
  toothNumbers!: string[];

  @Column({ type: 'varchar', length: 20, nullable: true })
  shade!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material!: string | null;

  @Column({ type: 'text', nullable: true })
  instructions!: string | null;

  @Column({
    type: 'varchar',
    length: 32,
    enum: [
      'draft',
      'sent_to_lab',
      'trial_scheduled',
      'trial_in_progress',
      'approved',
      'delivered',
      'cancelled',
      'rejected',
    ],
    default: 'draft',
  })
  status!: LabOrderStatus;

  @Column({
    type: 'varchar',
    length: 16,
    enum: ['normal', 'urgent'],
    default: 'normal',
  })
  priority!: LabOrderPriority;

  @Column({ type: 'timestamptz', nullable: true })
  sentToLabAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  expectedTrialDate!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  finalDeliveryDate!: Date | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  labFee!: string | null;

  @Column({ type: 'boolean', default: false })
  isPaid!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt!: Date | null;

  @Column({ type: 'jsonb', default: [] })
  attachments!: string[];

  @Column({ type: 'uuid' })
  createdBy!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  createdByUser!: User | null;

  @OneToMany(() => LabTrial, (t) => t.labOrder)
  trials!: LabTrial[];

  @OneToMany(() => LabNotification, (n) => n.labOrder)
  notifications!: LabNotification[];
}
