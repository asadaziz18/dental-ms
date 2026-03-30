import { StaffAttendanceService } from './staff-attendance.service';
import { CreateOrUpdateAttendanceDto } from './dto/staff-attendance.dto';
export declare class StaffAttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: StaffAttendanceService);
    getByBranch(branchId: string, fromDate?: string, toDate?: string): Promise<import("../../database/entities").StaffAttendance[]>;
    getByUser(branchId: string, userId: string, fromDate?: string, toDate?: string): Promise<import("../../database/entities").StaffAttendance[]>;
    upsert(branchId: string, userId: string, dto: CreateOrUpdateAttendanceDto): Promise<import("../../database/entities").StaffAttendance>;
}
