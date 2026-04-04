"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sync_event_entity_1 = require("../../database/entities/sync-event.entity");
const staff_service_1 = require("../staff/staff.service");
const staff_schedule_service_1 = require("../staff/staff-schedule.service");
const staff_attendance_service_1 = require("../staff/staff-attendance.service");
const staff_leave_service_1 = require("../staff/staff-leave.service");
const doctor_commission_service_1 = require("../staff/doctor-commission.service");
let SyncService = class SyncService {
    syncEventRepo;
    staffService;
    staffScheduleService;
    staffAttendanceService;
    staffLeaveService;
    doctorCommissionService;
    constructor(syncEventRepo, staffService, staffScheduleService, staffAttendanceService, staffLeaveService, doctorCommissionService) {
        this.syncEventRepo = syncEventRepo;
        this.staffService = staffService;
        this.staffScheduleService = staffScheduleService;
        this.staffAttendanceService = staffAttendanceService;
        this.staffLeaveService = staffLeaveService;
        this.doctorCommissionService = doctorCommissionService;
    }
    async push(branchId, currentUserRole, allowedBranches, operations) {
        const results = [];
        const eventsToRecord = [];
        for (const op of operations) {
            try {
                const result = await this.applyOne(branchId, currentUserRole, allowedBranches, op);
                results.push(result);
                if (result.success) {
                    const entityId = result.serverId ?? op.payload?.id;
                    if (entityId) {
                        eventsToRecord.push({
                            entity: op.entity,
                            entityId,
                            operation: op.operation,
                            payload: op.payload,
                        });
                    }
                }
            }
            catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                results.push({ success: false, error: message });
            }
        }
        if (eventsToRecord.length > 0) {
            await this.recordSyncEventsBatch(branchId, eventsToRecord);
        }
        return results;
    }
    async applyOne(branchId, currentUserRole, allowedBranches, op) {
        const { entity, operation, payload, clientId } = op;
        if (entity === 'staff') {
            if (operation === 'create') {
                const dto = payload;
                const user = await this.staffService.create(currentUserRole, branchId || null, dto);
                return { success: true, serverId: user.id };
            }
            if (operation === 'update') {
                const id = payload.id;
                if (!id)
                    throw new common_1.BadRequestException('Staff update requires id');
                const dto = payload;
                await this.staffService.update(currentUserRole, branchId || null, allowedBranches, id, dto);
                return { success: true };
            }
            if (operation === 'delete') {
                const id = payload.id;
                if (!id)
                    throw new common_1.BadRequestException('Staff delete requires id');
                await this.staffService.remove(currentUserRole, branchId || null, allowedBranches, id);
                return { success: true };
            }
        }
        if (entity === 'staffSchedule' && operation === 'update') {
            const userId = payload.userId;
            const slots = payload.slots;
            if (!userId || !Array.isArray(slots))
                throw new common_1.BadRequestException('staffSchedule update requires userId and slots');
            await this.staffScheduleService.setSchedule(branchId, userId, slots);
            return { success: true };
        }
        if (entity === 'staffAttendance' && (operation === 'create' || operation === 'update')) {
            const userId = payload.userId;
            const date = payload.date;
            const checkInAt = payload.checkInAt;
            const checkOutAt = payload.checkOutAt;
            if (!userId || !date)
                throw new common_1.BadRequestException('staffAttendance requires userId and date');
            await this.staffAttendanceService.upsert(branchId, userId, {
                date,
                checkInAt: checkInAt ?? null,
                checkOutAt: checkOutAt ?? null,
            });
            return { success: true };
        }
        if (entity === 'staffLeave') {
            if (operation === 'create') {
                const dto = payload;
                const leave = await this.staffLeaveService.create(branchId, dto);
                return { success: true, serverId: leave.id };
            }
            if (operation === 'update') {
                const id = payload.id;
                if (!id)
                    throw new common_1.BadRequestException('staffLeave update requires id');
                const dto = payload;
                await this.staffLeaveService.update(branchId, id, dto);
                return { success: true };
            }
            if (operation === 'delete') {
                const id = payload.id;
                if (!id)
                    throw new common_1.BadRequestException('staffLeave delete requires id');
                await this.staffLeaveService.remove(branchId, id);
                return { success: true };
            }
        }
        if (entity === 'doctorCommissionRate' && operation === 'update') {
            const doctorId = payload.doctorId;
            const ratePercent = payload.ratePercent;
            if (!doctorId || ratePercent === undefined)
                throw new common_1.BadRequestException('doctorCommissionRate update requires doctorId and ratePercent');
            await this.doctorCommissionService.setRate(branchId, doctorId, { ratePercent });
            return { success: true };
        }
        throw new common_1.BadRequestException(`Unknown sync entity/operation: ${entity}/${operation}`);
    }
    async recordSyncEventsBatch(branchId, events) {
        const entities = events.map((e) => this.syncEventRepo.create({
            entity: e.entity,
            entityId: e.entityId,
            operation: e.operation,
            payload: e.payload,
            branchId,
        }));
        await this.syncEventRepo.save(entities);
    }
    async pull(branchId, lastSyncedAt) {
        const qb = this.syncEventRepo
            .createQueryBuilder('e')
            .where('e.branchId = :branchId', { branchId })
            .orderBy('e.createdAt', 'ASC');
        if (lastSyncedAt) {
            qb.andWhere('e.createdAt > :lastSyncedAt', { lastSyncedAt });
        }
        return qb.getMany();
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sync_event_entity_1.SyncEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        staff_service_1.StaffService,
        staff_schedule_service_1.StaffScheduleService,
        staff_attendance_service_1.StaffAttendanceService,
        staff_leave_service_1.StaffLeaveService,
        doctor_commission_service_1.DoctorCommissionService])
], SyncService);
//# sourceMappingURL=sync.service.js.map