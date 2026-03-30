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
exports.LabOrdersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const lab_orders_service_1 = require("./lab-orders.service");
const create_lab_order_dto_1 = require("./dto/create-lab-order.dto");
const update_lab_order_dto_1 = require("./dto/update-lab-order.dto");
const order_status_dto_1 = require("./dto/order-status.dto");
const order_payment_dto_1 = require("./dto/order-payment.dto");
const create_lab_trial_dto_1 = require("./dto/create-lab-trial.dto");
const update_lab_trial_dto_1 = require("./dto/update-lab-trial.dto");
const complete_trial_dto_1 = require("./dto/complete-trial.dto");
const trial_notify_dto_1 = require("./dto/trial-notify.dto");
const lab_query_dto_1 = require("./dto/lab-query.dto");
const branch_id_decorator_1 = require("../../common/decorators/branch-id.decorator");
const branch_guard_1 = require("../../common/guards/branch.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const storage_interface_1 = require("../imaging/storage/storage.interface");
const config_1 = require("@nestjs/config");
let LabOrdersController = class LabOrdersController {
    ordersService;
    config;
    storage;
    constructor(ordersService, config, storage) {
        this.ordersService = ordersService;
        this.config = config;
        this.storage = storage;
    }
    async getTenantId(branchId, user) {
        if (user.role === 'SuperAdmin')
            return null;
        return this.ordersService.getTenantIdFromBranch(branchId);
    }
    async getDashboard(branchId, user) {
        const tenantId = await this.getTenantId(branchId, user);
        return this.ordersService.getDashboardStats(branchId, tenantId);
    }
    async findAll(branchId, user, query) {
        const tenantId = await this.getTenantId(branchId, user);
        return this.ordersService.findAll(branchId, tenantId, query);
    }
    async create(branchId, user, dto) {
        const tenantId = await this.getTenantId(branchId, user);
        if (!tenantId)
            throw new Error('Branch tenant required to create order');
        return this.ordersService.create(tenantId, branchId, user.userId, dto);
    }
    async findOne(id, branchId, user) {
        const tenantId = await this.getTenantId(branchId, user);
        return this.ordersService.findOne(id, branchId, tenantId);
    }
    async update(id, branchId, user, dto) {
        const tenantId = await this.getTenantId(branchId, user);
        return this.ordersService.update(id, branchId, tenantId, dto);
    }
    async updateStatus(id, branchId, user, dto) {
        const tenantId = await this.getTenantId(branchId, user);
        return this.ordersService.updateStatus(id, branchId, tenantId, dto.status);
    }
    async updatePayment(id, branchId, user, dto) {
        const tenantId = await this.getTenantId(branchId, user);
        return this.ordersService.updatePayment(id, branchId, tenantId, dto.isPaid, dto.labFee);
    }
    async addAttachment(id, branchId, user, file) {
        const tenantId = await this.getTenantId(branchId, user);
        const key = `lab-orders/${id}/${Date.now()}-${(file?.originalname ?? 'file').replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        await this.storage.upload(key, file.buffer, file.mimetype);
        const driver = this.config.get('STORAGE_DRIVER', 's3');
        let url;
        if (driver === 'local') {
            const baseUrl = this.config.get('APP_PUBLIC_URL', 'http://localhost:3000').replace(/\/$/, '');
            url = `${baseUrl}/lab/orders/${id}/attachments/serve?key=${encodeURIComponent(key)}`;
        }
        else {
            const baseUrl = this.config.get('S3_PUBLIC_BASE_URL');
            url = baseUrl ? `${baseUrl}/${key}` : key;
        }
        return this.ordersService.addAttachment(id, branchId, tenantId, url);
    }
    async serveAttachment(id, branchId, user, key, res) {
        const tenantId = await this.getTenantId(branchId, user);
        await this.ordersService.findOne(id, branchId, tenantId);
        if (!key || !key.startsWith(`lab-orders/${id}/`)) {
            return res.status(400).json({ message: 'Invalid key' });
        }
        if (!this.storage.getReadStream) {
            return res.status(501).json({ message: 'Storage does not support streaming' });
        }
        const stream = await this.storage.getReadStream(key);
        if (!stream)
            return res.status(404).json({ message: 'File not found' });
        res.setHeader('Content-Disposition', 'inline');
        stream.pipe(res);
    }
    async getTrials(orderId, branchId, user) {
        const tenantId = await this.getTenantId(branchId, user);
        return this.ordersService.getTrials(orderId, branchId, tenantId);
    }
    async createTrial(orderId, branchId, user, dto) {
        const tenantId = await this.getTenantId(branchId, user);
        return this.ordersService.createTrial(orderId, branchId, tenantId, user.userId, dto);
    }
    async updateTrial(orderId, trialId, branchId, user, dto) {
        const tenantId = await this.getTenantId(branchId, user);
        return this.ordersService.updateTrial(orderId, trialId, branchId, tenantId, dto);
    }
    async completeTrial(orderId, trialId, branchId, user, dto) {
        const tenantId = await this.getTenantId(branchId, user);
        return this.ordersService.completeTrial(orderId, trialId, branchId, tenantId, user.userId, dto);
    }
    async notifyTrial(orderId, trialId, branchId, user, dto) {
        const tenantId = await this.getTenantId(branchId, user);
        await this.ordersService.notifyTrial(orderId, trialId, branchId, tenantId, dto.channel, dto.message);
    }
};
exports.LabOrdersController = LabOrdersController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LabOrdersController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, lab_query_dto_1.LabOrderQueryDto]),
    __metadata("design:returntype", Promise)
], LabOrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_lab_order_dto_1.CreateLabOrderDto]),
    __metadata("design:returntype", Promise)
], LabOrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, branch_id_decorator_1.BranchId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LabOrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, branch_id_decorator_1.BranchId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, update_lab_order_dto_1.UpdateLabOrderDto]),
    __metadata("design:returntype", Promise)
], LabOrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, branch_id_decorator_1.BranchId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, order_status_dto_1.OrderStatusDto]),
    __metadata("design:returntype", Promise)
], LabOrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/payment'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, branch_id_decorator_1.BranchId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, order_payment_dto_1.OrderPaymentDto]),
    __metadata("design:returntype", Promise)
], LabOrdersController.prototype, "updatePayment", null);
__decorate([
    (0, common_1.Post)(':id/attachments'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, branch_id_decorator_1.BranchId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], LabOrdersController.prototype, "addAttachment", null);
__decorate([
    (0, common_1.Get)(':id/attachments/serve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, branch_id_decorator_1.BranchId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Query)('key')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], LabOrdersController.prototype, "serveAttachment", null);
__decorate([
    (0, common_1.Get)(':orderId/trials'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, branch_id_decorator_1.BranchId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LabOrdersController.prototype, "getTrials", null);
__decorate([
    (0, common_1.Post)(':orderId/trials'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, branch_id_decorator_1.BranchId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, create_lab_trial_dto_1.CreateLabTrialDto]),
    __metadata("design:returntype", Promise)
], LabOrdersController.prototype, "createTrial", null);
__decorate([
    (0, common_1.Patch)(':orderId/trials/:trialId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Param)('trialId')),
    __param(2, (0, branch_id_decorator_1.BranchId)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, update_lab_trial_dto_1.UpdateLabTrialDto]),
    __metadata("design:returntype", Promise)
], LabOrdersController.prototype, "updateTrial", null);
__decorate([
    (0, common_1.Patch)(':orderId/trials/:trialId/complete'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin', 'Doctor'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Param)('trialId')),
    __param(2, (0, branch_id_decorator_1.BranchId)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, complete_trial_dto_1.CompleteTrialDto]),
    __metadata("design:returntype", Promise)
], LabOrdersController.prototype, "completeTrial", null);
__decorate([
    (0, common_1.Post)(':orderId/trials/:trialId/notify'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Param)('trialId')),
    __param(2, (0, branch_id_decorator_1.BranchId)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, trial_notify_dto_1.TrialNotifyDto]),
    __metadata("design:returntype", Promise)
], LabOrdersController.prototype, "notifyTrial", null);
exports.LabOrdersController = LabOrdersController = __decorate([
    (0, common_1.Controller)('lab/orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, branch_guard_1.BranchGuard),
    __param(2, (0, common_1.Inject)(storage_interface_1.STORAGE_SERVICE)),
    __metadata("design:paramtypes", [lab_orders_service_1.LabOrdersService,
        config_1.ConfigService, Object])
], LabOrdersController);
//# sourceMappingURL=lab-orders.controller.js.map