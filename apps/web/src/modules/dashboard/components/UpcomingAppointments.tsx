import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Skeleton, Text, VStack, Badge } from '@chakra-ui/react';
import type { UpcomingAppointmentItem } from '../api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function patientName(apt: UpcomingAppointmentItem) {
  const p = apt.patient;
  if (!p) return '—';
  return [p.firstName, p.lastName].filter(Boolean).join(' ');
}

interface UpcomingAppointmentsProps {
  appointments: UpcomingAppointmentItem[] | undefined;
  isLoading: boolean;
}

export function UpcomingAppointments({ appointments, isLoading }: UpcomingAppointmentsProps) {
  if (isLoading) {
    return (
      <Box bg="white" _dark={{ bg: 'gray.800' }} p={4} borderRadius="lg" borderWidth="1px">
        <Skeleton height="6" mb={4} />
        <VStack align="stretch" spacing={3}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="14" />
          ))}
        </VStack>
      </Box>
    );
  }

  const list = (appointments ?? []).slice(0, 5);

  return (
    <Box bg="white" _dark={{ bg: 'gray.800' }} p={4} borderRadius="lg" borderWidth="1px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontWeight="600" fontSize="lg">
          Upcoming (next 7 days)
        </Text>
        <Button as={RouterLink} to="/appointments" size="xs" variant="link" colorScheme="teal">
          View All
        </Button>
      </Box>
      {list.length === 0 ? (
        <Text color="gray.500" py={6} textAlign="center" fontSize="sm">
          No upcoming appointments
        </Text>
      ) : (
        <VStack align="stretch" spacing={2}>
          {list.map((apt) => (
            <Box
              key={apt.id}
              p={2}
              borderRadius="md"
              borderWidth="1px"
              borderColor="gray.100"
              _dark={{ borderColor: 'whiteAlpha.200' }}
            >
              <Badge fontSize="xs" colorScheme="teal" mb={1}>
                {formatDate(apt.start)} · {formatTime(apt.start)}
              </Badge>
              <Text fontSize="sm" fontWeight="500">
                {patientName(apt)}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {apt.doctor?.fullName ?? '—'} · {apt.type}
              </Text>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}
