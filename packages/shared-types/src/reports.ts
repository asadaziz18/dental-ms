/**
 * Report & Analytics types (API responses + frontend)
 */

export interface DashboardSummary {
  todayAppointments: number;
  revenueToday: number;
  newPatientsToday: number;
  pendingPayments: number;
  date: string;
}

export interface RevenueTrendPoint {
  period: string;
  total: number;
}

export interface TreatmentDistributionItem {
  name: string;
  code: string;
  count: number;
  revenue: number;
}

export interface DoctorPerformanceItem {
  doctorId: string;
  doctorName: string;
  invoicesCount: number;
  proceduresCompleted: number;
  revenue: number;
}

export interface NoShowRateResult {
  total: number;
  noShows: number;
  noShowRatePercent: number;
}

export type ReportGroupBy = 'day' | 'week' | 'month';

export interface ReportFilters {
  branchId?: string;
  fromDate?: string;
  toDate?: string;
  doctorId?: string;
  groupBy?: ReportGroupBy;
  date?: string;
}
