import { useQuery } from '@tanstack/react-query';
import { useBranchId } from '@/core/branch';
import { getReportCache, setReportCache, reportCacheKey } from '@/core/db/report-cache';
import type { DashboardSummary } from '../api';
import {
  fetchDashboardSummary,
  fetchTodayAppointments,
  fetchRevenueChart,
  fetchUpcomingAppointments,
  fetchLowStock,
  fetchDoctorPerformance,
} from '../api';

function cacheKey(branchId: string, part: string, suffix = '') {
  return reportCacheKey('dashboard', { branchId: branchId || '', part, suffix });
}

async function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (isOffline) {
    const cached = await getReportCache<T>(key);
    if (cached) return cached.data;
  }
  const data = await fetcher();
  await setReportCache(key, data);
  return data;
}

export const dashboardKeys = {
  summary: (branchId: string | null) => ['dashboard', 'summary', branchId ?? ''] as const,
  today: (branchId: string | null) => ['dashboard', 'today', branchId ?? ''] as const,
  revenueChart: (branchId: string | null, range: string) =>
    ['dashboard', 'revenueChart', branchId ?? '', range] as const,
  upcoming: (branchId: string | null) => ['dashboard', 'upcoming', branchId ?? ''] as const,
  lowStock: (branchId: string | null) => ['dashboard', 'lowStock', branchId ?? ''] as const,
  doctorPerformance: (branchId: string | null, month?: string) =>
    ['dashboard', 'doctorPerformance', branchId ?? '', month ?? ''] as const,
};

export function useDashboardSummary(enabled: boolean) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: dashboardKeys.summary(branchId),
    queryFn: async () => {
      const key = cacheKey(branchId ?? '', 'summary');
      return withCache(key, fetchDashboardSummary);
    },
    enabled: enabled && !!branchId,
  });
}

export function useDashboardTodayAppointments(enabled: boolean) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: dashboardKeys.today(branchId),
    queryFn: async () => {
      const key = cacheKey(branchId ?? '', 'today');
      return withCache(key, fetchTodayAppointments);
    },
    enabled: enabled && !!branchId,
  });
}

export function useDashboardRevenueChart(
  range: '30d' | '12m',
  enabled: boolean,
) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: dashboardKeys.revenueChart(branchId, range),
    queryFn: async () => {
      const key = cacheKey(branchId ?? '', 'revenueChart', range);
      return withCache(key, () => fetchRevenueChart(range));
    },
    enabled: enabled && !!branchId,
  });
}

export function useDashboardUpcoming(enabled: boolean, days = 7) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: [...dashboardKeys.upcoming(branchId), days],
    queryFn: async () => {
      const key = cacheKey(branchId ?? '', 'upcoming', String(days));
      return withCache(key, () => fetchUpcomingAppointments(days));
    },
    enabled: enabled && !!branchId,
  });
}

export function useDashboardLowStock(enabled: boolean) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: dashboardKeys.lowStock(branchId),
    queryFn: async () => {
      const key = cacheKey(branchId ?? '', 'lowStock');
      return withCache(key, fetchLowStock);
    },
    enabled: enabled && !!branchId,
  });
}

export function useDashboardDoctorPerformance(enabled: boolean, month?: string) {
  const branchId = useBranchId();
  return useQuery({
    queryKey: dashboardKeys.doctorPerformance(branchId, month),
    queryFn: async () => {
      const key = cacheKey(branchId ?? '', 'doctorPerformance', month ?? '');
      return withCache(key, () => fetchDoctorPerformance(month));
    },
    enabled: enabled && !!branchId,
  });
}

/** Last fetched timestamp for dashboard (from any cached key); read in dashboard for "last synced" label */
export async function getDashboardLastFetched(branchId: string | null): Promise<number | null> {
  const key = cacheKey(branchId ?? '', 'summary');
  const row = await getReportCache<DashboardSummary>(key);
  return row?.fetchedAt ?? null;
}
