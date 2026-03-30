declare const TYPES: readonly ["consultation", "procedure", "follow-up"];
declare const STATUSES: readonly ["Scheduled", "Confirmed", "In Progress", "Completed", "Cancelled", "No-Show"];
export declare class CreateAppointmentDto {
    patientId: string;
    doctorId?: string | null;
    chair?: string | null;
    start: string;
    end: string;
    type: (typeof TYPES)[number];
    status?: (typeof STATUSES)[number];
    sendReminder?: boolean;
    notes?: string | null;
}
export {};
