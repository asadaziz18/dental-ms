import { StaffScheduleService } from './staff-schedule.service';
import { UpsertStaffScheduleDto } from './dto/staff-schedule.dto';
export declare class StaffScheduleController {
    private readonly scheduleService;
    constructor(scheduleService: StaffScheduleService);
    getByUser(branchId: string, userId: string): Promise<import("../../database/entities").StaffSchedule[]>;
    setSchedule(branchId: string, userId: string, body: {
        slots: UpsertStaffScheduleDto[];
    }): Promise<import("../../database/entities").StaffSchedule[]>;
}
