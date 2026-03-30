import {
  Box,
  Skeleton,
  Text,
  ButtonGroup,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueChartPoint } from '../api';

interface RevenueChartProps {
  data: RevenueChartPoint[] | undefined;
  isLoading: boolean;
  range: '30d' | '12m';
  onRangeChange: (r: '30d' | '12m') => void;
  branchFilter?: React.ReactNode;
}

function formatPkr(n: number) {
  return `PKR ${n.toLocaleString()}`;
}

export function RevenueChart({
  data,
  isLoading,
  range,
  onRangeChange,
  branchFilter,
}: RevenueChartProps) {
  const strokeCollected = useColorModeValue('#0D9488', '#2DD4BF');
  const strokeInvoiced = useColorModeValue('#3B82F6', '#60A5FA');

  if (isLoading) {
    return (
      <Box bg="white" _dark={{ bg: 'gray.800' }} p={4} borderRadius="lg" borderWidth="1px" h="320px">
        <Skeleton height="full" />
      </Box>
    );
  }

  const chartData = data ?? [];

  return (
    <Box bg="white" _dark={{ bg: 'gray.800' }} p={4} borderRadius="lg" borderWidth="1px">
      <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" mb={4} gap={2}>
        <Text fontWeight="600" fontSize="lg">
          Revenue
        </Text>
        <Box display="flex" alignItems="center" gap={2}>
          {branchFilter}
          <ButtonGroup size="sm" isAttached>
            <Button
              colorScheme="teal"
              variant={range === '30d' ? 'solid' : 'outline'}
              onClick={() => onRangeChange('30d')}
            >
              30 days
            </Button>
            <Button
              colorScheme="teal"
              variant={range === '12m' ? 'solid' : 'outline'}
              onClick={() => onRangeChange('12m')}
            >
              12 months
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
      <Box height="280px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number) => [formatPkr(value), '']}
              labelFormatter={(label) => label}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="collected"
              name="Collected"
              stroke={strokeCollected}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="invoiced"
              name="Invoiced"
              stroke={strokeInvoiced}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
