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
exports.LabNotification = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const lab_order_entity_1 = require("./lab-order.entity");
const lab_trial_entity_1 = require("./lab-trial.entity");
const patient_entity_1 = require("./patient.entity");
let LabNotification = class LabNotification extends base_entity_1.BaseEntity {
    labOrderId;
    labOrder;
    labTrialId;
    labTrial;
    patientId;
    patient;
    channel;
    type;
    message;
    status;
    sentAt;
    errorMessage;
};
exports.LabNotification = LabNotification;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], LabNotification.prototype, "labOrderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lab_order_entity_1.LabOrder, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'labOrderId' }),
    __metadata("design:type", lab_order_entity_1.LabOrder)
], LabNotification.prototype, "labOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], LabNotification.prototype, "labTrialId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lab_trial_entity_1.LabTrial, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'labTrialId' }),
    __metadata("design:type", Object)
], LabNotification.prototype, "labTrial", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], LabNotification.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'patientId' }),
    __metadata("design:type", patient_entity_1.Patient)
], LabNotification.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, enum: ['whatsapp', 'email'] }),
    __metadata("design:type", String)
], LabNotification.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 32,
        enum: ['trial_scheduled', 'trial_reminder', 'order_ready', 'order_delayed', 'delivery_confirmed'],
    }),
    __metadata("design:type", String)
], LabNotification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], LabNotification.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 16,
        enum: ['sent', 'failed', 'pending'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], LabNotification.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], LabNotification.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], LabNotification.prototype, "errorMessage", void 0);
exports.LabNotification = LabNotification = __decorate([
    (0, typeorm_1.Entity)('lab_notifications'),
    (0, typeorm_1.Index)(['labOrderId']),
    (0, typeorm_1.Index)(['patientId']),
    (0, typeorm_1.Index)(['createdAt'])
], LabNotification);
//# sourceMappingURL=lab-notification.entity.js.map