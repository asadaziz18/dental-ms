import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imagingApi } from '../api';
import type { UpdateImagingInput } from '@dental-ms/shared-types';
import { db } from '@/core/db/schema';

export const imagingKeys = {
  all: ['imaging'] as const,
  list: (patientId: string) => [...imagingKeys.all, 'list', patientId] as const,
  detail: (id: string) => [...imagingKeys.all, 'detail', id] as const,
  url: (id: string) => [...imagingKeys.detail(id), 'url'] as const,
};

export function useImagingByPatientQuery(patientId: string | undefined | null) {
  return useQuery({
    queryKey: imagingKeys.list(patientId ?? ''),
    queryFn: () => imagingApi.listByPatient(patientId!),
    enabled: !!patientId,
  });
}

export function useImagingQuery(id: string | undefined | null) {
  return useQuery({
    queryKey: imagingKeys.detail(id ?? ''),
    queryFn: () => imagingApi.get(id!),
    enabled: !!id,
  });
}

export function usePresignedUrlQuery(id: string | undefined | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: imagingKeys.url(id ?? ''),
    queryFn: () => imagingApi.getPresignedUrl(id!).then((r) => r.url),
    enabled: !!id && (options?.enabled !== false),
  });
}

export function useUploadImagingMutation(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, toothNumber }: { file: File; toothNumber?: number | null }) =>
      imagingApi.upload(patientId, file, toothNumber),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: imagingKeys.list(patientId) });
    },
  });
}

export function useUpdateImagingMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateImagingInput) => imagingApi.update(id, dto),
    onSuccess: (data) => {
      qc.setQueryData(imagingKeys.detail(data.id), data);
      qc.invalidateQueries({ queryKey: imagingKeys.list(data.patientId) });
    },
  });
}

export function useDeleteImagingMutation(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => imagingApi.delete(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: imagingKeys.detail(id) });
      qc.invalidateQueries({ queryKey: imagingKeys.list(patientId) });
    },
  });
}

/** Get thumbnail from IndexedDB or return null */
export async function getThumbnailFromCache(imagingId: string): Promise<string | null> {
  const row = await db.imagingThumbnails.where('imagingId').equals(imagingId).first();
  return row?.dataUrl ?? null;
}

/** Save thumbnail data URL to IndexedDB */
export async function setThumbnailCache(imagingId: string, dataUrl: string): Promise<void> {
  const existing = await db.imagingThumbnails.where('imagingId').equals(imagingId).first();
  const record = { imagingId, dataUrl, updatedAt: new Date().toISOString() };
  if (existing?.id != null) {
    await db.imagingThumbnails.update(existing.id, record);
  } else {
    await db.imagingThumbnails.add(record);
  }
}
