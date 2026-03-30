import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { LabOrder } from './lab-order.entity';
import { LabTrial } from './lab-trial.entity';
import { Patient } from './patient.entity';

export type LabNotificationChannel = 'whatsapp' | 'email';

export type LabNotificationType =
  | 'trial_scheduled'
  | 'trial_reminder'
  | 'order_ready'
  | 'order_delayed'
  | 'delivery_confirmed';

export type LabNotificationStatus = 'sent' | 'failed' | 'pending';

@Entity('lab_notifications')
@Index(['labOrderId'])
@Index(['patientId'])
@Index(['createdAt'])
export class LabNotification extends BaseEntity {
  @Column({ type: 'uuid' })
  labOrderId!: string;

  @ManyToOne(() => LabOrder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'labOrderId' })
  labOrder!: LabOrder;

  @Column({ type: 'uuid', nullable: true })
  labTrialId!: string | null;

  @ManyToOne(() => LabTrial, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'labTrialId' })
  labTrial!: LabTrial | null;

  @Column({ type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient!: Patient;

  @Column({ type: 'varchar', length: 20, enum: ['whatsapp', 'email'] })
  channel!: LabNotificationChannel;

  @Column({
    type: 'varchar',
    length: 32,
    enum: ['trial_scheduled', 'trial_reminder', 'order_ready', 'order_delayed', 'delivery_confirmed'],
  })
  type!: LabNotificationType;

  @Column({ type: 'text' })
  message!: string;

  @Column({
    type: 'varchar',
    length: 16,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending',
  })
  status!: LabNotificationStatus;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string | null;
}
