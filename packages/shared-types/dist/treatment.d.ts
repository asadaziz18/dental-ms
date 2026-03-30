export type TreatmentPlanStatus = 'Planned' | 'In Progress' | 'Completed';
export type ToothCondition = 'caries' | 'crown' | 'rct' | 'extraction' | 'implant' | 'bridge' | 'filling' | 'healthy' | 'missing';
export interface Procedure {
    id: string;
    code: string;
    name: string;
    description: string | null;
    defaultFee: string;
    createdAt: string;
    updatedAt: string;
}
export interface TreatmentPlanItem {
    id: string;
    treatmentPlanId: string;
    toothNumber: number;
    procedureId: string;
    procedure?: Procedure;
    conditionTag: ToothCondition | null;
    status: string;
    doctorId: string | null;
    doctor?: {
        id: string;
        fullName: string;
    } | null;
    estimatedCost: string | null;
    priority: number;
    createdAt: string;
    updatedAt: string;
}
export interface TreatmentPlan {
    id: string;
    patientId: string;
    branchId: string;
    status: TreatmentPlanStatus;
    doctorId: string | null;
    doctor?: {
        id: string;
        fullName: string;
    } | null;
    clinicalNotes: string | null;
    items?: TreatmentPlanItem[];
    patient?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    updatedAt: string;
}
export interface PrescriptionItem {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}
export interface Prescription {
    id: string;
    patientId: string;
    treatmentPlanId: string | null;
    prescribedById: string;
    prescribedBy?: {
        id: string;
        fullName: string;
    };
    items: PrescriptionItem[];
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=treatment.d.ts.map