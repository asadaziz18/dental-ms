import { useState } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Skeleton,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  HStack,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  Wrap,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  useDashboardReport,
  useRevenueTrendReport,
  useTreatmentDistributionReport,
  useDoctorPerformanceReport,
  useNoShowRateReport,
  useRefreshReports,
} from '../hooks/use-reports';
import { ReportFilters, defaultFilters, type ReportFiltersState } from '../components/ReportFilters';
import { useDoctorsQuery } from '@/modules/appointments/hooks/use-appointments';
import { getBranchId } from '@/core/api/client';
import type { TreatmentDistributionItem } from '@dental-ms/shared-types';
import { exportReportsCSV } from '../utils/export-csv';
import { ReportPDFDocument } from '../components/ReportPDF';

const CHART_COLORS = ['#0D9488', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

export function ReportsPage() {
  const branchId = getBranchId();
  const [filters, setFilters] = useState<ReportFiltersState>(defaultFilters);

  const dashboard = useDashboardReport();
  const revenue = useRevenueTrendReport(
    filters.fromDate,
    filters.toDate,
    filters.groupBy,
    filters.doctorId || undefined,
  );
  const treatmentDist = useTreatmentDistributionReport(
    filters.fromDate,
    filters.toDate,
  );
  const doctorPerf = useDoctorPerformanceReport(
    filters.fromDate,
    filters.toDate,
  );
  const noShow = useNoShowRateReport(
    filters.fromDate,
    filters.toDate,
    filters.doctorId || undefined,
  );

  const { data: doctors = [] } = useDoctorsQuery(branchId);
  const refresh = useRefreshReports();

  const anyStale =
    dashboard.isStale ||
    revenue.isStale ||
    treatmentDist.isStale ||
    doctorPerf.isStale ||
    noShow.isStale;
  const cachedAt =
    dashboard.cachedAt ??
    revenue.cachedAt ??
    treatmentDist.cachedAt ??
    doctorPerf.cachedAt ??
    noShow.cachedAt;

  const handleExportCSV = () => {
    const payload = {
      dashboard: dashboard.data,
      revenue: revenue.data,
      treatmentDistribution: treatmentDist.data,
      doctorPerformance: doctorPerf.data,
      noShowRate: noShow.data,
      filters,
    };
    exportReportsCSV(payload);
  };

  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box p={4}>
      <HStack justify="space-between" wrap="wrap" gap={4} mb={6}>
        <Heading size="lg">Reports &amp; Analytics</Heading>
        <Wrap>
          <Button size="sm" variant="outline" onClick={handleExportCSV}>
            Export CSV
          </Button>
          <ReportPDFDocument
            dashboard={dashboard.data}
            revenue={revenue.data}
            treatmentDistribution={treatmentDist.data}
            doctorPerformance={doctorPerf.data}
            noShowRate={noShow.data}
            filters={filters}
          />
        </Wrap>
      </HStack>

      {anyStale && cachedAt != null && (
        <Alert status="warning" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertDescription>
            Data may be stale. Last updated: {new Date(cachedAt).toLocaleString()}.
          </AlertDescription>
          <Button size="sm" colorScheme="orange" ml="auto" onClick={refresh}>
            Refresh all
          </Button>
        </Alert>
      )}

      <ReportFilters
        filters={filters}
        onChange={setFilters}
        onRefresh={refresh}
        doctors={doctors}
        showStale={anyStale}
        cachedAt={cachedAt}
      />

      {/* Dashboard KPIs */}
      <Heading size="md" mt={8} mb={3}>
        Today&apos;s summary
      </Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={8}>
        <KpiCard
          label="Today's appointments"
          value={dashboard.data?.todayAppointments}
          isLoading={dashboard.isLoading}
        />
        <KpiCard
          label="Revenue today"
          value={dashboard.data?.revenueToday}
          format="currency"
          isLoading={dashboard.isLoading}
        />
        <KpiCard
          label="New patients today"
          value={dashboard.data?.newPatientsToday}
          isLoading={dashboard.isLoading}
        />
        <KpiCard
          label="Pending payments"
          value={dashboard.data?.pendingPayments}
          format="currency"
          isLoading={dashboard.isLoading}
        />
      </SimpleGrid>

      {/* Revenue trend */}
      <Card bg={cardBg} mb={6}>
        <CardHeader>
          <Heading size="md">Revenue trend</Heading>
        </CardHeader>
        <CardBody>
          {revenue.isLoading ? (
            <Skeleton height="300px" />
          ) : revenue.data?.length ? (
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v: unknown) => [typeof v === 'number' ? `$${Number(v).toFixed(2)}` : String(v), 'Revenue']} />
                  <Line type="monotone" dataKey="total" stroke="#0D9488" strokeWidth={2} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Text color="gray.500">No revenue data for the selected period.</Text>
          )}
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={6}>
        {/* Treatment distribution */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Treatment type distribution</Heading>
          </CardHeader>
          <CardBody>
            {treatmentDist.isLoading ? (
              <Skeleton height="280px" />
            ) : treatmentDist.data?.length ? (
              <Box height="280px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={treatmentDist.data}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }: { name: string; percent: number }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {treatmentDist.data.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: unknown, name: string, props: { payload?: TreatmentDistributionItem }) => 
                      [typeof v === 'number' ? `${v} ($${(props.payload?.revenue ?? 0).toFixed(2)})` : String(v), name]
                    } />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Text color="gray.500">No treatment data for the selected period.</Text>
            )}
          </CardBody>
        </Card>

        {/* Doctor performance */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Doctor performance</Heading>
          </CardHeader>
          <CardBody>
            {doctorPerf.isLoading ? (
              <Skeleton height="280px" />
            ) : doctorPerf.data?.length ? (
              <Box height="280px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={doctorPerf.data}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v: number) => `$${v}`} />
                    <YAxis type="category" dataKey="doctorName" width={90} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: unknown) => [typeof v === 'number' ? `$${Number(v).toFixed(2)}` : String(v), 'Revenue']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#0D9488" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Text color="gray.500">No doctor performance data.</Text>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* No-show rate */}
      <Card bg={cardBg} maxW="md">
        <CardHeader>
          <Heading size="md">Appointment no-show rate</Heading>
        </CardHeader>
        <CardBody>
          {noShow.isLoading ? (
            <Skeleton height="16" width="120px" />
          ) : noShow.data ? (
            <Stat>
              <StatLabel>No-shows / Total</StatLabel>
              <StatNumber>
                {noShow.data.noShows} / {noShow.data.total}
              </StatNumber>
              <StatHelpText>{noShow.data.noShowRatePercent.toFixed(1)}% no-show rate</StatHelpText>
            </Stat>
          ) : (
            <Text color="gray.500">No data.</Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}

function KpiCard({
  label,
  value,
  format,
  isLoading,
}: {
  label: string;
  value?: number;
  format?: 'currency';
  isLoading?: boolean;
}) {
  const display =
    value != null
      ? format === 'currency'
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value)
        : String(value)
      : '—';
  return (
    <Card bg={useColorModeValue('white', 'gray.800')}>
      <CardBody>
        <Stat>
          <StatLabel>{label}</StatLabel>
          {isLoading ? (
            <Skeleton height="8" width="80px" mt={1} />
          ) : (
            <StatNumber>{display}</StatNumber>
          )}
        </Stat>
      </CardBody>
    </Card>
  );
}
