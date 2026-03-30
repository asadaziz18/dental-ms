import { Box, Grid, Skeleton, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
import type { DashboardSummary } from '../api';

const CARD_LABELS = [
  "Today's Appointments",
  "Today's Revenue",
  'New Patients (this month)',
  'Pending Payments',
] as const;

function formatPkr(n: number) {
  return `PKR ${n.toLocaleString()}`;
}

interface KpiCardsProps {
  data: DashboardSummary | undefined;
  isLoading: boolean;
}

const EMPTY_SUMMARY: DashboardSummary = {
  todayAppointments: { total: 0, confirmed: 0, pending: 0 },
  todayRevenue: { amount: 0, invoicesPaid: 0 },
  newPatientsThisMonth: { count: 0, vsLastMonth: 0 },
  pendingPayments: { totalAmount: 0, overdueCount: 0 },
};

export function KpiCards({ data, isLoading }: KpiCardsProps) {
  if (isLoading) {
    return (
      <Grid templateColumns={{ base: '1fr 1fr', lg: 'repeat(4, 1fr)' }} gap={4}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height="24" borderRadius="lg" />
        ))}
      </Grid>
    );
  }

  const d = data ?? EMPTY_SUMMARY;
  const cards = [
    {
      value: d.todayAppointments.total,
      sub: `${d.todayAppointments.confirmed} confirmed, ${d.todayAppointments.pending} pending`,
      color: 'blue',
    },
    {
      value: formatPkr(d.todayRevenue.amount),
      sub: `${d.todayRevenue.invoicesPaid} invoices paid`,
      color: 'green',
    },
    {
      value: d.newPatientsThisMonth.count,
      sub: `vs last month: ${d.newPatientsThisMonth.vsLastMonth >= 0 ? '+' : ''}${d.newPatientsThisMonth.vsLastMonth}`,
      color: 'teal',
    },
    {
      value: formatPkr(d.pendingPayments.totalAmount),
      sub: `${d.pendingPayments.overdueCount} invoices overdue`,
      color: 'orange',
    },
  ];

  return (
    <Grid templateColumns={{ base: '1fr 1fr', lg: 'repeat(4, 1fr)' }} gap={4}>
      {cards.map((card, i) => (
        <Box
          key={i}
          p={4}
          borderRadius="lg"
          borderWidth="1px"
          borderLeftWidth="4px"
          borderLeftColor={`${card.color}.500`}
          bg="white"
          _dark={{ bg: 'gray.800' }}
        >
          <Stat>
            <StatLabel fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
              {CARD_LABELS[i]}
            </StatLabel>
            <StatNumber fontSize="xl">{card.value}</StatNumber>
            <StatHelpText mb={0}>{card.sub}</StatHelpText>
          </Stat>
        </Box>
      ))}
    </Grid>
  );
}
