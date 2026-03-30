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
exports.StaffAttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const staff_attendance_entity_1 = require("../../database/entities/staff-attendance.entity");
const user_entity_1 = require("../../database/entities/user.entity");
let StaffAttendanceService = class StaffAttendanceService {
    attendanceRepo;
    userRepo;
    constructor(attendanceRepo, userRepo) {
        this.attendanceRepo = attendanceRepo;
        this.userRepo = userRepo;
    }
    async getByBranch(branchId, fromDate, toDate) {
        const qb = this.attendanceRepo
            .createQueryBuilder('a')
            .where('a.branchId = :branchId', { branchId })
            .orderBy('a.date', 'DESC')
            .addOrderBy('a.userId', 'ASC');
        if (fromDate)
            qb.andWhere('a.date >= :fromDate', { fromDate });
        if (toDate)
            qb.andWhere('a.date <= :toDate', { toDate });
        return qb.getMany();
    }
    async getByUser(branchId, userId, fromDate, toDate) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.branchId !== branchId)
            throw new common_1.ForbiddenException('User not in this branch');
        const qb = this.attendanceRepo
            .createQueryBuilder('a')
            .where('a.branchId = :branchId', { branchId })
            .andWhere('a.userId = :userId', { userId })
            .orderBy('a.date', 'DESC');
        if (fromDate)
            qb.andWhere('a.date >= :fromDate', { fromDate });
        if (toDate)
            qb.andWhere('a.date <= :toDate', { toDate });
        return qb.getMany();
    }
    async upsert(branchId, userId, dto) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.branchId !== branchId)
            throw new common_1.ForbiddenException('User not in this branch');
        let record = await this.attendanceRepo.findOne({
            where: { branchId, userId, date: dto.date },
        });
        if (!record) {
            record = this.attendanceRepo.create({
                branchId,
                userId,
                date: dto.date,
                checkInAt: dto.checkInAt ? new Date(dto.checkInAt) : null,
                checkOutAt: dto.checkOutAt ? new Date(dto.checkOutAt) : null,
            });
        }
        else {
            if (dto.checkInAt !== undefined)
                record.checkInAt = dto.checkInAt ? new Date(dto.checkInAt) : null;
            if (dto.checkOutAt !== undefined)
                record.checkOutAt = dto.checkOutAt ? new Date(dto.checkOutAt) : null;
        }
        return this.attendanceRepo.save(record);
    }
};
exports.StaffAttendanceService = StaffAttendanceService;
exports.StaffAttendanceService = StaffAttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(staff_attendance_entity_1.StaffAttendance)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], StaffAttendanceService);
//# sourceMappingURL=staff-attendance.service.js.map