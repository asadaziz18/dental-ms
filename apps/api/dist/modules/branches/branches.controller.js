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
exports.BranchesController = void 0;
const common_1 = require("@nestjs/common");
const branches_service_1 = require("./branches.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const create_branch_dto_1 = require("./dto/create-branch.dto");
const update_branch_dto_1 = require("./dto/update-branch.dto");
const branch_status_dto_1 = require("./dto/branch-status.dto");
const assign_manager_dto_1 = require("./dto/assign-manager.dto");
const super_admin_only_guard_1 = require("./guards/super-admin-only.guard");
let BranchesController = class BranchesController {
    branchesService;
    constructor(branchesService) {
        this.branchesService = branchesService;
    }
    async createMainBranch(dto) {
        return this.branchesService.createMainBranch(dto);
    }
    async createSubBranch(parentId, dto) {
        return this.branchesService.createSubBranchWithParent(parentId, dto);
    }
    async remove(id) {
        return this.branchesService.remove(id);
    }
    async list(user) {
        return this.branchesService.findTree(user?.role ?? '', user?.branchId ?? null);
    }
    async findOne(id, user) {
        return this.branchesService.findOne(id, user?.role ?? '', user?.branchId ?? null);
    }
    async update(id, dto, user) {
        return this.branchesService.update(id, dto, user?.role ?? '', user?.branchId ?? null);
    }
    async updateStatus(id, dto, user) {
        return this.branchesService.updateStatus(id, dto, user?.role ?? '', user?.branchId ?? null);
    }
    async getStaff(id, user) {
        return this.branchesService.getStaff(id, user?.role ?? '', user?.branchId ?? null);
    }
    async getStats(id, user) {
        return this.branchesService.getStats(id, user?.role ?? '', user?.branchId ?? null);
    }
    async assignManager(id, dto) {
        return this.branchesService.assignManager(id, dto);
    }
};
exports.BranchesController = BranchesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(super_admin_only_guard_1.SuperAdminOnlyGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_branch_dto_1.CreateBranchDto]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "createMainBranch", null);
__decorate([
    (0, common_1.Post)(':id/sub-branches'),
    (0, common_1.UseGuards)(super_admin_only_guard_1.SuperAdminOnlyGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_branch_dto_1.CreateBranchDto]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "createSubBranch", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(super_admin_only_guard_1.SuperAdminOnlyGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist', 'Nurse'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist', 'Nurse'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_branch_dto_1.UpdateBranchDto, Object]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, branch_status_dto_1.BranchStatusDto, Object]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)(':id/staff'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "getStaff", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)(':id/assign-manager'),
    (0, common_1.UseGuards)(super_admin_only_guard_1.SuperAdminOnlyGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_manager_dto_1.AssignManagerDto]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "assignManager", null);
exports.BranchesController = BranchesController = __decorate([
    (0, common_1.Controller)('branches'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [branches_service_1.BranchesService])
], BranchesController);
//# sourceMappingURL=branches.controller.js.map