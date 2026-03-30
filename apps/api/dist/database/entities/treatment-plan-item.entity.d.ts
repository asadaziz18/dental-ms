import { BaseEntity } from './base.entity';
import { TreatmentPlan } from './treatment-plan.entity';
import { Procedure } from './procedure.entity';
import { User } from './user.entity';
export type ToothCondition = 'caries' | 'crown' | 'rct' | 'extraction' | 'implant' | 'bridge' | 'filling' | 'healthy' | 'missing';
export declare class TreatmentPlanItem extends BaseEntity {
    treatmentPlanId: string;
    treatmentPlan: TreatmentPlan;
    toothNumber: number;
    procedureId: string;
    procedure: Procedure;
    conditionTag: ToothCondition | null;
    status: string;
    doctorId: string | null;
    doctor: User | null;
    estimatedCost: string | null;
    priority: number;
}
