import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '../api';
import type { PatientListQuery, PatientCreateInput, PatientUpdateInput } from '@dental-ms/shared-types';

export const patientsKeys = {
  all: ['patients'] as const,
  lists: () => [...patientsKeys.all, 'list'] as const,
  list: (query: PatientListQuery) => [...patientsKeys.lists(), query] as const,
  details: () => [...patientsKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientsKeys.details(), id] as const,
  timeline: (id: string) => [...patientsKeys.detail(id), 'timeline'] as const,
};

export function usePatientsQuery(query: PatientListQuery) {
  return useQuery({
    queryKey: patientsKeys.list(query),
    queryFn: () => patientsApi.list(query),
    enabled: !!query.branchId,
  });
}

export function usePatientQuery(id: string | undefined | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: patientsKeys.detail(id ?? ''),
    queryFn: () => patientsApi.get(id!),
    enabled: !!id && (options?.enabled !== false),
  });
}

export function usePatientTimelineQuery(patientId: string | undefined | null) {
  return useQuery({
    queryKey: patientsKeys.timeline(patientId ?? ''),
    queryFn: () => patientsApi.getTimeline(patientId!),
    enabled: !!patientId,
  });
}

export function useCreatePatientMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PatientCreateInput) => patientsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: patientsKeys.lists() });
    },
  });
}

export function useUpdatePatientMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PatientUpdateInput) => patientsApi.update(id, body),
    onSuccess: (data) => {
      qc.setQueryData(patientsKeys.detail(data.id), data);
      qc.invalidateQueries({ queryKey: patientsKeys.lists() });
    },
  });
}

export function useDeletePatientMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientsApi.delete(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: patientsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: patientsKeys.lists() });
    },
  });
}
