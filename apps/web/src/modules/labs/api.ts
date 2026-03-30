import { api } from '@/core/api/client';
import type {
  LabVendor,
  LabVendorCreateInput,
  LabVendorUpdateInput,
  LabOrder,
  LabOrderCreateInput,
  LabOrderUpdateInput,
  LabOrderListQuery,
  LabOrderListResult,
  LabDashboardStats,
  LabTrial,
} from '@dental-ms/shared-types';

const VENDORS_BASE = '/lab/vendors';
const ORDERS_BASE = '/lab/orders';

export const labVendorsApi = {
  list(params?: { isActive?: string; city?: string; specialization?: string }): Promise<LabVendor[]> {
    const search = new URLSearchParams();
    if (params?.isActive) search.set('isActive', params.isActive);
    if (params?.city) search.set('city', params.city);
    if (params?.specialization) search.set('specialization', params.specialization);
    const q = search.toString();
    return api.get<LabVendor[]>(`${VENDORS_BASE}${q ? `?${q}` : ''}`).then((r) => r.data);
  },

  get(id: string): Promise<{ vendor: LabVendor; activeOrdersCount: number }> {
    return api.get<{ vendor: LabVendor; activeOrdersCount: number }>(`${VENDORS_BASE}/${id}`).then((r) => r.data);
  },

  create(body: LabVendorCreateInput): Promise<LabVendor> {
    return api.post<LabVendor>(VENDORS_BASE, body).then((r) => r.data);
  },

  update(id: string, body: LabVendorUpdateInput): Promise<LabVendor> {
    return api.patch<LabVendor>(`${VENDORS_BASE}/${id}`, body).then((r) => r.data);
  },

  updateStatus(id: string, isActive: boolean): Promise<LabVendor> {
    return api.patch<LabVendor>(`${VENDORS_BASE}/${id}/status`, { isActive }).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return api.delete(`${VENDORS_BASE}/${id}`);
  },
};

export const labOrdersApi = {
  getDashboard(): Promise<LabDashboardStats> {
    return api.get<LabDashboardStats>(`${ORDERS_BASE}/dashboard`).then((r) => r.data);
  },

  list(query: LabOrderListQuery): Promise<LabOrderListResult> {
    const params = new URLSearchParams();
    if (query.patientId) params.set('patientId', query.patientId);
    if (query.vendorId) params.set('vendorId', query.vendorId);
    if (query.status) params.set('status', query.status);
    if (query.branchId) params.set('branchId', query.branchId);
    if (query.from) params.set('from', query.from);
    if (query.to) params.set('to', query.to);
    if (query.priority) params.set('priority', query.priority);
    if (query.doctorId) params.set('doctorId', query.doctorId);
    if (query.page != null) params.set('page', String(query.page));
    if (query.limit != null) params.set('limit', String(query.limit));
    if (query.search) params.set('search', query.search);
    return api.get<LabOrderListResult>(`${ORDERS_BASE}?${params}`).then((r) => r.data);
  },

  get(id: string): Promise<LabOrder> {
    return api.get<LabOrder>(`${ORDERS_BASE}/${id}`).then((r) => r.data);
  },

  create(body: LabOrderCreateInput): Promise<LabOrder> {
    return api.post<LabOrder>(ORDERS_BASE, body).then((r) => r.data);
  },

  update(id: string, body: LabOrderUpdateInput): Promise<LabOrder> {
    return api.patch<LabOrder>(`${ORDERS_BASE}/${id}`, body).then((r) => r.data);
  },

  updateStatus(id: string, status: LabOrder['status'], reason?: string): Promise<LabOrder> {
    return api.patch<LabOrder>(`${ORDERS_BASE}/${id}/status`, { status, reason }).then((r) => r.data);
  },

  updatePayment(id: string, isPaid: boolean, labFee?: number | null): Promise<LabOrder> {
    return api.patch<LabOrder>(`${ORDERS_BASE}/${id}/payment`, { isPaid, labFee }).then((r) => r.data);
  },

  getTrials(orderId: string): Promise<LabTrial[]> {
    return api.get<LabTrial[]>(`${ORDERS_BASE}/${orderId}/trials`).then((r) => r.data);
  },

  createTrial(
    orderId: string,
    body: { trialDate: string; doctorNotes?: string; labInstructions?: string; notifyPatient?: boolean; channel?: 'whatsapp' | 'email' | 'both' },
  ): Promise<LabTrial> {
    return api.post<LabTrial>(`${ORDERS_BASE}/${orderId}/trials`, body).then((r) => r.data);
  },

  updateTrial(
    orderId: string,
    trialId: string,
    body: { trialDate?: string; doctorNotes?: string; labInstructions?: string },
  ): Promise<LabTrial> {
    return api.patch<LabTrial>(`${ORDERS_BASE}/${orderId}/trials/${trialId}`, body).then((r) => r.data);
  },

  completeTrial(
    orderId: string,
    trialId: string,
    body: {
      completedAt: string;
      outcome: 'approved' | 'adjustments_needed' | 'rejected';
      doctorNotes: string;
      labInstructions?: string | null;
      attachments?: string[];
    },
  ): Promise<LabTrial> {
    return api.patch<LabTrial>(`${ORDERS_BASE}/${orderId}/trials/${trialId}/complete`, body).then((r) => r.data);
  },

  notifyTrial(
    orderId: string,
    trialId: string,
    body: { channel: 'whatsapp' | 'email' | 'both'; message?: string },
  ): Promise<void> {
    return api.post(`${ORDERS_BASE}/${orderId}/trials/${trialId}/notify`, body);
  },
};
