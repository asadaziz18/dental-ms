import { useState, useMemo } from 'react';
import { Button, HStack, useToast } from '@chakra-ui/react';
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
import type {
  BookingSlipPrintVariant,
  ClinicSlipHeaderInfo,
} from '@/modules/appointments/components/AppointmentBookingSlipPDF';
import {
  THERMAL_WIDTH_PT,
  formatHours,
  joinAddress,
} from '@/core/pdf/clinic-helpers';
import { useBranchId } from '@/core/branch';
import { useBranchDetail } from '@/modules/branches/hooks/use-branches';
import { useBookingSlipPlatformSettingsQuery } from '@/modules/platform-settings';

const THERMAL_PAGE_MIN_HEIGHT = 1400;

const st = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  clinicName: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  clinicMeta: { fontSize: 9, color: '#333', marginBottom: 2 },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginTop: 10,
    marginBottom: 12,
    paddingBottom: 4,
  },
  title: { fontSize: 18, marginBottom: 12, fontWeight: 'bold' },
  period: { marginBottom: 12, fontSize: 10 },
  section: { marginTop: 14, marginBottom: 6, fontSize: 12, fontWeight: 'bold' },
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
  footerWrap: { marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#ddd' },
  footerOwner: { fontSize: 8, color: '#444', marginBottom: 4 },
  footerGen: { fontSize: 8, color: '#666' },
  footerHint: { fontSize: 8, color: '#888', marginTop: 4 },
});

const th = StyleSheet.create({
  page: {
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 6,
    fontSize: 7,
    fontFamily: 'Courier',
  },
  clinicName: { fontSize: 9, fontWeight: 'bold', textAlign: 'center', marginBottom: 3 },
  clinicLine: { fontSize: 6, textAlign: 'center', marginBottom: 1 },
  rule: { borderTopWidth: 1, borderTopColor: '#000', marginVertical: 5 },
  title: { fontSize: 8, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  period: { fontSize: 6, textAlign: 'center', marginBottom: 6 },
  section: { fontSize: 7, fontWeight: 'bold', marginTop: 8, marginBottom: 3 },
  row: { flexDirection: 'row', marginBottom: 2, justifyContent: 'space-between' },
  label: { fontSize: 6, width: '55%' },
  value: { fontSize: 6, fontWeight: 'bold' },
  tableRow: { marginBottom: 2, fontSize: 6 },
  footerOwner: { fontSize: 6, textAlign: 'center', marginTop: 8 },
  footerGen: { fontSize: 5, textAlign: 'center', color: '#555', marginTop: 3 },
});

export interface ReportPdfDataProps {
  dashboard?: DashboardSummary | null;
  revenue?: RevenueTrendPoint[] | null;
  treatmentDistribution?: TreatmentDistributionItem[] | null;
  doctorPerformance?: DoctorPerformanceItem[] | null;
  noShowRate?: NoShowRateResult | null;
  filters: ReportFiltersState;
}

export interface ReportPdfProps extends ReportPdfDataProps {
  variant: BookingSlipPrintVariant;
  clinic: ClinicSlipHeaderInfo;
  productOwnerFooter?: string | null;
}

function StandardReportBody({
  clinic,
  productOwnerFooter,
  dashboard,
  revenue,
  treatmentDistribution,
  doctorPerformance,
  noShowRate,
  filters,
}: ReportPdfProps) {
  const addr = joinAddress(clinic.address, clinic.city);
  const hours = formatHours(clinic.openingTime, clinic.closingTime);

  return (
    <>
      <Text style={st.clinicName}>{clinic.name}</Text>
      {clinic.code?.trim() ? (
        <Text style={st.clinicMeta}>Branch code: {clinic.code}</Text>
      ) : null}
      {addr ? <Text style={st.clinicMeta}>{addr}</Text> : null}
      {clinic.phone?.trim() ? (
        <Text style={st.clinicMeta}>Phone: {clinic.phone}</Text>
      ) : null}
      {clinic.email?.trim() ? (
        <Text style={st.clinicMeta}>Email: {clinic.email}</Text>
      ) : null}
      {hours ? <Text style={st.clinicMeta}>Hours: {hours}</Text> : null}

      <View style={st.divider}>
        <Text style={st.title}>Reports &amp; Analytics</Text>
      </View>
      <Text style={st.period}>
        Period: {filters.fromDate} to {filters.toDate}
        {filters.doctorId ? ' • Doctor filter applied' : ''} • Group by: {filters.groupBy}
      </Text>

      {dashboard ? (
        <>
          <Text style={st.section}>Today&apos;s summary</Text>
          <View style={st.row}>
            <Text style={st.label}>Date:</Text>
            <Text>{dashboard.date}</Text>
          </View>
          <View style={st.row}>
            <Text style={st.label}>Today&apos;s appointments:</Text>
            <Text>{dashboard.todayAppointments}</Text>
          </View>
          <View style={st.row}>
            <Text style={st.label}>Revenue today:</Text>
            <Text>${dashboard.revenueToday.toFixed(2)}</Text>
          </View>
          <View style={st.row}>
            <Text style={st.label}>New patients today:</Text>
            <Text>{dashboard.newPatientsToday}</Text>
          </View>
          <View style={st.row}>
            <Text style={st.label}>Pending payments:</Text>
            <Text>${dashboard.pendingPayments.toFixed(2)}</Text>
          </View>
        </>
      ) : null}

      {revenue && revenue.length > 0 ? (
        <>
          <Text style={st.section}>Revenue trend</Text>
          <View style={st.tableHeader}>
            <Text style={st.col1}>Period</Text>
            <Text style={st.col2}>Total</Text>
          </View>
          {revenue.slice(0, 20).map((r, i) => (
            <View key={i} style={st.tableRow}>
              <Text style={st.col1}>{r.period}</Text>
              <Text style={st.col2}>${r.total.toFixed(2)}</Text>
            </View>
          ))}
          {revenue.length > 20 ? (
            <Text style={{ marginTop: 4, fontSize: 9 }}>
              … and {revenue.length - 20} more periods
            </Text>
          ) : null}
        </>
      ) : null}

      {treatmentDistribution && treatmentDistribution.length > 0 ? (
        <>
          <Text style={st.section}>Treatment distribution</Text>
          <View style={st.tableHeader}>
            <Text style={st.col1}>Name</Text>
            <Text style={st.col2}>Count</Text>
            <Text style={st.col3}>Revenue</Text>
          </View>
          {treatmentDistribution.slice(0, 15).map((t, i) => (
            <View key={i} style={st.tableRow}>
              <Text style={st.col1}>{t.name}</Text>
              <Text style={st.col2}>{t.count}</Text>
              <Text style={st.col3}>${t.revenue.toFixed(2)}</Text>
            </View>
          ))}
        </>
      ) : null}

      {doctorPerformance && doctorPerformance.length > 0 ? (
        <>
          <Text style={st.section}>Doctor performance</Text>
          <View style={st.tableHeader}>
            <Text style={st.col1}>Doctor</Text>
            <Text style={st.col2}>Invoices</Text>
            <Text style={st.col3}>Revenue</Text>
          </View>
          {doctorPerformance.map((d, i) => (
            <View key={i} style={st.tableRow}>
              <Text style={st.col1}>{d.doctorName}</Text>
              <Text style={st.col2}>{d.invoicesCount}</Text>
              <Text style={st.col3}>${d.revenue.toFixed(2)}</Text>
            </View>
          ))}
        </>
      ) : null}

      {noShowRate ? (
        <>
          <Text style={st.section}>No-show rate</Text>
          <View style={st.row}>
            <Text style={st.label}>Total appointments:</Text>
            <Text>{noShowRate.total}</Text>
          </View>
          <View style={st.row}>
            <Text style={st.label}>No-shows:</Text>
            <Text>{noShowRate.noShows}</Text>
          </View>
          <View style={st.row}>
            <Text style={st.label}>No-show rate:</Text>
            <Text>{noShowRate.noShowRatePercent.toFixed(1)}%</Text>
          </View>
        </>
      ) : null}

      <View style={st.footerWrap}>
        {productOwnerFooter?.trim() ? (
          <Text style={st.footerOwner}>{productOwnerFooter.trim()}</Text>
        ) : null}
        <Text style={st.footerGen}>Generated {new Date().toLocaleString()}</Text>
        <Text style={st.footerHint}>
          For full charts and filters, use the web dashboard.
        </Text>
      </View>
    </>
  );
}

function ThermalReportBody({
  clinic,
  productOwnerFooter,
  dashboard,
  revenue,
  treatmentDistribution,
  doctorPerformance,
  noShowRate,
  filters,
}: ReportPdfProps) {
  const addr = joinAddress(clinic.address, clinic.city);
  const hours = formatHours(clinic.openingTime, clinic.closingTime);
  const rev = revenue?.slice(0, 12) ?? [];
  const treat = treatmentDistribution?.slice(0, 8) ?? [];
  const docs = doctorPerformance?.slice(0, 12) ?? [];

  return (
    <>
      <Text style={th.clinicName}>{clinic.name}</Text>
      {clinic.code?.trim() ? (
        <Text style={th.clinicLine}>Code: {clinic.code}</Text>
      ) : null}
      {addr ? <Text style={th.clinicLine}>{addr}</Text> : null}
      {clinic.phone?.trim() ? <Text style={th.clinicLine}>Tel: {clinic.phone}</Text> : null}
      {hours ? <Text style={th.clinicLine}>Hours: {hours}</Text> : null}

      <View style={th.rule} />
      <Text style={th.title}>REPORTS / ANALYTICS</Text>
      <Text style={th.period}>
        {filters.fromDate} → {filters.toDate}
        {filters.doctorId ? ' • Dr filter' : ''} • {filters.groupBy}
      </Text>

      {dashboard ? (
        <>
          <Text style={th.section}>Today summary</Text>
          <View style={th.row}>
            <Text style={th.label}>Appts today</Text>
            <Text style={th.value}>{dashboard.todayAppointments}</Text>
          </View>
          <View style={th.row}>
            <Text style={th.label}>Revenue today</Text>
            <Text style={th.value}>${dashboard.revenueToday.toFixed(2)}</Text>
          </View>
          <View style={th.row}>
            <Text style={th.label}>New patients</Text>
            <Text style={th.value}>{dashboard.newPatientsToday}</Text>
          </View>
          <View style={th.row}>
            <Text style={th.label}>Pending $</Text>
            <Text style={th.value}>${dashboard.pendingPayments.toFixed(2)}</Text>
          </View>
        </>
      ) : null}

      {rev.length > 0 ? (
        <>
          <Text style={th.section}>Revenue trend</Text>
          {rev.map((r, i) => (
            <Text key={i} style={th.tableRow}>
              {r.period}: ${r.total.toFixed(2)}
            </Text>
          ))}
          {(revenue?.length ?? 0) > rev.length ? (
            <Text style={th.tableRow}>…+{(revenue?.length ?? 0) - rev.length}</Text>
          ) : null}
        </>
      ) : null}

      {treat.length > 0 ? (
        <>
          <Text style={th.section}>Treatments</Text>
          {treat.map((t, i) => (
            <Text key={i} style={th.tableRow}>
              {t.name} ×{t.count} ${t.revenue.toFixed(2)}
            </Text>
          ))}
        </>
      ) : null}

      {docs.length > 0 ? (
        <>
          <Text style={th.section}>Doctors</Text>
          {docs.map((d, i) => (
            <Text key={i} style={th.tableRow}>
              {d.doctorName}: {d.invoicesCount} inv ${d.revenue.toFixed(2)}
            </Text>
          ))}
        </>
      ) : null}

      {noShowRate ? (
        <>
          <Text style={th.section}>No-show</Text>
          <Text style={th.tableRow}>
            {noShowRate.noShows}/{noShowRate.total} = {noShowRate.noShowRatePercent.toFixed(1)}%
          </Text>
        </>
      ) : null}

      <View style={th.rule} />
      {productOwnerFooter?.trim() ? (
        <Text style={th.footerOwner}>{productOwnerFooter.trim()}</Text>
      ) : null}
      <Text style={th.footerGen}>{new Date().toLocaleString()}</Text>
    </>
  );
}

export function ReportPdf(props: ReportPdfProps) {
  const suffix = `${props.filters.fromDate}-to-${props.filters.toDate}`;
  const docTitle =
    props.variant === 'thermal'
      ? `Reports (thermal 80mm) ${suffix}`
      : `Reports (A4) ${suffix}`;

  if (props.variant === 'thermal') {
    return (
      <Document title={docTitle}>
        <Page
          size={[THERMAL_WIDTH_PT, THERMAL_PAGE_MIN_HEIGHT]}
          wrap
          style={th.page}
        >
          <ThermalReportBody {...props} />
        </Page>
      </Document>
    );
  }

  return (
    <Document title={docTitle}>
      <Page size="A4" wrap style={st.page}>
        <StandardReportBody {...props} />
      </Page>
    </Document>
  );
}

export type ReportPDFDocumentProps = ReportPdfDataProps;

export function ReportPDFDocument({
  dashboard,
  revenue,
  treatmentDistribution,
  doctorPerformance,
  noShowRate,
  filters,
}: ReportPDFDocumentProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const branchId = useBranchId();
  const { data: branch } = useBranchDetail(branchId, !!branchId);
  const { data: slipSettings } = useBookingSlipPlatformSettingsQuery(true);

  const clinic = useMemo((): ClinicSlipHeaderInfo => {
    if (!branch) return { name: 'Clinic' };
    return {
      name: branch.name,
      address: branch.address || null,
      city: branch.city || null,
      phone: branch.phone || null,
      email: branch.email || null,
      code: branch.code || null,
      openingTime: branch.openingTime || null,
      closingTime: branch.closingTime || null,
    };
  }, [branch]);

  const dataProps: ReportPdfDataProps = {
    dashboard,
    revenue,
    treatmentDistribution,
    doctorPerformance,
    noShowRate,
    filters,
  };

  const download = async (variant: BookingSlipPrintVariant) => {
    setLoading(true);
    try {
      const blob = await pdf(
        <ReportPdf
          variant={variant}
          clinic={clinic}
          productOwnerFooter={slipSettings?.productOwnerFooter}
          {...dataProps}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const tag = variant === 'thermal' ? 'thermal-80mm' : 'a4';
      a.download = `reports-${tag}-${filters.fromDate}-to-${filters.toDate}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: 'PDF saved',
        description:
          variant === 'thermal'
            ? 'Thermal (80mm) report saved to your downloads.'
            : 'Standard (A4) report saved to your downloads.',
        status: 'success',
        duration: 2500,
      });
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
    <HStack spacing={2}>
      <Button
        size="sm"
        variant="outline"
        isLoading={loading}
        onClick={() => {
          void download('standard');
        }}
      >
        Report (A4)
      </Button>
      <Button
        size="sm"
        variant="outline"
        isLoading={loading}
        onClick={() => {
          void download('thermal');
        }}
      >
        Report (80mm)
      </Button>
    </HStack>
  );
}
