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
exports.DoctorCommissionController = void 0;
const common_1 = require("@nestjs/common");
const doctor_commission_service_1 = require("./doctor-commission.service");
const doctor_commission_dto_1 = require("./dto/doctor-commission.dto");
const branch_id_decorator_1 = require("../../common/decorators/branch-id.decorator");
const branch_guard_1 = require("../../common/guards/branch.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let DoctorCommissionController = class DoctorCommissionController {
    commissionService;
    constructor(commissionService) {
        this.commissionService = commissionService;
    }
    getSummary(branchId, doctorId, fromDate, toDate) {
        return this.commissionService.getCommissionSummary(branchId, doctorId, fromDate, toDate);
    }
    getRate(branchId, doctorId) {
        return this.commissionService.getRate(branchId, doctorId);
    }
    setRate(branchId, doctorId, dto) {
        return this.commissionService.setRate(branchId, doctorId, dto);
    }
};
exports.DoctorCommissionController = DoctorCommissionController;
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Query)('doctorId')),
    __param(2, (0, common_1.Query)('fromDate')),
    __param(3, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], DoctorCommissionController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('doctor/:doctorId'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('doctorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DoctorCommissionController.prototype, "getRate", null);
__decorate([
    (0, common_1.Put)('doctor/:doctorId'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('doctorId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, doctor_commission_dto_1.SetCommissionRateDto]),
    __metadata("design:returntype", void 0)
], DoctorCommissionController.prototype, "setRate", null);
exports.DoctorCommissionController = DoctorCommissionController = __decorate([
    (0, common_1.Controller)('staff/commission'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [doctor_commission_service_1.DoctorCommissionService])
], DoctorCommissionController);
//# sourceMappingURL=doctor-commission.controller.js.map