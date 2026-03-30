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
exports.InsuranceClaimsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const insurance_claim_entity_1 = require("../../database/entities/insurance-claim.entity");
const patient_entity_1 = require("../../database/entities/patient.entity");
let InsuranceClaimsService = class InsuranceClaimsService {
    claimRepo;
    patientRepo;
    constructor(claimRepo, patientRepo) {
        this.claimRepo = claimRepo;
        this.patientRepo = patientRepo;
    }
    async findByPatient(branchId, patientId) {
        const patient = await this.patientRepo.findOne({
            where: { id: patientId, branchId },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        return this.claimRepo.find({
            where: { patientId, branchId },
            relations: ['invoice'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(branchId, id) {
        const claim = await this.claimRepo.findOne({
            where: { id, branchId },
            relations: ['patient', 'invoice'],
        });
        if (!claim)
            throw new common_1.NotFoundException('Insurance claim not found');
        return claim;
    }
    async create(branchId, dto) {
        const patient = await this.patientRepo.findOne({
            where: { id: dto.patientId, branchId },
        });
        if (!patient)
            throw new common_1.BadRequestException('Patient not found in this branch');
        const claim = this.claimRepo.create({
            patientId: dto.patientId,
            branchId,
            invoiceId: dto.invoiceId ?? null,
            claimNumber: dto.claimNumber ?? null,
            status: dto.status ?? 'Draft',
            insuranceProvider: dto.insuranceProvider ?? null,
            submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : null,
            amountClaimed: dto.amountClaimed != null ? String(dto.amountClaimed) : null,
            amountApproved: dto.amountApproved != null ? String(dto.amountApproved) : null,
            notes: dto.notes ?? null,
        });
        return this.claimRepo.save(claim);
    }
    async update(branchId, id, dto) {
        const claim = await this.findOne(branchId, id);
        if (dto.claimNumber !== undefined)
            claim.claimNumber = dto.claimNumber;
        if (dto.status !== undefined)
            claim.status = dto.status;
        if (dto.insuranceProvider !== undefined)
            claim.insuranceProvider = dto.insuranceProvider;
        if (dto.submittedAt !== undefined)
            claim.submittedAt = dto.submittedAt ? new Date(dto.submittedAt) : null;
        if (dto.amountClaimed !== undefined)
            claim.amountClaimed = dto.amountClaimed != null ? String(dto.amountClaimed) : null;
        if (dto.amountApproved !== undefined)
            claim.amountApproved = dto.amountApproved != null ? String(dto.amountApproved) : null;
        if (dto.notes !== undefined)
            claim.notes = dto.notes;
        return this.claimRepo.save(claim);
    }
    async remove(branchId, id) {
        const claim = await this.findOne(branchId, id);
        await this.claimRepo.remove(claim);
    }
};
exports.InsuranceClaimsService = InsuranceClaimsService;
exports.InsuranceClaimsService = InsuranceClaimsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(insurance_claim_entity_1.InsuranceClaim)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], InsuranceClaimsService);
//# sourceMappingURL=insurance-claims.service.js.map