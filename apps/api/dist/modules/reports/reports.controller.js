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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const branch_id_decorator_1 = require("../../common/decorators/branch-id.decorator");
const branch_guard_1 = require("../../common/guards/branch.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    getDashboard(branchId, date) {
        return this.reportsService.getDashboard(branchId, date);
    }
    getRevenueTrend(branchId, fromDate, toDate, groupBy = 'day', doctorId) {
        const from = fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const to = toDate || new Date().toISOString().slice(0, 10);
        return this.reportsService.getRevenueTrend(branchId, from, to, groupBy, doctorId);
    }
    getTreatmentDistribution(branchId, fromDate, toDate) {
        return this.reportsService.getTreatmentDistribution(branchId, fromDate, toDate);
    }
    getDoctorPerformance(branchId, fromDate, toDate) {
        return this.reportsService.getDoctorPerformance(branchId, fromDate, toDate);
    }
    getNoShowRate(branchId, fromDate, toDate, doctorId) {
        return this.reportsService.getNoShowRate(branchId, fromDate, toDate, doctorId);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('revenue'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __param(3, (0, common_1.Query)('groupBy')),
    __param(4, (0, common_1.Query)('doctorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getRevenueTrend", null);
__decorate([
    (0, common_1.Get)('treatment-distribution'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getTreatmentDistribution", null);
__decorate([
    (0, common_1.Get)('doctor-performance'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getDoctorPerformance", null);
__decorate([
    (0, common_1.Get)('no-show-rate'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __param(3, (0, common_1.Query)('doctorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "getNoShowRate", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map