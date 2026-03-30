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
exports.TreatmentsController = void 0;
const common_1 = require("@nestjs/common");
const treatments_service_1 = require("./treatments.service");
const create_treatment_plan_dto_1 = require("./dto/create-treatment-plan.dto");
const update_treatment_plan_dto_1 = require("./dto/update-treatment-plan.dto");
const create_treatment_plan_item_dto_1 = require("./dto/create-treatment-plan-item.dto");
const update_treatment_plan_item_dto_1 = require("./dto/update-treatment-plan-item.dto");
const branch_id_decorator_1 = require("../../common/decorators/branch-id.decorator");
const branch_guard_1 = require("../../common/guards/branch.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let TreatmentsController = class TreatmentsController {
    treatmentsService;
    constructor(treatmentsService) {
        this.treatmentsService = treatmentsService;
    }
    findByPatient(branchId, patientId) {
        return this.treatmentsService.findByPatient(branchId, patientId);
    }
    findOne(branchId, id) {
        return this.treatmentsService.findOne(branchId, id);
    }
    create(branchId, dto) {
        return this.treatmentsService.create(branchId, dto);
    }
    update(branchId, id, dto) {
        return this.treatmentsService.update(branchId, id, dto);
    }
    remove(branchId, id) {
        return this.treatmentsService.remove(branchId, id);
    }
    addItem(branchId, id, dto) {
        return this.treatmentsService.addItem(branchId, id, dto);
    }
    updateItem(branchId, id, itemId, dto) {
        return this.treatmentsService.updateItem(branchId, id, itemId, dto);
    }
    removeItem(branchId, id, itemId) {
        return this.treatmentsService.removeItem(branchId, id, itemId);
    }
};
exports.TreatmentsController = TreatmentsController;
__decorate([
    (0, common_1.Get)('patient/:patientId'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TreatmentsController.prototype, "findByPatient", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TreatmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_treatment_plan_dto_1.CreateTreatmentPlanDto]),
    __metadata("design:returntype", void 0)
], TreatmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_treatment_plan_dto_1.UpdateTreatmentPlanDto]),
    __metadata("design:returntype", void 0)
], TreatmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TreatmentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_treatment_plan_item_dto_1.CreateTreatmentPlanItemDto]),
    __metadata("design:returntype", void 0)
], TreatmentsController.prototype, "addItem", null);
__decorate([
    (0, common_1.Patch)(':id/items/:itemId'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('itemId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_treatment_plan_item_dto_1.UpdateTreatmentPlanItemDto]),
    __metadata("design:returntype", void 0)
], TreatmentsController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)(':id/items/:itemId'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TreatmentsController.prototype, "removeItem", null);
exports.TreatmentsController = TreatmentsController = __decorate([
    (0, common_1.Controller)('treatments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [treatments_service_1.TreatmentsService])
], TreatmentsController);
//# sourceMappingURL=treatments.controller.js.map