import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Patient } from './patient.entity';
import { User } from './user.entity';

export type AppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'No-Show';

export type AppointmentType = 'consultation' | 'procedure' | 'follow-up';

@Entity('appointments')
@Index(['branchId', 'start'])
@Index(['doctorId', 'start'])
export class Appointment extends BaseEntity {
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

  @Column({ type: 'uuid', nullable: true })
  doctorId!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'doctorId' })
  doctor!: User | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  chair!: string | null;

  @Column({ type: 'timestamptz' })
  start!: Date;

  @Column({ type: 'timestamptz' })
  end!: Date;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ['consultation', 'procedure', 'follow-up'],
  })
  type!: AppointmentType;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No-Show'],
  })
  status!: AppointmentStatus;

  @Column({ type: 'boolean', default: true })
  sendReminder!: boolean;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
