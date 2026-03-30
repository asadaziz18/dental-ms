import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  SimpleGrid,
} from '@chakra-ui/react';
import type { ReportGroupBy } from '@dental-ms/shared-types';

const toDate = new Date();
const fromDate = new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export interface ReportFiltersState {
  fromDate: string;
  toDate: string;
  doctorId: string;
  groupBy: ReportGroupBy;
}

const defaultFilters: ReportFiltersState = {
  fromDate: formatDate(fromDate),
  toDate: formatDate(toDate),
  doctorId: '',
  groupBy: 'day',
};

export interface ReportFiltersProps {
  filters: ReportFiltersState;
  onChange: (f: ReportFiltersState) => void;
  onRefresh?: () => void;
  doctors: { id: string; fullName: string }[];
  isLoading?: boolean;
  showStale?: boolean;
  cachedAt?: number | null;
}

export function ReportFilters({
  filters,
  onChange,
  onRefresh,
  doctors,
  showStale,
  cachedAt,
}: ReportFiltersProps) {
  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} gap={4} alignItems="end">
        <FormControl>
          <FormLabel fontSize="sm">From</FormLabel>
          <Input
            type="date"
            size="sm"
            value={filters.fromDate}
            onChange={(e) => onChange({ ...filters, fromDate: e.target.value })}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">To</FormLabel>
          <Input
            type="date"
            size="sm"
            value={filters.toDate}
            onChange={(e) => onChange({ ...filters, toDate: e.target.value })}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Doctor</FormLabel>
          <Select
            size="sm"
            value={filters.doctorId}
            onChange={(e) => onChange({ ...filters, doctorId: e.target.value })}
            placeholder="All doctors"
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Revenue group by</FormLabel>
          <Select
            size="sm"
            value={filters.groupBy}
            onChange={(e) =>
              onChange({ ...filters, groupBy: e.target.value as ReportGroupBy })
            }
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </Select>
        </FormControl>
        <HStack>
          {onRefresh && (
            <Button size="sm" colorScheme="teal" onClick={onRefresh}>
              Refresh
            </Button>
          )}
        </HStack>
      </SimpleGrid>
      {showStale && cachedAt != null && (
        <Box mt={2} fontSize="sm" color="orange.600" _dark={{ color: 'orange.400' }}>
          Data may be stale. Last updated: {new Date(cachedAt).toLocaleString()}.
        </Box>
      )}
    </Box>
  );
}

export { defaultFilters };
