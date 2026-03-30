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
exports.LabVendorsController = void 0;
const common_1 = require("@nestjs/common");
const lab_vendors_service_1 = require("./lab-vendors.service");
const create_lab_vendor_dto_1 = require("./dto/create-lab-vendor.dto");
const update_lab_vendor_dto_1 = require("./dto/update-lab-vendor.dto");
const vendor_status_dto_1 = require("./dto/vendor-status.dto");
const lab_query_dto_1 = require("./dto/lab-query.dto");
const branch_id_decorator_1 = require("../../common/decorators/branch-id.decorator");
const branch_guard_1 = require("../../common/guards/branch.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const lab_orders_service_1 = require("./lab-orders.service");
let LabVendorsController = class LabVendorsController {
    vendorsService;
    ordersService;
    constructor(vendorsService, ordersService) {
        this.vendorsService = vendorsService;
        this.ordersService = ordersService;
    }
    async getTenantId(branchId, user) {
        if (user.role === 'SuperAdmin')
            return null;
        return this.ordersService.getTenantIdFromBranch(branchId);
    }
    async findAll(branchId, user, query) {
        const tenantId = await this.getTenantId(branchId, user);
        return this.vendorsService.findAll(tenantId, query);
    }
    async create(branchId, _user, dto) {
        const tenantId = await this.ordersService.getTenantIdFromBranch(branchId);
        if (!tenantId)
            throw new Error('Branch must belong to a tenant to create vendor');
        return this.vendorsService.create(tenantId, dto);
    }
    async findOne(id, branchId, user) {
        const tenantId = await this.getTenantId(branchId, user);
        return this.vendorsService.findOneWithOrderSummary(id, tenantId);
    }
    async update(id, branchId, user, dto) {
        const tenantId = await this.getTenantId(branchId, user);
        return this.vendorsService.update(id, tenantId, dto);
    }
    async updateStatus(id, branchId, user, dto) {
        const tenantId = await this.getTenantId(branchId, user);
        return this.vendorsService.updateStatus(id, tenantId, dto.isActive);
    }
    async remove(id, branchId, user) {
        const tenantId = user.role === 'SuperAdmin' ? null : await this.getTenantId(branchId, user);
        await this.vendorsService.remove(id, tenantId);
    }
};
exports.LabVendorsController = LabVendorsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, lab_query_dto_1.LabVendorQueryDto]),
    __metadata("design:returntype", Promise)
], LabVendorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_lab_vendor_dto_1.CreateLabVendorDto]),
    __metadata("design:returntype", Promise)
], LabVendorsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, branch_id_decorator_1.BranchId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LabVendorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, branch_id_decorator_1.BranchId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, update_lab_vendor_dto_1.UpdateLabVendorDto]),
    __metadata("design:returntype", Promise)
], LabVendorsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, branch_id_decorator_1.BranchId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, vendor_status_dto_1.VendorStatusDto]),
    __metadata("design:returntype", Promise)
], LabVendorsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, branch_id_decorator_1.BranchId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LabVendorsController.prototype, "remove", null);
exports.LabVendorsController = LabVendorsController = __decorate([
    (0, common_1.Controller)('lab/vendors'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [lab_vendors_service_1.LabVendorsService,
        lab_orders_service_1.LabOrdersService])
], LabVendorsController);
//# sourceMappingURL=lab-vendors.controller.js.map