/**
 * Appointment — shared between API and web.
 */
export const APPOINTMENT_STATUSES = [
  'Scheduled',
  'Confirmed',
  'In Progress',
  'Completed',
  'Cancelled',
  'No-Show',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_TYPES = [
  'consultation',
  'procedure',
  'follow-up',
] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

export interface Appointment {
  id: string;
  branchId: string;
  patientId: string;
  doctorId: string | null;
  chair: string | null;
  start: string;
  end: string;
  type: AppointmentType;
  status: AppointmentStatus;
  sendReminder: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: { id: string; firstName: string; lastName: string };
  doctor?: { id: string; fullName: string };
}

export interface AppointmentCreateInput {
  patientId: string;
  doctorId?: string | null;
  chair?: string | null;
  start: string;
  end: string;
  type: AppointmentType;
  status?: AppointmentStatus;
  sendReminder?: boolean;
  notes?: string | null;
}

export interface AppointmentUpdateInput {
  patientId?: string;
  doctorId?: string | null;
  chair?: string | null;
  start?: string;
  end?: string;
  type?: AppointmentType;
  status?: AppointmentStatus;
  sendReminder?: boolean;
  notes?: string | null;
}

export interface AppointmentListQuery {
  branchId?: string;
  date?: string;
  doctorId?: string;
  start?: string;
  end?: string;
}
