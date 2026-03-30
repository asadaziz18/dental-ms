export declare class PrescriptionItemDto {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}
export declare class CreatePrescriptionDto {
    patientId: string;
    treatmentPlanId?: string | null;
    items: PrescriptionItemDto[];
    notes?: string | null;
}
