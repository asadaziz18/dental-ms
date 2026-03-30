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
exports.StaffLeaveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const staff_leave_entity_1 = require("../../database/entities/staff-leave.entity");
const user_entity_1 = require("../../database/entities/user.entity");
let StaffLeaveService = class StaffLeaveService {
    leaveRepo;
    userRepo;
    constructor(leaveRepo, userRepo) {
        this.leaveRepo = leaveRepo;
        this.userRepo = userRepo;
    }
    async findByBranch(branchId, fromDate, toDate) {
        const qb = this.leaveRepo
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.user', 'user')
            .where('l.branchId = :branchId', { branchId })
            .orderBy('l.fromDate', 'DESC');
        if (fromDate)
            qb.andWhere('l.toDate >= :fromDate', { fromDate });
        if (toDate)
            qb.andWhere('l.fromDate <= :toDate', { toDate });
        return qb.getMany();
    }
    async findByUser(branchId, userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.branchId !== branchId)
            throw new common_1.ForbiddenException('User not in this branch');
        return this.leaveRepo.find({
            where: { branchId, userId },
            order: { fromDate: 'DESC' },
        });
    }
    async findOne(branchId, id) {
        const leave = await this.leaveRepo.findOne({
            where: { id, branchId },
            relations: ['user'],
        });
        if (!leave)
            throw new common_1.NotFoundException('Leave record not found');
        return leave;
    }
    async create(branchId, dto) {
        const user = await this.userRepo.findOne({ where: { id: dto.userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.branchId !== branchId)
            throw new common_1.ForbiddenException('User not in this branch');
        if (dto.branchId !== branchId)
            throw new common_1.ForbiddenException('Branch mismatch');
        const leave = this.leaveRepo.create({
            userId: dto.userId,
            branchId: dto.branchId,
            fromDate: dto.fromDate,
            toDate: dto.toDate,
            type: dto.type ?? 'annual',
            status: 'Pending',
            notes: dto.notes ?? null,
        });
        return this.leaveRepo.save(leave);
    }
    async update(branchId, id, dto) {
        const leave = await this.findOne(branchId, id);
        if (dto.status !== undefined)
            leave.status = dto.status;
        if (dto.notes !== undefined)
            leave.notes = dto.notes;
        return this.leaveRepo.save(leave);
    }
    async remove(branchId, id) {
        await this.findOne(branchId, id);
        await this.leaveRepo.delete(id);
    }
};
exports.StaffLeaveService = StaffLeaveService;
exports.StaffLeaveService = StaffLeaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(staff_leave_entity_1.StaffLeave)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], StaffLeaveService);
//# sourceMappingURL=staff-leave.service.js.map