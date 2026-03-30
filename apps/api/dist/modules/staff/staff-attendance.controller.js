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
exports.StaffAttendanceController = void 0;
const common_1 = require("@nestjs/common");
const staff_attendance_service_1 = require("./staff-attendance.service");
const staff_attendance_dto_1 = require("./dto/staff-attendance.dto");
const branch_id_decorator_1 = require("../../common/decorators/branch-id.decorator");
const branch_guard_1 = require("../../common/guards/branch.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StaffAttendanceController = class StaffAttendanceController {
    attendanceService;
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    getByBranch(branchId, fromDate, toDate) {
        return this.attendanceService.getByBranch(branchId, fromDate, toDate);
    }
    getByUser(branchId, userId, fromDate, toDate) {
        return this.attendanceService.getByUser(branchId, userId, fromDate, toDate);
    }
    upsert(branchId, userId, dto) {
        return this.attendanceService.upsert(branchId, userId, dto);
    }
};
exports.StaffAttendanceController = StaffAttendanceController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], StaffAttendanceController.prototype, "getByBranch", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Query)('fromDate')),
    __param(3, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], StaffAttendanceController.prototype, "getByUser", null);
__decorate([
    (0, common_1.Post)('user/:userId'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, staff_attendance_dto_1.CreateOrUpdateAttendanceDto]),
    __metadata("design:returntype", void 0)
], StaffAttendanceController.prototype, "upsert", null);
exports.StaffAttendanceController = StaffAttendanceController = __decorate([
    (0, common_1.Controller)('staff/attendance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [staff_attendance_service_1.StaffAttendanceService])
], StaffAttendanceController);
//# sourceMappingURL=staff-attendance.controller.js.map