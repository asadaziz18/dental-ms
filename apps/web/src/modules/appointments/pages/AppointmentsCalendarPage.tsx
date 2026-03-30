import { useState, useCallback } from 'react';
import { Box, Button, Heading, useDisclosure } from '@chakra-ui/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DatesSetArg, EventClickArg } from '@fullcalendar/core';
import { useBranchId } from '@/core/branch';
import { useAppointmentsQuery } from '../hooks/use-appointments';
import { useAppointmentSocket } from '../hooks/use-appointment-socket';
import { appointmentsToEvents } from '../utils/calendar';
import type { Appointment } from '@dental-ms/shared-types';
import { CreateAppointmentModal } from '../components/CreateAppointmentModal';
import { AppointmentDetailModal } from '../components/AppointmentDetailModal';

export function AppointmentsCalendarPage() {
  const [range, setRange] = useState<{ start: string; end: string }>(() => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    return { start: start.toISOString(), end: end.toISOString() };
  });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const createModal = useDisclosure();
  const detailModal = useDisclosure();

  const branchId = useBranchId();
  useAppointmentSocket(branchId);

  const { data: appointments = [] } = useAppointmentsQuery({
    branchId: branchId ?? undefined,
    start: range.start,
    end: range.end,
  });

  const events = appointmentsToEvents(appointments);

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setRange({ start: arg.startStr, end: arg.endStr });
  }, []);

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      const appointment = (info.event.extendedProps as { appointment?: Appointment }).appointment;
      if (appointment) {
        setSelectedAppointment(appointment);
        detailModal.onOpen();
      }
    },
    [detailModal],
  );

  const [initialDates, setInitialDates] = useState<{ start: string; end: string } | undefined>();

  const handleSelect = useCallback(
    (info: { startStr: string; endStr: string }) => {
      const start = new Date(info.startStr);
      const end = new Date(info.endStr);
      const pad = (n: number) => String(n).padStart(2, '0');
      const startLocal = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}T${pad(start.getHours())}:${pad(start.getMinutes())}`;
      const endLocal = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`;
      setInitialDates({ start: startLocal, end: endLocal });
      createModal.onOpen();
    },
    [createModal],
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg" color="teal.700">
          Appointments
        </Heading>
        <Button colorScheme="teal" size="sm" onClick={createModal.onOpen}>
          New appointment
        </Button>
      </Box>

      <Box bg="white" p={4} borderRadius="lg" shadow="sm">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          datesSet={handleDatesSet}
          eventClick={handleEventClick}
          selectable
          select={handleSelect}
          height="auto"
          slotMinTime="06:00:00"
          slotMaxTime="20:00:00"
          nowIndicator
        />
      </Box>

      <CreateAppointmentModal
        isOpen={createModal.isOpen}
        onClose={() => { createModal.onClose(); setInitialDates(undefined); }}
        initialStart={initialDates?.start}
        initialEnd={initialDates?.end}
      />

      <AppointmentDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => { detailModal.onClose(); setSelectedAppointment(null); }}
        appointment={selectedAppointment}
      />
    </Box>
  );
}
