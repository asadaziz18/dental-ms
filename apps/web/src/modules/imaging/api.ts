import { api } from '@/core/api/client';
import type { ImagingRecord, UpdateImagingInput } from '@dental-ms/shared-types';

const BASE = '/imaging';

export const imagingApi = {
  listByPatient(patientId: string): Promise<ImagingRecord[]> {
    return api.get<ImagingRecord[]>(`${BASE}/patient/${patientId}`).then((r) => r.data);
  },

  get(id: string): Promise<ImagingRecord> {
    return api.get<ImagingRecord>(`${BASE}/${id}`).then((r) => r.data);
  },

  getPresignedUrl(id: string): Promise<{ url: string }> {
    return api.get<{ url: string }>(`${BASE}/${id}/url`).then((r) => r.data);
  },

  upload(patientId: string, file: File, toothNumber?: number | null): Promise<ImagingRecord> {
    const form = new FormData();
    form.append('file', file);
    if (toothNumber != null && toothNumber !== '') form.append('toothNumber', String(toothNumber));
    return api
      .post<ImagingRecord>(`${BASE}/patient/${patientId}/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  update(id: string, dto: UpdateImagingInput): Promise<ImagingRecord> {
    return api.patch<ImagingRecord>(`${BASE}/${id}`, dto).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return api.delete(`${BASE}/${id}`);
  },
};
