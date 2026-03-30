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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const branch_id_decorator_1 = require("../../common/decorators/branch-id.decorator");
const branch_guard_1 = require("../../common/guards/branch.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getSummary(branchId) {
        return this.dashboardService.getSummary(branchId);
    }
    getTodayAppointments(branchId, user, doctorId) {
        const filterDoctorId = user?.role === 'Doctor' ? user.userId : doctorId ?? undefined;
        return this.dashboardService.getTodayAppointments(branchId, filterDoctorId);
    }
    getRevenueChart(branchId, range) {
        return this.dashboardService.getRevenueChart(branchId, range === '12m' ? '12m' : '30d');
    }
    getUpcomingAppointments(branchId, user, days, doctorId) {
        const filterDoctorId = user?.role === 'Doctor' ? user.userId : doctorId ?? undefined;
        return this.dashboardService.getUpcomingAppointments(branchId, parseInt(days ?? '7', 10) || 7, filterDoctorId);
    }
    getLowStock(branchId) {
        return this.dashboardService.getLowStock(branchId);
    }
    getDoctorPerformance(branchId, month) {
        return this.dashboardService.getDoctorPerformance(branchId, month);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('appointments/today'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('doctorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getTodayAppointments", null);
__decorate([
    (0, common_1.Get)('revenue-chart'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Query)('range')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getRevenueChart", null);
__decorate([
    (0, common_1.Get)('upcoming-appointments'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('days')),
    __param(3, (0, common_1.Query)('doctorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getUpcomingAppointments", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getLowStock", null);
__decorate([
    (0, common_1.Get)('doctor-performance'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getDoctorPerformance", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map