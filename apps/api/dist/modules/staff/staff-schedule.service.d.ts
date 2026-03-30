import { Repository } from 'typeorm';
import { StaffSchedule } from '../../database/entities/staff-schedule.entity';
import { User } from '../../database/entities/user.entity';
import { UpsertStaffScheduleDto } from './dto/staff-schedule.dto';
export declare class StaffScheduleService {
    private readonly scheduleRepo;
    private readonly userRepo;
    constructor(scheduleRepo: Repository<StaffSchedule>, userRepo: Repository<User>);
    getByUser(branchId: string, userId: string): Promise<StaffSchedule[]>;
    setSchedule(branchId: string, userId: string, slots: UpsertStaffScheduleDto[]): Promise<StaffSchedule[]>;
}
