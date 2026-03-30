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
exports.PermissionsController = void 0;
const common_1 = require("@nestjs/common");
const permissions_service_1 = require("./permissions.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const branch_id_decorator_1 = require("../../common/decorators/branch-id.decorator");
const role_permissions_dto_1 = require("./dto/role-permissions.dto");
const user_overrides_dto_1 = require("./dto/user-overrides.dto");
let PermissionsController = class PermissionsController {
    permissionsService;
    constructor(permissionsService) {
        this.permissionsService = permissionsService;
    }
    getAllRolePermissions() {
        return this.permissionsService.getAllRolePermissions();
    }
    async updateRolePermissions(dto) {
        return this.permissionsService.setRolePermissions(dto.role, dto.permissions);
    }
    async getUserOverrides(user, branchId, userId) {
        this.assertCanManageUserPermissions(user, branchId, userId);
        return this.permissionsService.getUserOverrides(userId, branchId);
    }
    async setUserOverrides(user, branchId, userId, dto) {
        this.assertCanManageUserPermissions(user, branchId, userId);
        return this.permissionsService.setUserOverrides(userId, branchId, dto.overrides);
    }
    assertCanManageUserPermissions(user, branchId, targetUserId) {
        if (user.role === 'SuperAdmin')
            return;
        if (user.role !== 'BranchAdmin') {
            throw new common_1.ForbiddenException('Only BranchAdmin or SuperAdmin can manage user screen access');
        }
        const allowed = user.allowedBranches ?? (user.branchId ? [user.branchId] : []);
        if (!allowed.includes(branchId)) {
            throw new common_1.ForbiddenException('You can only manage permissions for staff in your branch');
        }
        if (user.userId === targetUserId) {
            throw new common_1.ForbiddenException('You cannot change your own screen overrides');
        }
    }
};
exports.PermissionsController = PermissionsController;
__decorate([
    (0, common_1.Get)('roles'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "getAllRolePermissions", null);
__decorate([
    (0, common_1.Put)('roles'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [role_permissions_dto_1.UpdateRolePermissionsDto]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "updateRolePermissions", null);
__decorate([
    (0, common_1.Get)('users/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, branch_id_decorator_1.BranchId)()),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "getUserOverrides", null);
__decorate([
    (0, common_1.Put)('users/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, branch_id_decorator_1.BranchId)()),
    __param(2, (0, common_1.Param)('userId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, user_overrides_dto_1.SetUserOverridesDto]),
    __metadata("design:returntype", Promise)
], PermissionsController.prototype, "setUserOverrides", null);
exports.PermissionsController = PermissionsController = __decorate([
    (0, common_1.Controller)('permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [permissions_service_1.PermissionsService])
], PermissionsController);
//# sourceMappingURL=permissions.controller.js.map