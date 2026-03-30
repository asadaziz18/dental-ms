import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';
import { TreatmentPlan } from './treatment-plan.entity';
import { User } from './user.entity';

export interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

@Entity('prescriptions')
export class Prescription extends BaseEntity {
  @Column({ type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient!: Patient;

  @Column({ type: 'uuid', nullable: true })
  treatmentPlanId!: string | null;

  @ManyToOne(() => TreatmentPlan, (plan) => plan.prescriptions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'treatmentPlanId' })
  treatmentPlan!: TreatmentPlan | null;

  @Column({ type: 'uuid' })
  prescribedById!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'prescribedById' })
  prescribedBy!: User;

  @Column({ type: 'jsonb', default: [] })
  items!: PrescriptionItem[];

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
