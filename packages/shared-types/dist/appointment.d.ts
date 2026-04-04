/**
 * Appointment — shared between API and web.
 */
export declare const APPOINTMENT_STATUSES: readonly ["Scheduled", "Confirmed", "In Progress", "Completed", "Cancelled", "No-Show"];
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];
export declare const APPOINTMENT_TYPES: readonly ["consultation", "procedure", "follow-up"];
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
    patient?: {
        id: string;
        firstName: string;
        lastName: string;
        phone?: string | null;
        email?: string | null;
    };
    doctor?: {
        id: string;
        fullName: string;
    };
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
//# sourceMappingURL=appointment.d.ts.map