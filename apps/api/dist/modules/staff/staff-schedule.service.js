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
exports.StaffScheduleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const staff_schedule_entity_1 = require("../../database/entities/staff-schedule.entity");
const user_entity_1 = require("../../database/entities/user.entity");
let StaffScheduleService = class StaffScheduleService {
    scheduleRepo;
    userRepo;
    constructor(scheduleRepo, userRepo) {
        this.scheduleRepo = scheduleRepo;
        this.userRepo = userRepo;
    }
    async getByUser(branchId, userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.branchId !== branchId)
            throw new common_1.ForbiddenException('User not in this branch');
        return this.scheduleRepo.find({
            where: { branchId, userId },
            order: { dayOfWeek: 'ASC' },
        });
    }
    async setSchedule(branchId, userId, slots) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.branchId !== branchId)
            throw new common_1.ForbiddenException('User not in this branch');
        await this.scheduleRepo.delete({ branchId, userId });
        const created = slots.map((s) => this.scheduleRepo.create({
            branchId,
            userId,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
        }));
        await this.scheduleRepo.save(created);
        return this.scheduleRepo.find({ where: { branchId, userId }, order: { dayOfWeek: 'ASC' } });
    }
};
exports.StaffScheduleService = StaffScheduleService;
exports.StaffScheduleService = StaffScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(staff_schedule_entity_1.StaffSchedule)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], StaffScheduleService);
//# sourceMappingURL=staff-schedule.service.js.map