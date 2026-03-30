import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
export declare class Patient extends BaseEntity {
    branchId: string;
    branch: Branch;
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
    deletedAt: Date | null;
    deletedBy: string | null;
}
