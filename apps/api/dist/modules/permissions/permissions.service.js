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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_screen_permission_entity_1 = require("../../database/entities/role-screen-permission.entity");
const user_screen_override_entity_1 = require("../../database/entities/user-screen-override.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const default_role_screens_1 = require("./default-role-screens");
const shared_types_1 = require("@dental-ms/shared-types");
let PermissionsService = class PermissionsService {
    rolePermRepo;
    userOverrideRepo;
    userRepo;
    constructor(rolePermRepo, userOverrideRepo, userRepo) {
        this.rolePermRepo = rolePermRepo;
        this.userOverrideRepo = userOverrideRepo;
        this.userRepo = userRepo;
    }
    async getEffectivePermissions(userId, role, branchId) {
        const rolePerms = await this.getRolePermissions(role);
        if (!branchId) {
            return rolePerms;
        }
        const overrides = await this.userOverrideRepo.find({
            where: { userId, branchId },
        });
        const result = { ...rolePerms };
        for (const o of overrides) {
            result[o.screenKey] = o.allowed;
        }
        return result;
    }
    async getRolePermissions(role) {
        const defaults = default_role_screens_1.DEFAULT_ROLE_SCREENS[role];
        const rows = await this.rolePermRepo.find({ where: { role } });
        const result = { ...defaults };
        for (const r of rows) {
            result[r.screenKey] = r.allowed;
        }
        return result;
    }
    async setRolePermissions(role, permissions) {
        for (const screenKey of shared_types_1.SCREEN_KEYS) {
            const allowed = permissions[screenKey];
            if (allowed === undefined)
                continue;
            await this.rolePermRepo.upsert({ role, screenKey, allowed }, { conflictPaths: ['role', 'screenKey'] });
        }
        return this.getRolePermissions(role);
    }
    async getUserOverrides(userId, branchId) {
        const rows = await this.userOverrideRepo.find({
            where: { userId, branchId },
        });
        const result = {};
        for (const r of rows) {
            result[r.screenKey] = r.allowed;
        }
        return result;
    }
    async setUserOverrides(userId, branchId, overrides) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role === 'SuperAdmin') {
            throw new common_1.ForbiddenException('Cannot set screen overrides for SuperAdmin');
        }
        for (const screenKey of shared_types_1.SCREEN_KEYS) {
            const allowed = overrides[screenKey];
            if (allowed === undefined)
                continue;
            await this.userOverrideRepo.upsert({ userId, branchId, screenKey, allowed }, { conflictPaths: ['userId', 'branchId', 'screenKey'] });
        }
        return this.getUserOverrides(userId, branchId);
    }
    async getAllRolePermissions() {
        const roles = ['SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist', 'Nurse'];
        const out = {};
        for (const role of roles) {
            out[role] = await this.getRolePermissions(role);
        }
        return out;
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_screen_permission_entity_1.RoleScreenPermission)),
    __param(1, (0, typeorm_1.InjectRepository)(user_screen_override_entity_1.UserScreenOverride)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map