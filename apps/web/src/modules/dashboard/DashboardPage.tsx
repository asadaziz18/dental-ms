import { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Heading, Alert, AlertIcon, Select } from '@chakra-ui/react';
import { useAuth } from '@/core/auth';
import { useBranchId, useSetBranchId } from '@/core/branch';
import { useSyncStatus } from '@/shared/hooks/useSyncStatus';
import {
  useDashboardSummary,
  useDashboardTodayAppointments,
  useDashboardRevenueChart,
  useDashboardUpcoming,
  useDashboardLowStock,
  useDashboardDoctorPerformance,
  getDashboardLastFetched,
} from './hooks/use-dashboard';
import { KpiCards } from './components/KpiCards';
import { TodaySchedule } from './components/TodaySchedule';
import { RevenueChart } from './components/RevenueChart';
import { UpcomingAppointments } from './components/UpcomingAppointments';
import { LowStockAlerts } from './components/LowStockAlerts';
import { DoctorPerformanceTable } from './components/DoctorPerformanceTable';
import { QuickActionsBar } from './components/QuickActionsBar';
import { TodaySchedulePrintOverlay } from './components/TodaySchedulePrintOverlay';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';

type Role = 'SuperAdmin' | 'BranchAdmin' | 'Doctor' | 'Receptionist' | 'Nurse';

function useBranches(enabled: boolean) {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data } = await api.get<Array<{ id: string; name: string }>>('/branches');
      return data;
    },
    enabled,
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { isOnline } = useSyncStatus();
  const queryClient = useQueryClient();
  const branchId = useBranchId();
  const setBranchId = useSetBranchId();
  const role = (user?.role ?? 'Receptionist') as Role;
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [revenueRange, setRevenueRange] = useState<'30d' | '12m'>('30d');
  const [schedulePrintOpen, setSchedulePrintOpen] = useState(false);

  const isSuperAdmin = role === 'SuperAdmin';
  const showChartsAndRevenue = role === 'SuperAdmin' || role === 'BranchAdmin';
  const showDoctorPerformance = role === 'SuperAdmin' || role === 'BranchAdmin';
  const showKpis = role !== 'Receptionist';
  const showTodaySchedule = true;
  const showUpcomingAndLowStock = role !== 'Receptionist';

  const branchesQuery = useBranches(isSuperAdmin);
  const branches = branchesQuery.data ?? [];
  const hasBranch = !!branchId;
  const summary = useDashboardSummary(hasBranch && showKpis);
  const todayAppts = useDashboardTodayAppointments(hasBranch && showTodaySchedule);
  const revenueChart = useDashboardRevenueChart(revenueRange, hasBranch && showChartsAndRevenue);
  const upcoming = useDashboardUpcoming(hasBranch && showUpcomingAndLowStock);
  const lowStock = useDashboardLowStock(hasBranch && showUpcomingAndLowStock);
  const doctorPerf = useDashboardDoctorPerformance(hasBranch && showDoctorPerformance);

  useEffect(() => {
    let cancelled = false;
    getDashboardLastFetched(branchId).then((ts) => {
      if (!cancelled && ts) {
        setLastSynced(new Date(ts).toLocaleString());
      }
    });
    return () => {
      cancelled = true;
    };
  }, [branchId, summary.dataUpdatedAt, todayAppts.dataUpdatedAt]);

  const branchFilter =
    isSuperAdmin && branches.length > 1 ? (
      <Select
        size="sm"
        maxW="40"
        value={branchId ?? ''}
        onChange={(e) => {
          const id = e.target.value || null;
          setBranchId(id);
          queryClient.invalidateQueries();
        }}
      >
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </Select>
    ) : null;

  const currentBranchQuery = useQuery({
    queryKey: ['branches', 'current', branchId],
    queryFn: async () => {
      const { data } = await api.get<{ id: string; name: string }>(`/branches/${branchId}`);
      return data;
    },
    enabled: !!branchId && !isSuperAdmin,
  });

  const branchName = useMemo(() => {
    if (branchId && branches.length > 0) {
      const b = branches.find((x) => x.id === branchId);
      if (b?.name) return b.name;
    }
    if (currentBranchQuery.data?.name) return currentBranchQuery.data.name;
    return 'Clinic';
  }, [branchId, branches, currentBranchQuery.data?.name]);

  const schedulePrintDisabled = !branchId || todayAppts.isLoading;
  const schedulePrintDisabledReason = !branchId
    ? 'Select a branch first'
    : todayAppts.isLoading
      ? 'Loading appointments…'
      : undefined;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4} mb={6}>
        <Heading size="lg">Dashboard</Heading>
        <QuickActionsBar
          onPrintTodaySchedule={() => setSchedulePrintOpen(true)}
          printTodayScheduleDisabled={schedulePrintDisabled}
          printTodayScheduleDisabledReason={schedulePrintDisabledReason}
        />
      </Box>

      {schedulePrintOpen && branchId && (
        <TodaySchedulePrintOverlay
          appointments={todayAppts.data ?? []}
          branchName={branchName}
          onClose={() => setSchedulePrintOpen(false)}
        />
      )}

      {!isOnline && (
        <Alert status="warning" mb={4} borderRadius="md">
          <AlertIcon />
          You are offline. Showing data from last sync
          {lastSynced ? ` at ${lastSynced}` : ''}.
        </Alert>
      )}

      {showKpis && <KpiCards data={summary.data} isLoading={summary.isLoading} />}

      <Grid
        templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
        gap={6}
        mt={6}
        sx={{ '& > *': { minW: 0 } }}
      >
        {showTodaySchedule && (
          <Box gridColumn={{ base: '1', lg: '1 / -1' }}>
            <TodaySchedule appointments={todayAppts.data} isLoading={todayAppts.isLoading} />
          </Box>
        )}

        {showChartsAndRevenue && (
          <Box gridColumn={{ base: '1', lg: '1 / -1' }}>
            <RevenueChart
              data={revenueChart.data}
              isLoading={revenueChart.isLoading}
              range={revenueRange}
              onRangeChange={setRevenueRange}
              branchFilter={branchFilter}
            />
          </Box>
        )}

        {showUpcomingAndLowStock && (
          <>
            <UpcomingAppointments appointments={upcoming.data} isLoading={upcoming.isLoading} />
            <LowStockAlerts items={lowStock.data} isLoading={lowStock.isLoading} />
          </>
        )}
      </Grid>

      {showDoctorPerformance && (
        <Box mt={6}>
          <DoctorPerformanceTable data={doctorPerf.data} isLoading={doctorPerf.isLoading} />
        </Box>
      )}
    </Box>
  );
}
