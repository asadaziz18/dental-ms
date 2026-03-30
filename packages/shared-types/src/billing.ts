export type InvoiceStatus =
  | 'Draft'
  | 'Sent'
  | 'PartiallyPaid'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled';

export type PaymentMethod = 'Cash' | 'Card' | 'Insurance' | 'Partial' | 'Other';

export type InsuranceClaimStatus =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'Denied'
  | 'Paid'
  | 'Partial';

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  procedureId: string | null;
  procedure?: { id: string; code: string; name: string } | null;
  description: string;
  quantity: string;
  unitPrice: string;
  discountAmount: string;
  lineTotal: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  branchId: string;
  amount: string;
  method: PaymentMethod;
  reference: string | null;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  branchId: string;
  treatmentPlanId: string | null;
  invoiceNumber: string | null;
  status: InvoiceStatus;
  dueDate: string | null;
  subtotal: string;
  discountAmount: string;
  taxRatePercent: string;
  taxAmount: string;
  total: string;
  notes: string | null;
  lineItems?: InvoiceLineItem[];
  payments?: Payment[];
  patient?: { id: string; firstName: string; lastName: string };
  treatmentPlan?: { id: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceClaim {
  id: string;
  patientId: string;
  branchId: string;
  invoiceId: string | null;
  claimNumber: string | null;
  status: InsuranceClaimStatus;
  insuranceProvider: string | null;
  submittedAt: string | null;
  amountClaimed: string | null;
  amountApproved: string | null;
  notes: string | null;
  invoice?: { id: string; total: string } | null;
  patient?: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface OutstandingBalance {
  total: number;
  paid: number;
  outstanding: number;
}
