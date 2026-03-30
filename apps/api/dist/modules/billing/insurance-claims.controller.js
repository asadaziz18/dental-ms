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
exports.InsuranceClaimsController = void 0;
const common_1 = require("@nestjs/common");
const insurance_claims_service_1 = require("./insurance-claims.service");
const create_insurance_claim_dto_1 = require("./dto/create-insurance-claim.dto");
const update_insurance_claim_dto_1 = require("./dto/update-insurance-claim.dto");
const branch_id_decorator_1 = require("../../common/decorators/branch-id.decorator");
const branch_guard_1 = require("../../common/guards/branch.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let InsuranceClaimsController = class InsuranceClaimsController {
    claimsService;
    constructor(claimsService) {
        this.claimsService = claimsService;
    }
    findByPatient(branchId, patientId) {
        return this.claimsService.findByPatient(branchId, patientId);
    }
    findOne(branchId, id) {
        return this.claimsService.findOne(branchId, id);
    }
    create(branchId, dto) {
        return this.claimsService.create(branchId, dto);
    }
    update(branchId, id, dto) {
        return this.claimsService.update(branchId, id, dto);
    }
    remove(branchId, id) {
        return this.claimsService.remove(branchId, id);
    }
};
exports.InsuranceClaimsController = InsuranceClaimsController;
__decorate([
    (0, common_1.Get)('patient/:patientId'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InsuranceClaimsController.prototype, "findByPatient", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InsuranceClaimsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_insurance_claim_dto_1.CreateInsuranceClaimDto]),
    __metadata("design:returntype", void 0)
], InsuranceClaimsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_insurance_claim_dto_1.UpdateInsuranceClaimDto]),
    __metadata("design:returntype", void 0)
], InsuranceClaimsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InsuranceClaimsController.prototype, "remove", null);
exports.InsuranceClaimsController = InsuranceClaimsController = __decorate([
    (0, common_1.Controller)('insurance/claims'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [insurance_claims_service_1.InsuranceClaimsService])
], InsuranceClaimsController);
//# sourceMappingURL=insurance-claims.controller.js.map