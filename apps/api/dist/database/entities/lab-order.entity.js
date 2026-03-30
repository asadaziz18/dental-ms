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
exports.LabOrder = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const tenant_entity_1 = require("./tenant.entity");
const branch_entity_1 = require("./branch.entity");
const patient_entity_1 = require("./patient.entity");
const user_entity_1 = require("./user.entity");
const lab_vendor_entity_1 = require("./lab-vendor.entity");
const treatment_plan_entity_1 = require("./treatment-plan.entity");
const lab_trial_entity_1 = require("./lab-trial.entity");
const lab_notification_entity_1 = require("./lab-notification.entity");
let LabOrder = class LabOrder extends base_entity_1.BaseEntity {
    tenantId;
    tenant;
    branchId;
    branch;
    patientId;
    patient;
    doctorId;
    doctor;
    vendorId;
    vendor;
    treatmentId;
    treatment;
    orderNumber;
    workType;
    customWorkType;
    toothNumbers;
    shade;
    material;
    instructions;
    status;
    priority;
    sentToLabAt;
    expectedTrialDate;
    finalDeliveryDate;
    labFee;
    isPaid;
    paidAt;
    attachments;
    createdBy;
    createdByUser;
    trials;
    notifications;
};
exports.LabOrder = LabOrder;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], LabOrder.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], LabOrder.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], LabOrder.prototype, "branchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => branch_entity_1.Branch, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'branchId' }),
    __metadata("design:type", branch_entity_1.Branch)
], LabOrder.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], LabOrder.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'patientId' }),
    __metadata("design:type", patient_entity_1.Patient)
], LabOrder.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], LabOrder.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'doctorId' }),
    __metadata("design:type", user_entity_1.User)
], LabOrder.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], LabOrder.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lab_vendor_entity_1.LabVendor, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'vendorId' }),
    __metadata("design:type", lab_vendor_entity_1.LabVendor)
], LabOrder.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], LabOrder.prototype, "treatmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => treatment_plan_entity_1.TreatmentPlan, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'treatmentId' }),
    __metadata("design:type", Object)
], LabOrder.prototype, "treatment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, unique: true }),
    __metadata("design:type", String)
], LabOrder.prototype, "orderNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 32,
        enum: ['crown_bridge', 'denture', 'orthodontic', 'veneer_laminate', 'implant', 'custom'],
    }),
    __metadata("design:type", String)
], LabOrder.prototype, "workType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], LabOrder.prototype, "customWorkType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], LabOrder.prototype, "toothNumbers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], LabOrder.prototype, "shade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], LabOrder.prototype, "material", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], LabOrder.prototype, "instructions", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 32,
        enum: [
            'draft',
            'sent_to_lab',
            'trial_scheduled',
            'trial_in_progress',
            'approved',
            'delivered',
            'cancelled',
            'rejected',
        ],
        default: 'draft',
    }),
    __metadata("design:type", String)
], LabOrder.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 16,
        enum: ['normal', 'urgent'],
        default: 'normal',
    }),
    __metadata("design:type", String)
], LabOrder.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], LabOrder.prototype, "sentToLabAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], LabOrder.prototype, "expectedTrialDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], LabOrder.prototype, "finalDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], LabOrder.prototype, "labFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], LabOrder.prototype, "isPaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], LabOrder.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], LabOrder.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], LabOrder.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'createdBy' }),
    __metadata("design:type", Object)
], LabOrder.prototype, "createdByUser", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lab_trial_entity_1.LabTrial, (t) => t.labOrder),
    __metadata("design:type", Array)
], LabOrder.prototype, "trials", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lab_notification_entity_1.LabNotification, (n) => n.labOrder),
    __metadata("design:type", Array)
], LabOrder.prototype, "notifications", void 0);
exports.LabOrder = LabOrder = __decorate([
    (0, typeorm_1.Entity)('lab_orders'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['branchId']),
    (0, typeorm_1.Index)(['patientId']),
    (0, typeorm_1.Index)(['vendorId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['sentToLabAt'])
], LabOrder);
//# sourceMappingURL=lab-order.entity.js.map