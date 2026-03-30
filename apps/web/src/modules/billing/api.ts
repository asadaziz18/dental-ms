import { api } from '@/core/api/client';
import type {
  Invoice,
  InvoiceLineItem,
  Payment,
  InsuranceClaim,
  OutstandingBalance,
} from '@dental-ms/shared-types';

const INVOICES_BASE = '/invoices';
const PAYMENTS_BASE = '/payments';
const CLAIMS_BASE = '/insurance/claims';

export interface CreateInvoiceInput {
  patientId: string;
  treatmentPlanId?: string | null;
  status?: string;
  dueDate?: string | null;
  taxRatePercent?: number;
  notes?: string | null;
}

export interface UpdateInvoiceInput {
  status?: string;
  dueDate?: string | null;
  taxRatePercent?: number;
  notes?: string | null;
}

export interface CreateInvoiceLineItemInput {
  procedureId?: string | null;
  description: string;
  quantity?: number;
  unitPrice: number;
  discountAmount?: number;
}

export interface UpdateInvoiceLineItemInput {
  procedureId?: string | null;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  discountAmount?: number;
}

export interface CreatePaymentInput {
  invoiceId: string;
  amount: number;
  method: 'Cash' | 'Card' | 'Insurance' | 'Partial' | 'Other';
  reference?: string | null;
  paidAt?: string;
}

export interface CreateInsuranceClaimInput {
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

export interface UpdateInsuranceClaimInput {
  claimNumber?: string | null;
  status?: string;
  insuranceProvider?: string | null;
  submittedAt?: string | null;
  amountClaimed?: number | null;
  amountApproved?: number | null;
  notes?: string | null;
}

export const invoicesApi = {
  getBalance(patientId: string): Promise<OutstandingBalance> {
    return api
      .get<OutstandingBalance>(`${INVOICES_BASE}/patient/${patientId}/balance`)
      .then((r) => r.data);
  },

  listByPatient(patientId: string): Promise<Invoice[]> {
    return api
      .get<Invoice[]>(`${INVOICES_BASE}/patient/${patientId}`)
      .then((r) => r.data);
  },

  get(id: string): Promise<Invoice> {
    return api.get<Invoice>(`${INVOICES_BASE}/${id}`).then((r) => r.data);
  },

  create(body: CreateInvoiceInput): Promise<Invoice> {
    return api.post<Invoice>(INVOICES_BASE, body).then((r) => r.data);
  },

  update(id: string, body: UpdateInvoiceInput): Promise<Invoice> {
    return api.patch<Invoice>(`${INVOICES_BASE}/${id}`, body).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return api.delete(`${INVOICES_BASE}/${id}`);
  },

  addLineItem(
    invoiceId: string,
    body: CreateInvoiceLineItemInput,
  ): Promise<InvoiceLineItem> {
    return api
      .post<InvoiceLineItem>(`${INVOICES_BASE}/${invoiceId}/line-items`, body)
      .then((r) => r.data);
  },

  updateLineItem(
    invoiceId: string,
    itemId: string,
    body: UpdateInvoiceLineItemInput,
  ): Promise<InvoiceLineItem> {
    return api
      .patch<InvoiceLineItem>(
        `${INVOICES_BASE}/${invoiceId}/line-items/${itemId}`,
        body,
      )
      .then((r) => r.data);
  },

  removeLineItem(invoiceId: string, itemId: string): Promise<void> {
    return api.delete(`${INVOICES_BASE}/${invoiceId}/line-items/${itemId}`);
  },
};

export const paymentsApi = {
  listByInvoice(invoiceId: string): Promise<Payment[]> {
    return api
      .get<Payment[]>(`${PAYMENTS_BASE}/invoice/${invoiceId}`)
      .then((r) => r.data);
  },

  create(body: CreatePaymentInput): Promise<Payment> {
    return api.post<Payment>(PAYMENTS_BASE, body).then((r) => r.data);
  },
};

export const insuranceClaimsApi = {
  listByPatient(patientId: string): Promise<InsuranceClaim[]> {
    return api
      .get<InsuranceClaim[]>(`${CLAIMS_BASE}/patient/${patientId}`)
      .then((r) => r.data);
  },

  get(id: string): Promise<InsuranceClaim> {
    return api.get<InsuranceClaim>(`${CLAIMS_BASE}/${id}`).then((r) => r.data);
  },

  create(body: CreateInsuranceClaimInput): Promise<InsuranceClaim> {
    return api.post<InsuranceClaim>(CLAIMS_BASE, body).then((r) => r.data);
  },

  update(
    id: string,
    body: UpdateInsuranceClaimInput,
  ): Promise<InsuranceClaim> {
    return api
      .patch<InsuranceClaim>(`${CLAIMS_BASE}/${id}`, body)
      .then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return api.delete(`${CLAIMS_BASE}/${id}`);
  },
};
