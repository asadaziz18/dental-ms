import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { User } from './user.entity';
export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'other';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
export declare class StaffLeave extends BaseEntity {
    userId: string;
    user: User;
    branchId: string;
    branch: Branch;
    fromDate: string;
    toDate: string;
    type: LeaveType;
    status: LeaveStatus;
    notes: string | null;
}
