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
exports.LabTrial = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const lab_order_entity_1 = require("./lab-order.entity");
const user_entity_1 = require("./user.entity");
let LabTrial = class LabTrial extends base_entity_1.BaseEntity {
    labOrderId;
    labOrder;
    trialNumber;
    trialDate;
    status;
    outcome;
    doctorNotes;
    labInstructions;
    completedAt;
    completedBy;
    completedByUser;
    attachments;
    patientNotified;
    patientNotifiedAt;
    patientNotificationChannel;
};
exports.LabTrial = LabTrial;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], LabTrial.prototype, "labOrderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lab_order_entity_1.LabOrder, (o) => o.trials, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'labOrderId' }),
    __metadata("design:type", lab_order_entity_1.LabOrder)
], LabTrial.prototype, "labOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], LabTrial.prototype, "trialNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], LabTrial.prototype, "trialDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        enum: ['scheduled', 'completed', 'missed'],
        default: 'scheduled',
    }),
    __metadata("design:type", String)
], LabTrial.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 24,
        nullable: true,
        enum: ['approved', 'adjustments_needed', 'rejected'],
    }),
    __metadata("design:type", Object)
], LabTrial.prototype, "outcome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], LabTrial.prototype, "doctorNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], LabTrial.prototype, "labInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], LabTrial.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], LabTrial.prototype, "completedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'completedBy' }),
    __metadata("design:type", Object)
], LabTrial.prototype, "completedByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], LabTrial.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], LabTrial.prototype, "patientNotified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], LabTrial.prototype, "patientNotifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], LabTrial.prototype, "patientNotificationChannel", void 0);
exports.LabTrial = LabTrial = __decorate([
    (0, typeorm_1.Entity)('lab_trials'),
    (0, typeorm_1.Index)(['labOrderId']),
    (0, typeorm_1.Index)(['trialDate'])
], LabTrial);
//# sourceMappingURL=lab-trial.entity.js.map