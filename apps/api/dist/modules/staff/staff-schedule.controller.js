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
exports.StaffScheduleController = void 0;
const common_1 = require("@nestjs/common");
const staff_schedule_service_1 = require("./staff-schedule.service");
const branch_id_decorator_1 = require("../../common/decorators/branch-id.decorator");
const branch_guard_1 = require("../../common/guards/branch.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StaffScheduleController = class StaffScheduleController {
    scheduleService;
    constructor(scheduleService) {
        this.scheduleService = scheduleService;
    }
    getByUser(branchId, userId) {
        return this.scheduleService.getByUser(branchId, userId);
    }
    setSchedule(branchId, userId, body) {
        return this.scheduleService.setSchedule(branchId, userId, body.slots ?? []);
    }
};
exports.StaffScheduleController = StaffScheduleController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StaffScheduleController.prototype, "getByUser", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], StaffScheduleController.prototype, "setSchedule", null);
exports.StaffScheduleController = StaffScheduleController = __decorate([
    (0, common_1.Controller)('staff/:userId/schedule'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [staff_schedule_service_1.StaffScheduleService])
], StaffScheduleController);
//# sourceMappingURL=staff-schedule.controller.js.map