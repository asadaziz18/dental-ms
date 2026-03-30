import { useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { pdf } from '@react-pdf/renderer';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';
import type {
  DashboardSummary,
  RevenueTrendPoint,
  TreatmentDistributionItem,
  DoctorPerformanceItem,
  NoShowRateResult,
} from '@dental-ms/shared-types';
import type { ReportFiltersState } from './ReportFilters';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10 },
  title: { fontSize: 18, marginBottom: 20, fontWeight: 'bold' },
  section: { marginTop: 16, marginBottom: 8, fontSize: 12, fontWeight: 'bold' },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 140, fontWeight: 'bold' },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 4,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  tableRow: { flexDirection: 'row', marginBottom: 2 },
  col1: { width: '40%' },
  col2: { width: '30%' },
  col3: { width: '30%' },
});

interface ReportPDFContentProps {
  dashboard?: DashboardSummary | null;
  revenue?: RevenueTrendPoint[] | null;
  treatmentDistribution?: TreatmentDistributionItem[] | null;
  doctorPerformance?: DoctorPerformanceItem[] | null;
  noShowRate?: NoShowRateResult | null;
  filters: ReportFiltersState;
}

function ReportPDFContent({
  dashboard,
  revenue,
  treatmentDistribution,
  doctorPerformance,
  noShowRate,
  filters,
}: ReportPDFContentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Reports &amp; Analytics</Text>
        <Text style={{ marginBottom: 12 }}>
          Period: {filters.fromDate} to {filters.toDate}
          {filters.doctorId ? ` • Doctor filter applied` : ''} • Group by: {filters.groupBy}
        </Text>

        {dashboard && (
          <>
            <Text style={styles.section}>Today&apos;s summary</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Date:</Text>
              <Text>{dashboard.date}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Today&apos;s appointments:</Text>
              <Text>{dashboard.todayAppointments}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Revenue today:</Text>
              <Text>${dashboard.revenueToday.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>New patients today:</Text>
              <Text>{dashboard.newPatientsToday}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Pending payments:</Text>
              <Text>${dashboard.pendingPayments.toFixed(2)}</Text>
            </View>
          </>
        )}

        {revenue && revenue.length > 0 && (
          <>
            <Text style={styles.section}>Revenue trend (sample)</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Period</Text>
              <Text style={styles.col2}>Total</Text>
            </View>
            {revenue.slice(0, 15).map((r, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.col1}>{r.period}</Text>
                <Text style={styles.col2}>${r.total.toFixed(2)}</Text>
              </View>
            ))}
            {revenue.length > 15 && (
              <Text style={{ marginTop: 4 }}>... and {revenue.length - 15} more periods</Text>
            )}
          </>
        )}

        {treatmentDistribution && treatmentDistribution.length > 0 && (
          <>
            <Text style={styles.section}>Treatment distribution</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Name</Text>
              <Text style={styles.col2}>Count</Text>
              <Text style={styles.col3}>Revenue</Text>
            </View>
            {treatmentDistribution.slice(0, 10).map((t, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.col1}>{t.name}</Text>
                <Text style={styles.col2}>{t.count}</Text>
                <Text style={styles.col3}>${t.revenue.toFixed(2)}</Text>
              </View>
            ))}
          </>
        )}

        {doctorPerformance && doctorPerformance.length > 0 && (
          <>
            <Text style={styles.section}>Doctor performance</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Doctor</Text>
              <Text style={styles.col2}>Invoices</Text>
              <Text style={styles.col3}>Revenue</Text>
            </View>
            {doctorPerformance.map((d, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.col1}>{d.doctorName}</Text>
                <Text style={styles.col2}>{d.invoicesCount}</Text>
                <Text style={styles.col3}>${d.revenue.toFixed(2)}</Text>
              </View>
            ))}
          </>
        )}

        {noShowRate && (
          <>
            <Text style={styles.section}>No-show rate</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Total appointments:</Text>
              <Text>{noShowRate.total}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>No-shows:</Text>
              <Text>{noShowRate.noShows}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>No-show rate:</Text>
              <Text>{noShowRate.noShowRatePercent.toFixed(1)}%</Text>
            </View>
          </>
        )}

        <Text style={{ marginTop: 24, fontSize: 8, color: '#666' }}>
          Generated from Dental MS Reports. For full charts and filters, use the web dashboard.
        </Text>
      </Page>
    </Document>
  );
}

export interface ReportPDFDocumentProps {
  dashboard?: DashboardSummary | null;
  revenue?: RevenueTrendPoint[] | null;
  treatmentDistribution?: TreatmentDistributionItem[] | null;
  doctorPerformance?: DoctorPerformanceItem[] | null;
  noShowRate?: NoShowRateResult | null;
  filters: ReportFiltersState;
}

export function ReportPDFDocument({
  dashboard,
  revenue,
  treatmentDistribution,
  doctorPerformance,
  noShowRate,
  filters,
}: ReportPDFDocumentProps) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await pdf(
        <ReportPDFContent
          dashboard={dashboard}
          revenue={revenue}
          treatmentDistribution={treatmentDistribution}
          doctorPerformance={doctorPerformance}
          noShowRate={noShowRate}
          filters={filters}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reports-${filters.fromDate}-to-${filters.toDate}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast({
        title: 'Failed to generate PDF',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleDownload}
      isLoading={loading}
    >
      Export PDF
    </Button>
  );
}
