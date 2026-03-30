import { api } from '@/core/api/client';
import type {
  DashboardSummary,
  RevenueTrendPoint,
  TreatmentDistributionItem,
  DoctorPerformanceItem,
  NoShowRateResult,
  ReportGroupBy,
} from '@dental-ms/shared-types';

const BASE = '/reports';

export const reportsApi = {
  getDashboard: (params?: { date?: string }) =>
    api.get<DashboardSummary>(`${BASE}/dashboard`, { params }).then((r) => r.data),

  getRevenueTrend: (params: {
    fromDate: string;
    toDate: string;
    groupBy?: ReportGroupBy;
    doctorId?: string;
  }) =>
    api.get<RevenueTrendPoint[]>(`${BASE}/revenue`, { params }).then((r) => r.data),

  getTreatmentDistribution: (params?: { fromDate?: string; toDate?: string }) =>
    api
      .get<TreatmentDistributionItem[]>(`${BASE}/treatment-distribution`, { params })
      .then((r) => r.data),

  getDoctorPerformance: (params?: { fromDate?: string; toDate?: string }) =>
    api
      .get<DoctorPerformanceItem[]>(`${BASE}/doctor-performance`, { params })
      .then((r) => r.data),

  getNoShowRate: (params?: { fromDate?: string; toDate?: string; doctorId?: string }) =>
    api.get<NoShowRateResult>(`${BASE}/no-show-rate`, { params }).then((r) => r.data),
};
