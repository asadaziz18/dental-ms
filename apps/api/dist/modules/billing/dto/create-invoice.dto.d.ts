export declare class CreateInvoiceDto {
    patientId: string;
    treatmentPlanId?: string | null;
    doctorId?: string | null;
    status?: string;
    dueDate?: string | null;
    taxRatePercent?: number;
    notes?: string | null;
}
