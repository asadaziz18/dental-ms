import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labVendorsApi, labOrdersApi } from '../api';
import type {
  LabOrderListQuery,
  LabOrderCreateInput,
  LabOrderUpdateInput,
  LabVendorCreateInput,
  LabVendorUpdateInput,
} from '@dental-ms/shared-types';

export const labKeys = {
  vendors: ['lab', 'vendors'] as const,
  vendorList: (params?: Record<string, string>) => [...labKeys.vendors, 'list', params] as const,
  vendorDetail: (id: string) => [...labKeys.vendors, 'detail', id] as const,
  orders: ['lab', 'orders'] as const,
  orderList: (query: LabOrderListQuery) => [...labKeys.orders, 'list', query] as const,
  orderDetail: (id: string) => [...labKeys.orders, 'detail', id] as const,
  dashboard: () => [...labKeys.orders, 'dashboard'] as const,
  orderTrials: (orderId: string) => [...labKeys.orders, 'trials', orderId] as const,
};

export function useLabVendorsQuery(params?: { isActive?: string; city?: string; specialization?: string }) {
  return useQuery({
    queryKey: labKeys.vendorList(params),
    queryFn: () => labVendorsApi.list(params),
  });
}

export function useLabVendorQuery(id: string | undefined | null) {
  return useQuery({
    queryKey: labKeys.vendorDetail(id ?? ''),
    queryFn: () => labVendorsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateLabVendorMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LabVendorCreateInput) => labVendorsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: labKeys.vendors });
    },
  });
}

export function useUpdateLabVendorMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LabVendorUpdateInput) => labVendorsApi.update(id, body),
    onSuccess: (data) => {
      qc.setQueryData(labKeys.vendorDetail(data.id), { vendor: data, activeOrdersCount: 0 });
      qc.invalidateQueries({ queryKey: labKeys.vendors });
    },
  });
}

export function useUpdateLabVendorStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      labVendorsApi.updateStatus(id, isActive),
    onSuccess: (data) => {
      qc.setQueryData(labKeys.vendorDetail(data.id), { vendor: data, activeOrdersCount: 0 });
      qc.invalidateQueries({ queryKey: labKeys.vendors });
    },
  });
}

export function useDeleteLabVendorMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => labVendorsApi.delete(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: labKeys.vendorDetail(id) });
      qc.invalidateQueries({ queryKey: labKeys.vendors });
    },
  });
}

export function useLabDashboardQuery() {
  return useQuery({
    queryKey: labKeys.dashboard(),
    queryFn: () => labOrdersApi.getDashboard(),
  });
}

export function useLabOrdersQuery(query: LabOrderListQuery) {
  return useQuery({
    queryKey: labKeys.orderList(query),
    queryFn: () => labOrdersApi.list(query),
  });
}

export function useLabOrderQuery(id: string | undefined | null) {
  return useQuery({
    queryKey: labKeys.orderDetail(id ?? ''),
    queryFn: () => labOrdersApi.get(id!),
    enabled: !!id,
  });
}

export function useLabOrderByPatientQuery(patientId: string | undefined | null) {
  return useQuery({
    queryKey: labKeys.orderList({ patientId: patientId ?? '' }),
    queryFn: () => labOrdersApi.list({ patientId: patientId! }),
    enabled: !!patientId,
  });
}

export function useCreateLabOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LabOrderCreateInput) => labOrdersApi.create(body),
    onSuccess: (data) => {
      qc.setQueryData(labKeys.orderDetail(data.id), data);
      qc.invalidateQueries({ queryKey: labKeys.orders });
      qc.invalidateQueries({ queryKey: labKeys.dashboard() });
    },
  });
}

export function useUpdateLabOrderMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LabOrderUpdateInput) => labOrdersApi.update(id, body),
    onSuccess: (data) => {
      qc.setQueryData(labKeys.orderDetail(data.id), data);
      qc.invalidateQueries({ queryKey: labKeys.orders });
      qc.invalidateQueries({ queryKey: labKeys.dashboard() });
    },
  });
}

export function useUpdateLabOrderStatusMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ status, reason }: { status: string; reason?: string }) =>
      labOrdersApi.updateStatus(id, status as any, reason),
    onSuccess: (data) => {
      qc.setQueryData(labKeys.orderDetail(data.id), data);
      qc.invalidateQueries({ queryKey: labKeys.orders });
      qc.invalidateQueries({ queryKey: labKeys.dashboard() });
    },
  });
}

export function useUpdateLabOrderPaymentMutation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ isPaid, labFee }: { isPaid: boolean; labFee?: number | null }) =>
      labOrdersApi.updatePayment(id, isPaid, labFee),
    onSuccess: (data) => {
      qc.setQueryData(labKeys.orderDetail(data.id), data);
      qc.invalidateQueries({ queryKey: labKeys.orders });
    },
  });
}

export function useLabOrderTrialsQuery(orderId: string | undefined | null) {
  return useQuery({
    queryKey: labKeys.orderTrials(orderId ?? ''),
    queryFn: () => labOrdersApi.getTrials(orderId!),
    enabled: !!orderId,
  });
}

export function useCreateLabTrialMutation(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof labOrdersApi.createTrial>[1]) =>
      labOrdersApi.createTrial(orderId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: labKeys.orderDetail(orderId) });
      qc.invalidateQueries({ queryKey: labKeys.orderTrials(orderId) });
      qc.invalidateQueries({ queryKey: labKeys.dashboard() });
    },
  });
}

export function useCompleteLabTrialMutation(orderId: string, trialId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof labOrdersApi.completeTrial>[2]) =>
      labOrdersApi.completeTrial(orderId, trialId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: labKeys.orderDetail(orderId) });
      qc.invalidateQueries({ queryKey: labKeys.orderTrials(orderId) });
      qc.invalidateQueries({ queryKey: labKeys.dashboard() });
    },
  });
}

export function useNotifyLabTrialMutation(orderId: string, trialId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { channel: 'whatsapp' | 'email' | 'both'; message?: string }) =>
      labOrdersApi.notifyTrial(orderId, trialId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: labKeys.orderDetail(orderId) });
    },
  });
}
