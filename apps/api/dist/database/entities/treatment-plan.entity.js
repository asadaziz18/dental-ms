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
exports.TreatmentPlan = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const branch_entity_1 = require("./branch.entity");
const patient_entity_1 = require("./patient.entity");
const user_entity_1 = require("./user.entity");
const treatment_plan_item_entity_1 = require("./treatment-plan-item.entity");
const prescription_entity_1 = require("./prescription.entity");
let TreatmentPlan = class TreatmentPlan extends base_entity_1.BaseEntity {
    patientId;
    patient;
    branchId;
    branch;
    status;
    doctorId;
    doctor;
    clinicalNotes;
    items;
    prescriptions;
};
exports.TreatmentPlan = TreatmentPlan;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], TreatmentPlan.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'patientId' }),
    __metadata("design:type", patient_entity_1.Patient)
], TreatmentPlan.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], TreatmentPlan.prototype, "branchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_entity_1.Branch, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'branchId' }),
    __metadata("design:type", branch_entity_1.Branch)
], TreatmentPlan.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        default: 'Planned',
    }),
    __metadata("design:type", String)
], TreatmentPlan.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], TreatmentPlan.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'doctorId' }),
    __metadata("design:type", Object)
], TreatmentPlan.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], TreatmentPlan.prototype, "clinicalNotes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => treatment_plan_item_entity_1.TreatmentPlanItem, (item) => item.treatmentPlan),
    __metadata("design:type", Array)
], TreatmentPlan.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => prescription_entity_1.Prescription, (p) => p.treatmentPlan),
    __metadata("design:type", Array)
], TreatmentPlan.prototype, "prescriptions", void 0);
exports.TreatmentPlan = TreatmentPlan = __decorate([
    (0, typeorm_1.Entity)('treatment_plans')
], TreatmentPlan);
//# sourceMappingURL=treatment-plan.entity.js.map