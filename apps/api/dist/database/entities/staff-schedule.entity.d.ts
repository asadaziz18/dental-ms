import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { User } from './user.entity';
export declare class StaffSchedule extends BaseEntity {
    branchId: string;
    branch: Branch;
    userId: string;
    user: User;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}
