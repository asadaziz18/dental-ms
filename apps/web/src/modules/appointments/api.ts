import { api } from '@/core/api/client';
import type {
  Appointment,
  AppointmentCreateInput,
  AppointmentListQuery,
} from '@dental-ms/shared-types';

const BASE = '/appointments';

export const appointmentsApi = {
  list(query: AppointmentListQuery): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (query.branchId) params.set('branchId', query.branchId);
    if (query.date) params.set('date', query.date);
    if (query.doctorId) params.set('doctorId', query.doctorId);
    if (query.start) params.set('start', query.start);
    if (query.end) params.set('end', query.end);
    return api.get<Appointment[]>(`${BASE}?${params}`).then((r) => r.data);
  },

  get(id: string): Promise<Appointment> {
    return api.get<Appointment>(`${BASE}/${id}`).then((r) => r.data);
  },

  create(body: AppointmentCreateInput): Promise<Appointment> {
    return api.post<Appointment>(BASE, body).then((r) => r.data);
  },

  updateStatus(id: string, status: string): Promise<Appointment> {
    return api.patch<Appointment>(`${BASE}/${id}/status`, { status }).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return api.delete(`${BASE}/${id}`);
  },

  getDoctors(): Promise<{ id: string; fullName: string }[]> {
    return api.get<{ id: string; fullName: string }[]>(`${BASE}/doctors`).then((r) => r.data);
  },
};
