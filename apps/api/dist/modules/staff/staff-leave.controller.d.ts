import { StaffLeaveService } from './staff-leave.service';
import { CreateStaffLeaveDto } from './dto/staff-leave.dto';
import { UpdateStaffLeaveDto } from './dto/staff-leave.dto';
export declare class StaffLeaveController {
    private readonly leaveService;
    constructor(leaveService: StaffLeaveService);
    findByBranch(branchId: string, fromDate?: string, toDate?: string): Promise<import("../../database/entities").StaffLeave[]>;
    findByUser(branchId: string, userId: string): Promise<import("../../database/entities").StaffLeave[]>;
    findOne(branchId: string, id: string): Promise<import("../../database/entities").StaffLeave>;
    create(branchId: string, dto: CreateStaffLeaveDto): Promise<import("../../database/entities").StaffLeave>;
    update(branchId: string, id: string, dto: UpdateStaffLeaveDto): Promise<import("../../database/entities").StaffLeave>;
    remove(branchId: string, id: string): Promise<void>;
}
