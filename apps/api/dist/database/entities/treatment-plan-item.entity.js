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
exports.TreatmentPlanItem = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const treatment_plan_entity_1 = require("./treatment-plan.entity");
const procedure_entity_1 = require("./procedure.entity");
const user_entity_1 = require("./user.entity");
let TreatmentPlanItem = class TreatmentPlanItem extends base_entity_1.BaseEntity {
    treatmentPlanId;
    treatmentPlan;
    toothNumber;
    procedureId;
    procedure;
    conditionTag;
    status;
    doctorId;
    doctor;
    estimatedCost;
    priority;
};
exports.TreatmentPlanItem = TreatmentPlanItem;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], TreatmentPlanItem.prototype, "treatmentPlanId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => treatment_plan_entity_1.TreatmentPlan, (plan) => plan.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'treatmentPlanId' }),
    __metadata("design:type", treatment_plan_entity_1.TreatmentPlan)
], TreatmentPlanItem.prototype, "treatmentPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint' }),
    __metadata("design:type", Number)
], TreatmentPlanItem.prototype, "toothNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], TreatmentPlanItem.prototype, "procedureId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => procedure_entity_1.Procedure),
    (0, typeorm_1.JoinColumn)({ name: 'procedureId' }),
    __metadata("design:type", procedure_entity_1.Procedure)
], TreatmentPlanItem.prototype, "procedure", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", Object)
], TreatmentPlanItem.prototype, "conditionTag", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'Planned' }),
    __metadata("design:type", String)
], TreatmentPlanItem.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], TreatmentPlanItem.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'doctorId' }),
    __metadata("design:type", Object)
], TreatmentPlanItem.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], TreatmentPlanItem.prototype, "estimatedCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', default: 0 }),
    __metadata("design:type", Number)
], TreatmentPlanItem.prototype, "priority", void 0);
exports.TreatmentPlanItem = TreatmentPlanItem = __decorate([
    (0, typeorm_1.Entity)('treatment_plan_items')
], TreatmentPlanItem);
//# sourceMappingURL=treatment-plan-item.entity.js.map