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
exports.Branch = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const tenant_entity_1 = require("./tenant.entity");
const user_entity_1 = require("./user.entity");
let Branch = class Branch extends base_entity_1.BaseEntity {
    tenantId;
    tenant;
    parentBranchId;
    parentBranch;
    subBranches;
    name;
    code;
    address;
    city;
    phone;
    email;
    managerUserId;
    manager;
    isActive;
    openingTime;
    closingTime;
    workingDays;
    deletedAt;
};
exports.Branch = Branch;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], Branch.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "parentBranchId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Branch, (b) => b.subBranches, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'parentBranchId' }),
    __metadata("design:type", Object)
], Branch.prototype, "parentBranch", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Branch, (b) => b.parentBranch),
    __metadata("design:type", Array)
], Branch.prototype, "subBranches", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Branch.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "managerUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'managerUserId' }),
    __metadata("design:type", Object)
], Branch.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Branch.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 5, nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "openingTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 5, nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "closingTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [], nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "workingDays", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "deletedAt", void 0);
exports.Branch = Branch = __decorate([
    (0, typeorm_1.Entity)('branches'),
    (0, typeorm_1.Index)(['tenantId', 'code'], { unique: true }),
    (0, typeorm_1.Index)(['parentBranchId'])
], Branch);
//# sourceMappingURL=branch.entity.js.map