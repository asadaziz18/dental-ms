import { Repository } from 'typeorm';
import { StaffAttendance } from '../../database/entities/staff-attendance.entity';
import { User } from '../../database/entities/user.entity';
import { CreateOrUpdateAttendanceDto } from './dto/staff-attendance.dto';
export declare class StaffAttendanceService {
    private readonly attendanceRepo;
    private readonly userRepo;
    constructor(attendanceRepo: Repository<StaffAttendance>, userRepo: Repository<User>);
    getByBranch(branchId: string, fromDate?: string, toDate?: string): Promise<StaffAttendance[]>;
    getByUser(branchId: string, userId: string, fromDate?: string, toDate?: string): Promise<StaffAttendance[]>;
    upsert(branchId: string, userId: string, dto: CreateOrUpdateAttendanceDto): Promise<StaffAttendance>;
}
