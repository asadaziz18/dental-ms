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
exports.StaffLeaveController = void 0;
const common_1 = require("@nestjs/common");
const staff_leave_service_1 = require("./staff-leave.service");
const staff_leave_dto_1 = require("./dto/staff-leave.dto");
const staff_leave_dto_2 = require("./dto/staff-leave.dto");
const branch_id_decorator_1 = require("../../common/decorators/branch-id.decorator");
const branch_guard_1 = require("../../common/guards/branch.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StaffLeaveController = class StaffLeaveController {
    leaveService;
    constructor(leaveService) {
        this.leaveService = leaveService;
    }
    findByBranch(branchId, fromDate, toDate) {
        return this.leaveService.findByBranch(branchId, fromDate, toDate);
    }
    findByUser(branchId, userId) {
        return this.leaveService.findByUser(branchId, userId);
    }
    findOne(branchId, id) {
        return this.leaveService.findOne(branchId, id);
    }
    create(branchId, dto) {
        return this.leaveService.create(branchId, dto);
    }
    update(branchId, id, dto) {
        return this.leaveService.update(branchId, id, dto);
    }
    remove(branchId, id) {
        return this.leaveService.remove(branchId, id);
    }
};
exports.StaffLeaveController = StaffLeaveController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], StaffLeaveController.prototype, "findByBranch", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StaffLeaveController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StaffLeaveController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, staff_leave_dto_1.CreateStaffLeaveDto]),
    __metadata("design:returntype", void 0)
], StaffLeaveController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, staff_leave_dto_2.UpdateStaffLeaveDto]),
    __metadata("design:returntype", void 0)
], StaffLeaveController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StaffLeaveController.prototype, "remove", null);
exports.StaffLeaveController = StaffLeaveController = __decorate([
    (0, common_1.Controller)('staff/leaves'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [staff_leave_service_1.StaffLeaveService])
], StaffLeaveController);
//# sourceMappingURL=staff-leave.controller.js.map