import { api } from '@/core/api/client';
import type {
  Patient,
  PatientCreateInput,
  PatientUpdateInput,
  PatientListQuery,
  PatientListResult,
  PatientTimelineResult,
} from '@dental-ms/shared-types';

const BASE = '/patients';

export const patientsApi = {
  list(query: PatientListQuery): Promise<PatientListResult> {
    const params = new URLSearchParams();
    if (query.search) params.set('search', query.search);
    if (query.page != null) params.set('page', String(query.page));
    if (query.limit != null) params.set('limit', String(query.limit));
    if (query.branchId) params.set('branchId', query.branchId);
    return api.get<PatientListResult>(`${BASE}?${params}`).then((r) => r.data);
  },

  get(id: string): Promise<Patient> {
    return api.get<Patient>(`${BASE}/${id}`).then((r) => r.data);
  },

  create(body: PatientCreateInput): Promise<Patient> {
    return api.post<Patient>(BASE, body).then((r) => r.data);
  },

  update(id: string, body: PatientUpdateInput): Promise<Patient> {
    return api.patch<Patient>(`${BASE}/${id}`, body).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return api.delete(`${BASE}/${id}`);
  },

  getTimeline(patientId: string): Promise<PatientTimelineResult> {
    return api
      .get<PatientTimelineResult>(`${BASE}/${patientId}/timeline`)
      .then((r) => r.data);
  },
};
