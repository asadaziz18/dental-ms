import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { reportsApi } from '../api';
import {
  getReportCache,
  setReportCache,
  reportCacheKey,
  isReportStale,
} from '@/core/db/report-cache';
import type {
  DashboardSummary,
  RevenueTrendPoint,
  TreatmentDistributionItem,
  DoctorPerformanceItem,
  NoShowRateResult,
  ReportGroupBy,
} from '@dental-ms/shared-types';
import { getBranchId } from '@/core/api/client';

const reportsKeys = {
  all: ['reports'] as const,
  dashboard: (branchId: string, date?: string) =>
    [...reportsKeys.all, 'dashboard', branchId, date ?? ''] as const,
  revenue: (branchId: string, from: string, to: string, groupBy: ReportGroupBy, doctorId?: string) =>
    [...reportsKeys.all, 'revenue', branchId, from, to, groupBy, doctorId ?? ''] as const,
  treatmentDistribution: (branchId: string, from?: string, to?: string) =>
    [...reportsKeys.all, 'treatmentDistribution', branchId, from ?? '', to ?? ''] as const,
  doctorPerformance: (branchId: string, from?: string, to?: string) =>
    [...reportsKeys.all, 'doctorPerformance', branchId, from ?? '', to ?? ''] as const,
  noShowRate: (branchId: string, from?: string, to?: string, doctorId?: string) =>
    [...reportsKeys.all, 'noShowRate', branchId, from ?? '', to ?? '', doctorId ?? ''] as const,
};

function useCachedReport<T>(
  key: string,
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: { enabled?: boolean },
) {
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await queryFn();
      await setReportCache(key, data);
      return data;
    },
    enabled: options?.enabled !== false,
  });

  const [cachedAt, setCachedAt] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    getReportCache(key).then((entry) => {
      if (!cancelled && entry) setCachedAt(entry.fetchedAt);
    });
    return () => {
      cancelled = true;
    };
  }, [key, query.dataUpdatedAt]);

  const stale = cachedAt != null && isReportStale(cachedAt);
  return { ...query, cachedAt, isStale: stale };
}

export function useDashboardReport(date?: string) {
  const branchId = getBranchId();
  const key = reportCacheKey('dashboard', { branchId: branchId ?? '', date: date ?? '' });
  return useCachedReport<DashboardSummary>(
    key,
    reportsKeys.dashboard(branchId ?? '', date),
    () => reportsApi.getDashboard({ date }),
    { enabled: !!branchId },
  );
}

export function useRevenueTrendReport(
  fromDate: string,
  toDate: string,
  groupBy: ReportGroupBy = 'day',
  doctorId?: string,
) {
  const branchId = getBranchId();
  const key = reportCacheKey('revenue', {
    branchId: branchId ?? '',
    fromDate,
    toDate,
    groupBy,
    doctorId: doctorId ?? '',
  });
  return useCachedReport<RevenueTrendPoint[]>(
    key,
    reportsKeys.revenue(branchId ?? '', fromDate, toDate, groupBy, doctorId),
    () => reportsApi.getRevenueTrend({ fromDate, toDate, groupBy, doctorId }),
    { enabled: !!branchId && !!fromDate && !!toDate },
  );
}

export function useTreatmentDistributionReport(fromDate?: string, toDate?: string) {
  const branchId = getBranchId();
  const key = reportCacheKey('treatmentDistribution', {
    branchId: branchId ?? '',
    fromDate: fromDate ?? '',
    toDate: toDate ?? '',
  });
  return useCachedReport<TreatmentDistributionItem[]>(
    key,
    reportsKeys.treatmentDistribution(branchId ?? '', fromDate, toDate),
    () => reportsApi.getTreatmentDistribution({ fromDate, toDate }),
    { enabled: !!branchId },
  );
}

export function useDoctorPerformanceReport(fromDate?: string, toDate?: string) {
  const branchId = getBranchId();
  const key = reportCacheKey('doctorPerformance', {
    branchId: branchId ?? '',
    fromDate: fromDate ?? '',
    toDate: toDate ?? '',
  });
  return useCachedReport<DoctorPerformanceItem[]>(
    key,
    reportsKeys.doctorPerformance(branchId ?? '', fromDate, toDate),
    () => reportsApi.getDoctorPerformance({ fromDate, toDate }),
    { enabled: !!branchId },
  );
}

export function useNoShowRateReport(
  fromDate?: string,
  toDate?: string,
  doctorId?: string,
) {
  const branchId = getBranchId();
  const key = reportCacheKey('noShowRate', {
    branchId: branchId ?? '',
    fromDate: fromDate ?? '',
    toDate: toDate ?? '',
    doctorId: doctorId ?? '',
  });
  return useCachedReport<NoShowRateResult>(
    key,
    reportsKeys.noShowRate(branchId ?? '', fromDate, toDate, doctorId),
    () => reportsApi.getNoShowRate({ fromDate, toDate, doctorId }),
    { enabled: !!branchId },
  );
}

export function useRefreshReports() {
  const qc = useQueryClient();
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: reportsKeys.all });
  }, [qc]);
}
