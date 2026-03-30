import { BaseEntity } from './base.entity';
import { Patient } from './patient.entity';
import { Invoice } from './invoice.entity';
import { Branch } from './branch.entity';
export type InsuranceClaimStatus = 'Draft' | 'Submitted' | 'Approved' | 'Denied' | 'Paid' | 'Partial';
export declare class InsuranceClaim extends BaseEntity {
    patientId: string;
    patient: Patient;
    branchId: string;
    branch: Branch;
    invoiceId: string | null;
    invoice: Invoice | null;
    claimNumber: string | null;
    status: InsuranceClaimStatus;
    insuranceProvider: string | null;
    submittedAt: Date | null;
    amountClaimed: string | null;
    amountApproved: string | null;
    notes: string | null;
}
