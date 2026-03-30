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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTreatmentPlanItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const TOOTH_CONDITIONS = [
    'caries',
    'crown',
    'rct',
    'extraction',
    'implant',
    'bridge',
    'filling',
    'healthy',
    'missing',
];
class CreateTreatmentPlanItemDto {
    toothNumber;
    procedureId;
    conditionTag;
    status;
    doctorId;
    estimatedCost;
    priority;
}
exports.CreateTreatmentPlanItemDto = CreateTreatmentPlanItemDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(11),
    (0, class_validator_1.Max)(48),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTreatmentPlanItemDto.prototype, "toothNumber", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTreatmentPlanItemDto.prototype, "procedureId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(TOOTH_CONDITIONS),
    __metadata("design:type", Object)
], CreateTreatmentPlanItemDto.prototype, "conditionTag", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTreatmentPlanItemDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", Object)
], CreateTreatmentPlanItemDto.prototype, "doctorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Object)
], CreateTreatmentPlanItemDto.prototype, "estimatedCost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTreatmentPlanItemDto.prototype, "priority", void 0);
//# sourceMappingURL=create-treatment-plan-item.dto.js.map