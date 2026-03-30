import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Skeleton,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import type { TodayAppointmentItem } from '../api';
import { PatientDrawer } from './PatientDrawer';

const STATUS_COLORS: Record<string, string> = {
  Scheduled: 'blue',
  Confirmed: 'teal',
  'In Progress': 'yellow',
  Completed: 'green',
  Cancelled: 'red',
  'No-Show': 'gray',
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function patientName(apt: TodayAppointmentItem) {
  const p = apt.patient;
  if (!p) return '—';
  return [p.firstName, p.lastName].filter(Boolean).join(' ');
}

interface TodayScheduleProps {
  appointments: TodayAppointmentItem[] | undefined;
  isLoading: boolean;
}

export function TodaySchedule({ appointments, isLoading }: TodayScheduleProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handleRowClick = (patientId: string) => {
    setSelectedPatientId(patientId);
    onOpen();
  };

  if (isLoading) {
    return (
      <Box bg="white" _dark={{ bg: 'gray.800' }} p={4} borderRadius="lg" borderWidth="1px">
        <Skeleton height="8" mb={4} />
        <Skeleton height="200px" />
      </Box>
    );
  }

  const list = appointments ?? [];

  return (
    <Box bg="white" _dark={{ bg: 'gray.800' }} p={4} borderRadius="lg" borderWidth="1px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontWeight="600" fontSize="lg">
          Today's Appointments
        </Text>
        <Button as={RouterLink} to="/appointments" size="sm" colorScheme="teal" variant="outline">
          View All
        </Button>
      </Box>
      {list.length === 0 ? (
        <Text color="gray.500" py={6} textAlign="center">
          No appointments scheduled for today
        </Text>
      ) : (
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Time</Th>
              <Th>Patient</Th>
              <Th>Doctor</Th>
              <Th>Type</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {list.map((apt) => (
              <Tr
                key={apt.id}
                cursor="pointer"
                _hover={{ bg: 'gray.50', _dark: { bg: 'whiteAlpha.100' } }}
                onClick={() => apt.patient?.id && handleRowClick(apt.patient.id)}
              >
                <Td>{formatTime(apt.start)}</Td>
                <Td>{patientName(apt)}</Td>
                <Td>{apt.doctor?.fullName ?? '—'}</Td>
                <Td textTransform="capitalize">{apt.type}</Td>
                <Td>
                  <Badge colorScheme={STATUS_COLORS[apt.status] ?? 'gray'}>{apt.status}</Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      {selectedPatientId && (
        <PatientDrawer
          patientId={selectedPatientId}
          isOpen={isOpen}
          onClose={() => {
            onClose();
            setSelectedPatientId(null);
          }}
        />
      )}
    </Box>
  );
}

