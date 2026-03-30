import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Patient } from './patient.entity';
import { User } from './user.entity';
export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No-Show';
export type AppointmentType = 'consultation' | 'procedure' | 'follow-up';
export declare class Appointment extends BaseEntity {
    branchId: string;
    branch: Branch;
    patientId: string;
    patient: Patient;
    doctorId: string | null;
    doctor: User | null;
    chair: string | null;
    start: Date;
    end: Date;
    type: AppointmentType;
    status: AppointmentStatus;
    sendReminder: boolean;
    notes: string | null;
}
