import { Repository } from 'typeorm';
import { StaffLeave } from '../../database/entities/staff-leave.entity';
import { User } from '../../database/entities/user.entity';
import { CreateStaffLeaveDto } from './dto/staff-leave.dto';
import { UpdateStaffLeaveDto } from './dto/staff-leave.dto';
export declare class StaffLeaveService {
    private readonly leaveRepo;
    private readonly userRepo;
    constructor(leaveRepo: Repository<StaffLeave>, userRepo: Repository<User>);
    findByBranch(branchId: string, fromDate?: string, toDate?: string): Promise<StaffLeave[]>;
    findByUser(branchId: string, userId: string): Promise<StaffLeave[]>;
    findOne(branchId: string, id: string): Promise<StaffLeave>;
    create(branchId: string, dto: CreateStaffLeaveDto): Promise<StaffLeave>;
    update(branchId: string, id: string, dto: UpdateStaffLeaveDto): Promise<StaffLeave>;
    remove(branchId: string, id: string): Promise<void>;
}
