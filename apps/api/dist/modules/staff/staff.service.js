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
exports.StaffService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../database/entities/user.entity");
let StaffService = class StaffService {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async getBranchIdsForList(currentUserRole, branchId, allowedBranches) {
        if (currentUserRole === 'SuperAdmin')
            return [];
        if (branchId)
            return [branchId];
        return allowedBranches ?? [];
    }
    async findAll(currentUserRole, branchId, allowedBranches, branchIdFilter) {
        const branchIds = await this.getBranchIdsForList(currentUserRole, branchId, allowedBranches);
        const qb = this.userRepo.createQueryBuilder('user').orderBy('user.fullName', 'ASC');
        if (currentUserRole !== 'SuperAdmin') {
            if (!branchIds.length)
                return [];
            qb.andWhere('user.branchId IN (:...ids)', { ids: branchIds });
        }
        if (branchIdFilter)
            qb.andWhere('user.branchId = :branchIdFilter', { branchIdFilter });
        return qb.getMany();
    }
    async findOne(currentUserRole, branchId, allowedBranches, id) {
        const user = await this.userRepo.findOne({ where: { id }, relations: ['branch'] });
        if (!user)
            throw new common_1.NotFoundException('Staff not found');
        if (currentUserRole !== 'SuperAdmin') {
            const branchIds = await this.getBranchIdsForList(currentUserRole, branchId, allowedBranches);
            if (!user.branchId || !branchIds.includes(user.branchId))
                throw new common_1.ForbiddenException('Access denied');
        }
        return user;
    }
    async create(currentUserRole, branchId, dto) {
        if (currentUserRole !== 'SuperAdmin' && currentUserRole !== 'BranchAdmin')
            throw new common_1.ForbiddenException('Only admins can create staff');
        if (currentUserRole === 'BranchAdmin' && !branchId)
            throw new common_1.BadRequestException('Branch context required');
        const existing = await this.userRepo.findOne({ where: { email: dto.email.toLowerCase() } });
        if (existing)
            throw new common_1.BadRequestException('Email already registered');
        const assignBranchId = currentUserRole === 'SuperAdmin' ? dto.branchId ?? null : branchId;
        if (dto.role === 'BranchAdmin' || dto.role === 'Doctor' || dto.role === 'Receptionist' || dto.role === 'Nurse') {
            if (!assignBranchId)
                throw new common_1.BadRequestException('Branch required for this role');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = this.userRepo.create({
            email: dto.email.toLowerCase(),
            passwordHash,
            fullName: dto.fullName,
            role: dto.role,
            branchId: assignBranchId,
            isActive: dto.isActive ?? true,
        });
        const saved = await this.userRepo.save(user);
        return this.userRepo.findOneOrFail({ where: { id: saved.id }, relations: ['branch'] });
    }
    async update(currentUserRole, branchId, allowedBranches, id, dto) {
        const user = await this.findOne(currentUserRole, branchId, allowedBranches, id);
        if (currentUserRole !== 'SuperAdmin' && currentUserRole !== 'BranchAdmin')
            throw new common_1.ForbiddenException('Only admins can update staff');
        if (dto.email !== undefined) {
            const existing = await this.userRepo.findOne({ where: { email: dto.email.toLowerCase() } });
            if (existing && existing.id !== id)
                throw new common_1.BadRequestException('Email already in use');
            user.email = dto.email.toLowerCase();
        }
        if (dto.password !== undefined)
            user.passwordHash = await bcrypt.hash(dto.password, 10);
        if (dto.fullName !== undefined)
            user.fullName = dto.fullName;
        if (dto.role !== undefined)
            user.role = dto.role;
        if (dto.branchId !== undefined) {
            if (currentUserRole === 'BranchAdmin')
                throw new common_1.ForbiddenException('Cannot change branch');
            user.branchId = dto.branchId;
        }
        if (dto.isActive !== undefined)
            user.isActive = dto.isActive;
        await this.userRepo.save(user);
        return this.userRepo.findOneOrFail({ where: { id }, relations: ['branch'] });
    }
    async remove(currentUserRole, branchId, allowedBranches, id) {
        await this.findOne(currentUserRole, branchId, allowedBranches, id);
        if (currentUserRole !== 'SuperAdmin' && currentUserRole !== 'BranchAdmin')
            throw new common_1.ForbiddenException('Only admins can remove staff');
        await this.userRepo.delete(id);
    }
};
exports.StaffService = StaffService;
exports.StaffService = StaffService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StaffService);
//# sourceMappingURL=staff.service.js.map