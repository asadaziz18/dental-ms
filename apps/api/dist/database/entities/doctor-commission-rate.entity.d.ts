import { BaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { User } from './user.entity';
export declare class DoctorCommissionRate extends BaseEntity {
    branchId: string;
    branch: Branch;
    doctorId: string;
    doctor: User;
    ratePercent: string;
}
