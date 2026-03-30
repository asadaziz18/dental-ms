import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Patient } from './patient.entity';
import { User } from './user.entity';
import { TreatmentPlanItem } from './treatment-plan-item.entity';
import { Prescription } from './prescription.entity';

export type TreatmentPlanStatus = 'Planned' | 'In Progress' | 'Completed';

@Entity('treatment_plans')
export class TreatmentPlan extends BaseEntity {
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

  @Column({
    type: 'varchar',
    length: 20,
    default: 'Planned',
  })
  status!: TreatmentPlanStatus;

  @Column({ type: 'uuid', nullable: true })
  doctorId!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'doctorId' })
  doctor!: User | null;

  @Column({ type: 'text', nullable: true })
  clinicalNotes!: string | null;

  @OneToMany(() => TreatmentPlanItem, (item) => item.treatmentPlan)
  items!: TreatmentPlanItem[];

  @OneToMany(() => Prescription, (p) => p.treatmentPlan)
  prescriptions!: Prescription[];
}
