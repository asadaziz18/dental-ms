import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  invoicesApi,
  paymentsApi,
  insuranceClaimsApi,
  type CreateInvoiceInput,
  type UpdateInvoiceInput,
  type CreateInvoiceLineItemInput,
  type UpdateInvoiceLineItemInput,
  type CreatePaymentInput,
  type CreateInsuranceClaimInput,
  type UpdateInsuranceClaimInput,
} from '../api';

export const invoicesKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoicesKeys.all, 'list'] as const,
  list: (patientId: string) => [...invoicesKeys.lists(), patientId] as const,
  balance: (patientId: string) => [...invoicesKeys.all, 'balance', patientId] as const,
  details: () => [...invoicesKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoicesKeys.details(), id] as const,
};

export const paymentsKeys = {
  all: ['payments'] as const,
  list: (invoiceId: string) => [...paymentsKeys.all, invoiceId] as const,
};

export const insuranceClaimsKeys = {
  all: ['insuranceClaims'] as const,
  lists: () => [...insuranceClaimsKeys.all, 'list'] as const,
  list: (patientId: string) => [...insuranceClaimsKeys.lists(), patientId] as const,
  details: () => [...insuranceClaimsKeys.all, 'detail'] as const,
  detail: (id: string) => [...insuranceClaimsKeys.details(), id] as const,
};

export function useOutstandingBalanceQuery(patientId: string | undefined | null) {
  return useQuery({
    queryKey: invoicesKeys.balance(patientId ?? ''),
    queryFn: () => invoicesApi.getBalance(patientId!),
    enabled: !!patientId,
  });
}

export function useInvoicesByPatientQuery(patientId: string | undefined | null) {
  return useQuery({
    queryKey: invoicesKeys.list(patientId ?? ''),
    queryFn: () => invoicesApi.listByPatient(patientId!),
    enabled: !!patientId,
  });
}

export function useInvoiceQuery(id: string | undefined | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: invoicesKeys.detail(id ?? ''),
    queryFn: () => invoicesApi.get(id!),
    enabled: !!id && (options?.enabled !== false),
  });
}

export function useCreateInvoiceMutation(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<CreateInvoiceInput, 'patientId'>) =>
      invoicesApi.create({ ...body, patientId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoicesKeys.list(patientId) });
      qc.invalidateQueries({ queryKey: invoicesKeys.balance(patientId) });
    },
  });
}

export function useUpdateInvoiceMutation(invoiceId: string, patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateInvoiceInput) => invoicesApi.update(invoiceId, body),
    onSuccess: (data) => {
      qc.setQueryData(invoicesKeys.detail(data.id), data);
      qc.invalidateQueries({ queryKey: invoicesKeys.list(patientId) });
      qc.invalidateQueries({ queryKey: invoicesKeys.balance(patientId) });
    },
  });
}

export function useDeleteInvoiceMutation(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: invoicesKeys.detail(id) });
      qc.invalidateQueries({ queryKey: invoicesKeys.list(patientId) });
      qc.invalidateQueries({ queryKey: invoicesKeys.balance(patientId) });
    },
  });
}

export function useAddInvoiceLineItemMutation(invoiceId: string, patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInvoiceLineItemInput) =>
      invoicesApi.addLineItem(invoiceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoicesKeys.detail(invoiceId) });
      qc.invalidateQueries({ queryKey: invoicesKeys.list(patientId) });
      qc.invalidateQueries({ queryKey: invoicesKeys.balance(patientId) });
    },
  });
}

export function useUpdateInvoiceLineItemMutation(
  invoiceId: string,
  patientId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      body,
    }: { itemId: string; body: UpdateInvoiceLineItemInput }) =>
      invoicesApi.updateLineItem(invoiceId, itemId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoicesKeys.detail(invoiceId) });
      qc.invalidateQueries({ queryKey: invoicesKeys.list(patientId) });
      qc.invalidateQueries({ queryKey: invoicesKeys.balance(patientId) });
    },
  });
}

export function useRemoveInvoiceLineItemMutation(invoiceId: string, patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => invoicesApi.removeLineItem(invoiceId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: invoicesKeys.detail(invoiceId) });
      qc.invalidateQueries({ queryKey: invoicesKeys.list(patientId) });
      qc.invalidateQueries({ queryKey: invoicesKeys.balance(patientId) });
    },
  });
}

export function usePaymentsByInvoiceQuery(invoiceId: string | undefined | null) {
  return useQuery({
    queryKey: paymentsKeys.list(invoiceId ?? ''),
    queryFn: () => paymentsApi.listByInvoice(invoiceId!),
    enabled: !!invoiceId,
  });
}

export function useCreatePaymentMutation(invoiceId: string, patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePaymentInput) => paymentsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentsKeys.list(invoiceId) });
      qc.invalidateQueries({ queryKey: invoicesKeys.detail(invoiceId) });
      qc.invalidateQueries({ queryKey: invoicesKeys.list(patientId) });
      qc.invalidateQueries({ queryKey: invoicesKeys.balance(patientId) });
    },
  });
}

export function useInsuranceClaimsByPatientQuery(patientId: string | undefined | null) {
  return useQuery({
    queryKey: insuranceClaimsKeys.list(patientId ?? ''),
    queryFn: () => insuranceClaimsApi.listByPatient(patientId!),
    enabled: !!patientId,
  });
}

export function useInsuranceClaimQuery(id: string | undefined | null) {
  return useQuery({
    queryKey: insuranceClaimsKeys.detail(id ?? ''),
    queryFn: () => insuranceClaimsApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateInsuranceClaimMutation(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<CreateInsuranceClaimInput, 'patientId'>) =>
      insuranceClaimsApi.create({ ...body, patientId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: insuranceClaimsKeys.list(patientId) });
    },
  });
}

export function useUpdateInsuranceClaimMutation(patientId: string, claimId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateInsuranceClaimInput) =>
      insuranceClaimsApi.update(claimId, body),
    onSuccess: (data) => {
      qc.setQueryData(insuranceClaimsKeys.detail(data.id), data);
      qc.invalidateQueries({ queryKey: insuranceClaimsKeys.list(patientId) });
    },
  });
}

export function useDeleteInsuranceClaimMutation(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => insuranceClaimsApi.delete(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: insuranceClaimsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: insuranceClaimsKeys.list(patientId) });
    },
  });
}
