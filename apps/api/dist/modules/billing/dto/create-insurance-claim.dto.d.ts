export declare class CreateInsuranceClaimDto {
    patientId: string;
    invoiceId?: string | null;
    claimNumber?: string | null;
    status?: string;
    insuranceProvider?: string | null;
    submittedAt?: string | null;
    amountClaimed?: number | null;
    amountApproved?: number | null;
    notes?: string | null;
}
