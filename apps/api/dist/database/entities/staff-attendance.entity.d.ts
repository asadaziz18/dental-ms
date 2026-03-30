import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { User } from './user.entity';
export declare class StaffAttendance extends BaseEntity {
    branchId: string;
    branch: Branch;
    userId: string;
    user: User;
    date: string;
    checkInAt: Date | null;
    checkOutAt: Date | null;
}
