import { api } from '@/core/api/client';
import type {
  BranchSubscriptionDto,
  PlanLimitUsage,
  SubscriptionPlan,
  SubscriptionInvoiceDto,
  TenantListItem,
} from '@dental-ms/shared-types';

const BASE = '/subscription';

export const subscriptionApi = {
  getMySubscription: () =>
    api.get<BranchSubscriptionDto | null>(BASE).then((r) => r.data),

  getUsage: () =>
    api.get<PlanLimitUsage | null>(`${BASE}/usage`).then((r) => r.data),

  listPlans: (activeOnly?: boolean) =>
    api
      .get<SubscriptionPlan[]>(`${BASE}/plans`, {
        params: activeOnly ? { activeOnly: 'true' } : undefined,
      })
      .then((r) => r.data),

  getPlan: (id: string) =>
    api.get<SubscriptionPlan>(`${BASE}/plans/${id}`).then((r) => r.data),

  createPlan: (body: {
    name: string;
    slug: string;
    description?: string | null;
    priceMonthly?: number;
    priceYearly?: number;
    billingInterval?: 'month' | 'year';
    features?: Record<string, unknown> | null;
    isActive?: boolean;
  }) => api.post<SubscriptionPlan>(`${BASE}/plans`, body).then((r) => r.data),

  updatePlan: (id: string, body: Partial<Parameters<typeof subscriptionApi.createPlan>[0]>) =>
    api.patch<SubscriptionPlan>(`${BASE}/plans/${id}`, body).then((r) => r.data),

  deletePlan: (id: string) =>
    api.delete<{ deleted: boolean }>(`${BASE}/plans/${id}`).then((r) => r.data),

  listTenants: () =>
    api.get<TenantListItem[]>(`${BASE}/tenants`).then((r) => r.data),

  assignPlan: (branchId: string, planId: string, trialDays?: number) =>
    api
      .patch<unknown>(`${BASE}/tenants/${branchId}/plan`, { planId, trialDays })
      .then((r) => r.data),

  listMyInvoices: () =>
    api.get<SubscriptionInvoiceDto[]>(`${BASE}/invoices`).then((r) => r.data),

  listAllInvoices: () =>
    api.get<SubscriptionInvoiceDto[]>(`${BASE}/invoices/all`).then((r) => r.data),

  markInvoicePaid: (id: string) =>
    api
      .patch<SubscriptionInvoiceDto>(`${BASE}/invoices/${id}/mark-paid`)
      .then((r) => r.data),
};
