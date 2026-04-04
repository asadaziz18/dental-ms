import { useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
} from '@chakra-ui/react';
import type { Appointment } from '@dental-ms/shared-types';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function patientName(apt: Appointment) {
  const p = apt.patient;
  if (!p) return '—';
  return [p.firstName, p.lastName].filter(Boolean).join(' ') || '—';
}

function typeLabel(type: string) {
  return type.replace(/-/g, ' ');
}

export interface TodaySchedulePrintOverlayProps {
  appointments: Appointment[];
  branchName: string;
  onClose: () => void;
}

export function TodaySchedulePrintOverlay({
  appointments,
  branchName,
  onClose,
}: TodaySchedulePrintOverlayProps) {
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      document.body.classList.add('print-today-schedule-only');
      let ended = false;
      const end = () => {
        if (ended) return;
        ended = true;
        document.body.classList.remove('print-today-schedule-only');
        window.clearTimeout(fallback);
      };
      const fallback = window.setTimeout(end, 5000);
      window.addEventListener('afterprint', end, { once: true });
      window.print();
    }, 200);
    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );
  const todayLine = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box
      className="today-schedule-print-view"
      position="fixed"
      inset={0}
      zIndex={9999}
      bg="white"
      color="gray.900"
      overflow="auto"
      p={{ base: 4, md: 8 }}
      sx={{
        '@media print': {
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          overflow: 'visible',
        },
      }}
    >
      <Box className="no-print" mb={4}>
        <Button size="sm" onClick={onClose}>
          Close
        </Button>
      </Box>

      <Heading as="h1" size="md" mb={1}>
        Today&apos;s schedule
      </Heading>
      <Text fontSize="sm" mb={1}>
        {branchName}
      </Text>
      <Text fontSize="sm" color="gray.600" mb={6}>
        {todayLine}
      </Text>

      {sorted.length === 0 ? (
        <Text>No appointments scheduled for today.</Text>
      ) : (
        <Table size="sm" variant="simple" sx={{ '@media print': { fontSize: '9pt' } }}>
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Time</Th>
              <Th>Patient</Th>
              <Th>Phone</Th>
              <Th>Email</Th>
              <Th>Doctor</Th>
              <Th>Chair</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Notes</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sorted.map((apt, i) => (
              <Tr key={apt.id}>
                <Td>{i + 1}</Td>
                <Td whiteSpace="nowrap">
                  {formatTime(apt.start)} – {formatTime(apt.end)}
                </Td>
                <Td>{patientName(apt)}</Td>
                <Td whiteSpace="nowrap">{apt.patient?.phone?.trim() || '—'}</Td>
                <Td maxW="180px" whiteSpace="normal" wordBreak="break-word">
                  {apt.patient?.email?.trim() || '—'}
                </Td>
                <Td>{apt.doctor?.fullName ?? '—'}</Td>
                <Td>{apt.chair?.trim() || '—'}</Td>
                <Td textTransform="capitalize">{typeLabel(apt.type)}</Td>
                <Td>{apt.status}</Td>
                <Td maxW="200px" whiteSpace="normal" wordBreak="break-word">
                  {apt.notes?.trim() ? apt.notes : '—'}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {sorted.length > 0 && (
        <Text fontSize="xs" color="gray.500" mt={8}>
          Reminders enabled: {sorted.filter((a) => a.sendReminder).length} of {sorted.length}
        </Text>
      )}
    </Box>
  );
}
