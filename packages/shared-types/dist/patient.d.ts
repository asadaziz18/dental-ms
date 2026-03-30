/**
 * Patient record — shared between API and web (offline mirror).
 */
export interface Patient {
    id: string;
    branchId: string;
    createdAt: string;
    updatedAt: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
    gender: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    medicalHistory: string | null;
    allergies: string | null;
    insuranceProvider: string | null;
    insuranceId: string | null;
    avatarUrl: string | null;
}
export interface PatientCreateInput {
    firstName: string;
    lastName: string;
    dateOfBirth?: string | null;
    gender?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    medicalHistory?: string | null;
    allergies?: string | null;
    insuranceProvider?: string | null;
    insuranceId?: string | null;
    avatarUrl?: string | null;
}
export interface PatientUpdateInput extends Partial<PatientCreateInput> {
}
export interface PatientListQuery {
    search?: string;
    branchId?: string;
    page?: number;
    limit?: number;
}
export interface PatientListResult {
    data: Patient[];
    total: number;
    page: number;
    limit: number;
}
/** Timeline event for patient history (visits, treatments, payments). */
export type TimelineEventType = 'visit' | 'treatment' | 'payment' | 'appointment';
export interface TimelineEvent {
    id: string;
    type: TimelineEventType;
    title: string;
    description?: string | null;
    date: string;
    metadata?: Record<string, unknown>;
}
export interface PatientTimelineResult {
    patientId: string;
    events: TimelineEvent[];
}
//# sourceMappingURL=patient.d.ts.map