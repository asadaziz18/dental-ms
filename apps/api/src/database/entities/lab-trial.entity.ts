import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { LabOrder } from './lab-order.entity';
import { User } from './user.entity';

export type LabTrialStatus = 'scheduled' | 'completed' | 'missed';

export type LabTrialOutcome = 'approved' | 'adjustments_needed' | 'rejected';

@Entity('lab_trials')
@Index(['labOrderId'])
@Index(['trialDate'])
export class LabTrial extends BaseEntity {
  @Column({ type: 'uuid' })
  labOrderId!: string;

  @ManyToOne(() => LabOrder, (o) => o.trials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'labOrderId' })
  labOrder!: LabOrder;

  @Column({ type: 'int' })
  trialNumber!: number;

  @Column({ type: 'date' })
  trialDate!: Date;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ['scheduled', 'completed', 'missed'],
    default: 'scheduled',
  })
  status!: LabTrialStatus;

  @Column({
    type: 'varchar',
    length: 24,
    nullable: true,
    enum: ['approved', 'adjustments_needed', 'rejected'],
  })
  outcome!: LabTrialOutcome | null;

  @Column({ type: 'text', nullable: true })
  doctorNotes!: string | null;

  @Column({ type: 'text', nullable: true })
  labInstructions!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  completedBy!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'completedBy' })
  completedByUser!: User | null;

  @Column({ type: 'jsonb', default: [] })
  attachments!: string[];

  @Column({ type: 'boolean', default: false })
  patientNotified!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  patientNotifiedAt!: Date | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  patientNotificationChannel!: string | null; // 'whatsapp' | 'email' | 'both'
}
