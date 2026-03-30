import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Skeleton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
} from '@chakra-ui/react';
import type { DoctorPerformanceRow } from '../api';

function formatPkr(n: number) {
  return `PKR ${n.toLocaleString()}`;
}

interface DoctorPerformanceTableProps {
  data: DoctorPerformanceRow[] | undefined;
  isLoading: boolean;
}

export function DoctorPerformanceTable({ data, isLoading }: DoctorPerformanceTableProps) {
  if (isLoading) {
    return (
      <Box bg="white" _dark={{ bg: 'gray.800' }} p={4} borderRadius="lg" borderWidth="1px">
        <Skeleton height="6" mb={4} />
        <Skeleton height="120px" />
      </Box>
    );
  }

  const rows = data ?? [];

  return (
    <Box bg="white" _dark={{ bg: 'gray.800' }} p={4} borderRadius="lg" borderWidth="1px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontWeight="600" fontSize="lg">
          Doctor Performance (this month)
        </Text>
        <Button as={RouterLink} to="/reports" size="sm" variant="outline" colorScheme="teal">
          View Full Report
        </Button>
      </Box>
      {rows.length === 0 ? (
        <Text color="gray.500" py={4}>
          No data
        </Text>
      ) : (
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Doctor</Th>
              <Th isNumeric>Patients Seen</Th>
              <Th isNumeric>Procedures Done</Th>
              <Th isNumeric>Revenue</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((r) => (
              <Tr key={r.doctorId}>
                <Td>{r.name}</Td>
                <Td isNumeric>{r.patientsSeen}</Td>
                <Td isNumeric>{r.proceduresDone}</Td>
                <Td isNumeric>{formatPkr(r.revenue)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
