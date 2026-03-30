import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Patient } from './patient.entity';
import { User } from './user.entity';
import { TreatmentPlanItem } from './treatment-plan-item.entity';
import { Prescription } from './prescription.entity';
export type TreatmentPlanStatus = 'Planned' | 'In Progress' | 'Completed';
export declare class TreatmentPlan extends BaseEntity {
    patientId: string;
    patient: Patient;
    branchId: string;
    branch: Branch;
    status: TreatmentPlanStatus;
    doctorId: string | null;
    doctor: User | null;
    clinicalNotes: string | null;
    items: TreatmentPlanItem[];
    prescriptions: Prescription[];
}
