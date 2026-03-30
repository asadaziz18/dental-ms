/**
 * Build CSV from current report data and trigger download.
 */
import type {
  DashboardSummary,
  RevenueTrendPoint,
  TreatmentDistributionItem,
  DoctorPerformanceItem,
  NoShowRateResult,
} from '@dental-ms/shared-types';
import type { ReportFiltersState } from '../components/ReportFilters';

interface ExportPayload {
  dashboard?: DashboardSummary | null;
  revenue?: RevenueTrendPoint[] | null;
  treatmentDistribution?: TreatmentDistributionItem[] | null;
  doctorPerformance?: DoctorPerformanceItem[] | null;
  noShowRate?: NoShowRateResult | null;
  filters: ReportFiltersState;
}

function escapeCsvCell(s: string | number): string {
  const str = String(s);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function rowsToCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
}

export function exportReportsCSV(payload: ExportPayload): void {
  const sections: string[] = [];

  if (payload.dashboard) {
    sections.push(
      'Dashboard Summary',
      rowsToCsv([
        ['Metric', 'Value'],
        ['Date', payload.dashboard.date],
        ["Today's Appointments", String(payload.dashboard.todayAppointments)],
        ['Revenue Today', String(payload.dashboard.revenueToday)],
        ['New Patients Today', String(payload.dashboard.newPatientsToday)],
        ['Pending Payments', String(payload.dashboard.pendingPayments)],
      ]),
      '',
    );
  }

  if (payload.revenue?.length) {
    sections.push(
      'Revenue Trend',
      rowsToCsv([
        ['Period', 'Total'],
        ...payload.revenue.map((r) => [r.period, String(r.total)]),
      ]),
      '',
    );
  }

  if (payload.treatmentDistribution?.length) {
    sections.push(
      'Treatment Distribution',
      rowsToCsv([
        ['Name', 'Code', 'Count', 'Revenue'],
        ...payload.treatmentDistribution.map((t) => [
          t.name,
          t.code,
          String(t.count),
          String(t.revenue),
        ]),
      ]),
      '',
    );
  }

  if (payload.doctorPerformance?.length) {
    sections.push(
      'Doctor Performance',
      rowsToCsv([
        ['Doctor', 'Invoices', 'Procedures', 'Revenue'],
        ...payload.doctorPerformance.map((d) => [
          d.doctorName,
          String(d.invoicesCount),
          String(d.proceduresCompleted),
          String(d.revenue),
        ]),
      ]),
      '',
    );
  }

  if (payload.noShowRate) {
    sections.push(
      'No-Show Rate',
      rowsToCsv([
        ['Total', 'No-Shows', 'Rate %'],
        [
          String(payload.noShowRate.total),
          String(payload.noShowRate.noShows),
          payload.noShowRate.noShowRatePercent.toFixed(1),
        ],
      ]),
      '',
    );
  }

  sections.push(
    'Filters',
    rowsToCsv([
      ['From', 'To', 'Doctor ID', 'Group By'],
      [
        payload.filters.fromDate,
        payload.filters.toDate,
        payload.filters.doctorId || 'All',
        payload.filters.groupBy,
      ],
    ]),
  );

  const csv = sections.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reports-${payload.filters.fromDate}-to-${payload.filters.toDate}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
