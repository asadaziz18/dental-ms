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
export declare class Prescription extends BaseEntity {
    patientId: string;
    patient: Patient;
    treatmentPlanId: string | null;
    treatmentPlan: TreatmentPlan | null;
    prescribedById: string;
    prescribedBy: User;
    items: PrescriptionItem[];
    notes: string | null;
}
