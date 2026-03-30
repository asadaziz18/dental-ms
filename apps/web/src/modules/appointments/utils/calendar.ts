import type { Appointment } from '@dental-ms/shared-types';
import type { EventInput } from '@fullcalendar/core';

export const STATUS_COLORS: Record<string, string> = {
  Scheduled: '#3182CE',
  Confirmed: '#38A169',
  'In Progress': '#D69E2E',
  Completed: '#718096',
  Cancelled: '#E53E3E',
  'No-Show': '#805AD5',
};

export function appointmentToEvent(a: Appointment): EventInput {
  const title =
    a.patient != null
      ? `${a.patient.firstName} ${a.patient.lastName}`
      : 'Appointment';
  const sub = a.doctor?.fullName ?? a.chair ?? a.type;
  return {
    id: a.id,
    title: sub ? `${title} (${sub})` : title,
    start: a.start,
    end: a.end,
    extendedProps: {
      appointment: a,
      status: a.status,
      type: a.type,
    },
    backgroundColor: STATUS_COLORS[a.status] ?? STATUS_COLORS.Scheduled,
    borderColor: STATUS_COLORS[a.status] ?? STATUS_COLORS.Scheduled,
  };
}

export function appointmentsToEvents(appointments: Appointment[]): EventInput[] {
  return appointments.map(appointmentToEvent);
}
