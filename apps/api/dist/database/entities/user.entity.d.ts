import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
export type UserRole = 'SuperAdmin' | 'BranchAdmin' | 'Doctor' | 'Receptionist' | 'Nurse';
export declare class User extends BaseEntity {
    email: string;
    passwordHash: string;
    fullName: string;
    role: UserRole;
    branchId: string | null;
    branch: Branch | null;
    isActive: boolean;
}
