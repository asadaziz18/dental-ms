import { useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '../api';
import { getBranchId } from '@/core/api/client';

export const subscriptionKeys = {
  all: ['subscription'] as const,
  my: () => [...subscriptionKeys.all, 'my'] as const,
  usage: () => [...subscriptionKeys.all, 'usage'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  plan: (id: string) => [...subscriptionKeys.plans(), id] as const,
  tenants: () => [...subscriptionKeys.all, 'tenants'] as const,
  invoices: () => [...subscriptionKeys.all, 'invoices'] as const,
  invoicesAll: () => [...subscriptionKeys.all, 'invoices', 'all'] as const,
};

export function useSubscription() {
  const branchId = getBranchId();
  const query = useQuery({
    queryKey: subscriptionKeys.my(),
    queryFn: () => subscriptionApi.getMySubscription(),
    enabled: !!branchId,
  });
  return {
    ...query,
    subscription: query.data ?? null,
    status: query.data?.status ?? null,
    isTrialing: query.data?.status === 'trialing',
    isGrace: query.data?.status === 'grace',
    isSuspended: query.data?.status === 'suspended',
    isActive: query.data?.status === 'active' || query.data?.status === 'trialing',
  };
}

export function useSubscriptionUsage() {
  const branchId = getBranchId();
  return useQuery({
    queryKey: subscriptionKeys.usage(),
    queryFn: () => subscriptionApi.getUsage(),
    enabled: !!branchId,
  });
}

export function usePlansQuery(activeOnly?: boolean) {
  return useQuery({
    queryKey: [...subscriptionKeys.plans(), activeOnly],
    queryFn: () => subscriptionApi.listPlans(activeOnly),
  });
}

export function useTenantsQuery() {
  return useQuery({
    queryKey: subscriptionKeys.tenants(),
    queryFn: () => subscriptionApi.listTenants(),
  });
}

export function useSubscriptionInvoicesQuery() {
  const branchId = getBranchId();
  return useQuery({
    queryKey: subscriptionKeys.invoices(),
    queryFn: () => subscriptionApi.listMyInvoices(),
    enabled: !!branchId,
  });
}

export function useAllInvoicesQuery() {
  return useQuery({
    queryKey: subscriptionKeys.invoicesAll(),
    queryFn: () => subscriptionApi.listAllInvoices(),
  });
}

export function useRefreshSubscription() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: subscriptionKeys.all });
}
