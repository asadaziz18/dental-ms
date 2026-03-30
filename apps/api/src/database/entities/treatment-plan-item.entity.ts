import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TreatmentPlan } from './treatment-plan.entity';
import { Procedure } from './procedure.entity';
import { User } from './user.entity';

export type ToothCondition =
  | 'caries'
  | 'crown'
  | 'rct'
  | 'extraction'
  | 'implant'
  | 'bridge'
  | 'filling'
  | 'healthy'
  | 'missing';

@Entity('treatment_plan_items')
export class TreatmentPlanItem extends BaseEntity {
  @Column({ type: 'uuid' })
  treatmentPlanId!: string;

  @ManyToOne(() => TreatmentPlan, (plan) => plan.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'treatmentPlanId' })
  treatmentPlan!: TreatmentPlan;

  /** FDI tooth number 11-18, 21-28, 31-38, 41-48 */
  @Column({ type: 'smallint' })
  toothNumber!: number;

  @Column({ type: 'uuid' })
  procedureId!: string;

  @ManyToOne(() => Procedure)
  @JoinColumn({ name: 'procedureId' })
  procedure!: Procedure;

  @Column({ type: 'varchar', length: 30, nullable: true })
  conditionTag!: ToothCondition | null;

  @Column({ type: 'varchar', length: 20, default: 'Planned' })
  status!: string;

  @Column({ type: 'uuid', nullable: true })
  doctorId!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'doctorId' })
  doctor!: User | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost!: string | null;

  @Column({ type: 'smallint', default: 0 })
  priority!: number;
}
