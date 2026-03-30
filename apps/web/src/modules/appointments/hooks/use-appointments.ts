import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '../api';
import type { AppointmentListQuery, AppointmentCreateInput } from '@dental-ms/shared-types';

export const appointmentsKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentsKeys.all, 'list'] as const,
  list: (query: AppointmentListQuery) => [...appointmentsKeys.lists(), query] as const,
  details: () => [...appointmentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentsKeys.details(), id] as const,
  doctors: (branchId: string | null | undefined) => [...appointmentsKeys.all, 'doctors', branchId] as const,
};

export function useAppointmentsQuery(query: AppointmentListQuery) {
  return useQuery({
    queryKey: appointmentsKeys.list(query),
    queryFn: () => appointmentsApi.list(query),
    enabled: !!query.branchId,
  });
}

export function useAppointmentQuery(id: string | undefined | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: appointmentsKeys.detail(id ?? ''),
    queryFn: () => appointmentsApi.get(id!),
    enabled: !!id && (options?.enabled !== false),
  });
}

export function useDoctorsQuery(branchId: string | undefined | null) {
  return useQuery({
    queryKey: appointmentsKeys.doctors(branchId),
    queryFn: () => appointmentsApi.getDoctors(),
    enabled: !!branchId,
  });
}

export function useCreateAppointmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AppointmentCreateInput) => appointmentsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentsKeys.lists() });
    },
  });
}

export function useUpdateAppointmentStatusMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => appointmentsApi.updateStatus(id, status),
    onSuccess: (data) => {
      qc.setQueryData(appointmentsKeys.detail(data.id), data);
      qc.invalidateQueries({ queryKey: appointmentsKeys.lists() });
    },
  });
}

export function useDeleteAppointmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentsApi.delete(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: appointmentsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: appointmentsKeys.lists() });
    },
  });
}
