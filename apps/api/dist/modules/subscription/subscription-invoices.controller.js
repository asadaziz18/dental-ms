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
exports.SubscriptionInvoicesController = void 0;
const common_1 = require("@nestjs/common");
const subscription_invoices_service_1 = require("./subscription-invoices.service");
const branch_id_decorator_1 = require("../../common/decorators/branch-id.decorator");
const branch_guard_1 = require("../../common/guards/branch.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let SubscriptionInvoicesController = class SubscriptionInvoicesController {
    invoicesService;
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    listMyInvoices(branchId) {
        return this.invoicesService.listByBranch(branchId);
    }
    listAll() {
        return this.invoicesService.listAll();
    }
    markAsPaid(id) {
        return this.invoicesService.markAsPaid(id);
    }
};
exports.SubscriptionInvoicesController = SubscriptionInvoicesController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(branch_guard_1.BranchGuard),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubscriptionInvoicesController.prototype, "listMyInvoices", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubscriptionInvoicesController.prototype, "listAll", null);
__decorate([
    (0, common_1.Patch)(':id/mark-paid'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SuperAdmin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubscriptionInvoicesController.prototype, "markAsPaid", null);
exports.SubscriptionInvoicesController = SubscriptionInvoicesController = __decorate([
    (0, common_1.Controller)('subscription/invoices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [subscription_invoices_service_1.SubscriptionInvoicesService])
], SubscriptionInvoicesController);
//# sourceMappingURL=subscription-invoices.controller.js.map