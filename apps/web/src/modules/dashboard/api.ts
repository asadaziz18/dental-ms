import { api } from '@/core/api/client';

export interface DashboardSummary {
  todayAppointments: { total: number; confirmed: number; pending: number };
  todayRevenue: { amount: number; invoicesPaid: number };
  newPatientsThisMonth: { count: number; vsLastMonth: number };
  pendingPayments: { totalAmount: number; overdueCount: number };
}

export interface TodayAppointmentItem {
  id: string;
  start: string;
  end: string;
  type: string;
  status: string;
  patient?: { id: string; firstName: string; lastName: string };
  doctor?: { id: string; fullName: string } | null;
}

export interface RevenueChartPoint {
  date: string;
  invoiced: number;
  collected: number;
}

export interface UpcomingAppointmentItem {
  id: string;
  start: string;
  end: string;
  type: string;
  status: string;
  patient?: { id: string; firstName: string; lastName: string };
  doctor?: { id: string; fullName: string } | null;
}

export interface LowStockItem {
  itemId: string;
  name: string;
  sku: string;
  currentQuantity: number;
  reorderThreshold: number;
  branchId: string;
}

export interface DoctorPerformanceRow {
  doctorId: string;
  name: string;
  patientsSeen: number;
  proceduresDone: number;
  revenue: number;
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>('/dashboard/summary');
  return data;
}

export async function fetchTodayAppointments(): Promise<TodayAppointmentItem[]> {
  const { data } = await api.get<TodayAppointmentItem[]>('/dashboard/appointments/today');
  return data;
}

export async function fetchRevenueChart(range: '30d' | '12m'): Promise<RevenueChartPoint[]> {
  const { data } = await api.get<RevenueChartPoint[]>('/dashboard/revenue-chart', {
    params: { range },
  });
  return data;
}

export async function fetchUpcomingAppointments(days = 7): Promise<UpcomingAppointmentItem[]> {
  const { data } = await api.get<UpcomingAppointmentItem[]>('/dashboard/upcoming-appointments', {
    params: { days },
  });
  return data;
}

export async function fetchLowStock(): Promise<LowStockItem[]> {
  const { data } = await api.get<LowStockItem[]>('/dashboard/low-stock');
  return data;
}

export async function fetchDoctorPerformance(month?: string): Promise<DoctorPerformanceRow[]> {
  const { data } = await api.get<DoctorPerformanceRow[]>('/dashboard/doctor-performance', {
    params: month ? { month } : undefined,
  });
  return data;
}
