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
exports.ImagingController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const imaging_service_1 = require("./imaging.service");
const update_imaging_dto_1 = require("./dto/update-imaging.dto");
const branch_id_decorator_1 = require("../../common/decorators/branch-id.decorator");
const branch_guard_1 = require("../../common/guards/branch.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ImagingController = class ImagingController {
    imagingService;
    constructor(imagingService) {
        this.imagingService = imagingService;
    }
    findByPatient(branchId, patientId) {
        return this.imagingService.findByPatient(branchId, patientId);
    }
    findOne(branchId, id) {
        return this.imagingService.findOne(branchId, id);
    }
    async getPresignedUrl(branchId, id) {
        const url = await this.imagingService.getPresignedUrl(branchId, id);
        return { url };
    }
    async serveFile(branchId, id, res) {
        const result = await this.imagingService.serveFile(branchId, id);
        if (result.type === 'redirect') {
            return res.redirect(302, result.url);
        }
        res.setHeader('Content-Type', result.contentType);
        result.stream.pipe(res);
    }
    upload(branchId, user, patientId, file, toothNumber) {
        const tooth = toothNumber !== undefined && toothNumber !== ''
            ? parseInt(toothNumber, 10)
            : undefined;
        return this.imagingService.upload(branchId, patientId, user.userId, file, tooth ?? null);
    }
    update(branchId, id, dto) {
        return this.imagingService.update(branchId, id, dto);
    }
    remove(branchId, id) {
        return this.imagingService.remove(branchId, id);
    }
};
exports.ImagingController = ImagingController;
__decorate([
    (0, common_1.Get)('patient/:patientId'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ImagingController.prototype, "findByPatient", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ImagingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/url'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ImagingController.prototype, "getPresignedUrl", null);
__decorate([
    (0, common_1.Get)(':id/file'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ImagingController.prototype, "serveFile", null);
__decorate([
    (0, common_1.Post)('patient/:patientId/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Param)('patientId')),
    __param(3, (0, common_1.UploadedFile)()),
    __param(4, (0, common_1.Body)('toothNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object, String]),
    __metadata("design:returntype", void 0)
], ImagingController.prototype, "upload", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_imaging_dto_1.UpdateImagingDto]),
    __metadata("design:returntype", void 0)
], ImagingController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, branch_id_decorator_1.BranchId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ImagingController.prototype, "remove", null);
exports.ImagingController = ImagingController = __decorate([
    (0, common_1.Controller)('imaging'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [imaging_service_1.ImagingService])
], ImagingController);
//# sourceMappingURL=imaging.controller.js.map