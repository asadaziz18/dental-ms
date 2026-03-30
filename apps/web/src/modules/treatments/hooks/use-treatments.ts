import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  proceduresApi,
  treatmentsApi,
  prescriptionsApi,
  type CreateTreatmentPlanInput,
  type UpdateTreatmentPlanInput,
  type CreateTreatmentPlanItemInput,
  type UpdateTreatmentPlanItemInput,
  type CreatePrescriptionInput,
  type UpdatePrescriptionInput,
} from '../api';

export const proceduresKeys = {
  all: ['procedures'] as const,
  list: () => [...proceduresKeys.all, 'list'] as const,
};

export const treatmentPlansKeys = {
  all: ['treatmentPlans'] as const,
  lists: () => [...treatmentPlansKeys.all, 'list'] as const,
  list: (patientId: string) => [...treatmentPlansKeys.lists(), patientId] as const,
  details: () => [...treatmentPlansKeys.all, 'detail'] as const,
  detail: (id: string) => [...treatmentPlansKeys.details(), id] as const,
};

export const prescriptionsKeys = {
  all: ['prescriptions'] as const,
  lists: () => [...prescriptionsKeys.all, 'list'] as const,
  list: (patientId: string) => [...prescriptionsKeys.lists(), patientId] as const,
  details: () => [...prescriptionsKeys.all, 'detail'] as const,
  detail: (patientId: string, id: string) =>
    [...prescriptionsKeys.details(), patientId, id] as const,
};

export function useProceduresQuery() {
  return useQuery({
    queryKey: proceduresKeys.list(),
    queryFn: () => proceduresApi.list(),
  });
}

export function useTreatmentPlansByPatientQuery(patientId: string | undefined | null) {
  return useQuery({
    queryKey: treatmentPlansKeys.list(patientId ?? ''),
    queryFn: () => treatmentsApi.listByPatient(patientId!),
    enabled: !!patientId,
  });
}

export function useTreatmentPlanQuery(id: string | undefined | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: treatmentPlansKeys.detail(id ?? ''),
    queryFn: () => treatmentsApi.get(id!),
    enabled: !!id && (options?.enabled !== false),
  });
}

export function useCreateTreatmentPlanMutation(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<CreateTreatmentPlanInput, 'patientId'>) =>
      treatmentsApi.create({ ...body, patientId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: treatmentPlansKeys.list(patientId) });
    },
  });
}

export function useUpdateTreatmentPlanMutation(planId: string, patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateTreatmentPlanInput) => treatmentsApi.update(planId, body),
    onSuccess: (data) => {
      qc.setQueryData(treatmentPlansKeys.detail(data.id), data);
      qc.invalidateQueries({ queryKey: treatmentPlansKeys.list(patientId) });
    },
  });
}

export function useDeleteTreatmentPlanMutation(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => treatmentsApi.delete(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: treatmentPlansKeys.detail(id) });
      qc.invalidateQueries({ queryKey: treatmentPlansKeys.list(patientId) });
    },
  });
}

export function useAddTreatmentPlanItemMutation(planId: string, patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTreatmentPlanItemInput) => treatmentsApi.addItem(planId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: treatmentPlansKeys.detail(planId) });
      qc.invalidateQueries({ queryKey: treatmentPlansKeys.list(patientId) });
    },
  });
}

export function useUpdateTreatmentPlanItemMutation(
  planId: string,
  patientId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      body,
    }: {
      itemId: string;
      body: UpdateTreatmentPlanItemInput;
    }) => treatmentsApi.updateItem(planId, itemId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: treatmentPlansKeys.detail(planId) });
      qc.invalidateQueries({ queryKey: treatmentPlansKeys.list(patientId) });
    },
  });
}

export function useRemoveTreatmentPlanItemMutation(planId: string, patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => treatmentsApi.removeItem(planId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: treatmentPlansKeys.detail(planId) });
      qc.invalidateQueries({ queryKey: treatmentPlansKeys.list(patientId) });
    },
  });
}

export function usePrescriptionsByPatientQuery(patientId: string | undefined | null) {
  return useQuery({
    queryKey: prescriptionsKeys.list(patientId ?? ''),
    queryFn: () => prescriptionsApi.listByPatient(patientId!),
    enabled: !!patientId,
  });
}

export function usePrescriptionQuery(
  patientId: string | undefined | null,
  prescriptionId: string | undefined | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: prescriptionsKeys.detail(patientId ?? '', prescriptionId ?? ''),
    queryFn: () => prescriptionsApi.get(patientId!, prescriptionId!),
    enabled:
      !!patientId &&
      !!prescriptionId &&
      (options?.enabled !== false),
  });
}

export function useCreatePrescriptionMutation(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<CreatePrescriptionInput, 'patientId'>) =>
      prescriptionsApi.create({ ...body, patientId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prescriptionsKeys.list(patientId) });
    },
  });
}

export function useUpdatePrescriptionMutation(patientId: string, prescriptionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePrescriptionInput) =>
      prescriptionsApi.update(patientId, prescriptionId, body),
    onSuccess: (data) => {
      qc.setQueryData(
        prescriptionsKeys.detail(patientId, data.id),
        data,
      );
      qc.invalidateQueries({ queryKey: prescriptionsKeys.list(patientId) });
    },
  });
}

export function useDeletePrescriptionMutation(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => prescriptionsApi.delete(patientId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: prescriptionsKeys.list(patientId) });
    },
  });
}
