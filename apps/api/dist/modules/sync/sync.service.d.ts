import { Repository } from 'typeorm';
import { SyncEvent } from '../../database/entities/sync-event.entity';
import { StaffService } from '../staff/staff.service';
import { StaffScheduleService } from '../staff/staff-schedule.service';
import { StaffAttendanceService } from '../staff/staff-attendance.service';
import { StaffLeaveService } from '../staff/staff-leave.service';
import { DoctorCommissionService } from '../staff/doctor-commission.service';
import type { UserRole } from '../../database/entities/user.entity';
export interface SyncOperationInput {
    entity: string;
    operation: 'create' | 'update' | 'delete';
    payload: Record<string, unknown>;
    clientId?: string;
}
export interface SyncPushResult {
    success: boolean;
    serverId?: string;
    error?: string;
}
export declare class SyncService {
    private readonly syncEventRepo;
    private readonly staffService;
    private readonly staffScheduleService;
    private readonly staffAttendanceService;
    private readonly staffLeaveService;
    private readonly doctorCommissionService;
    constructor(syncEventRepo: Repository<SyncEvent>, staffService: StaffService, staffScheduleService: StaffScheduleService, staffAttendanceService: StaffAttendanceService, staffLeaveService: StaffLeaveService, doctorCommissionService: DoctorCommissionService);
    push(branchId: string, currentUserRole: UserRole, allowedBranches: string[], operations: SyncOperationInput[]): Promise<SyncPushResult[]>;
    private applyOne;
    private recordSyncEventsBatch;
    pull(branchId: string, lastSyncedAt?: string): Promise<SyncEvent[]>;
}
