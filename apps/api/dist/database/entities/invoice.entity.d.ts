import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Patient } from './patient.entity';
import { TreatmentPlan } from './treatment-plan.entity';
import { User } from './user.entity';
import { InvoiceLineItem } from './invoice-line-item.entity';
import { Payment } from './payment.entity';
export type InvoiceStatus = 'Draft' | 'Sent' | 'PartiallyPaid' | 'Paid' | 'Overdue' | 'Cancelled';
export declare class Invoice extends BaseEntity {
    patientId: string;
    patient: Patient;
    branchId: string;
    branch: Branch;
    treatmentPlanId: string | null;
    treatmentPlan: TreatmentPlan | null;
    doctorId: string | null;
    doctor: User | null;
    invoiceNumber: string | null;
    status: InvoiceStatus;
    dueDate: string | null;
    subtotal: string;
    discountAmount: string;
    taxRatePercent: string;
    taxAmount: string;
    total: string;
    notes: string | null;
    lineItems: InvoiceLineItem[];
    payments: Payment[];
}
