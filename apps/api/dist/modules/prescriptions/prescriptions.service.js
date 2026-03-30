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
exports.PrescriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const prescription_entity_1 = require("../../database/entities/prescription.entity");
const patient_entity_1 = require("../../database/entities/patient.entity");
let PrescriptionsService = class PrescriptionsService {
    repo;
    patientRepo;
    constructor(repo, patientRepo) {
        this.repo = repo;
        this.patientRepo = patientRepo;
    }
    async findByPatient(branchId, patientId) {
        const patient = await this.patientRepo.findOne({
            where: { id: patientId, branchId },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        return this.repo.find({
            where: { patientId },
            relations: ['prescribedBy', 'treatmentPlan'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(patientId, id) {
        const rx = await this.repo.findOne({
            where: { id, patientId },
            relations: ['prescribedBy', 'treatmentPlan', 'patient'],
        });
        if (!rx)
            throw new common_1.NotFoundException('Prescription not found');
        return rx;
    }
    async create(branchId, prescribedById, dto) {
        const patient = await this.patientRepo.findOne({
            where: { id: dto.patientId, branchId },
        });
        if (!patient)
            throw new common_1.BadRequestException('Patient not found in this branch');
        const rx = this.repo.create({
            patientId: dto.patientId,
            treatmentPlanId: dto.treatmentPlanId ?? null,
            prescribedById,
            items: dto.items,
            notes: dto.notes ?? null,
        });
        return this.repo.save(rx);
    }
    async update(patientId, id, dto) {
        const rx = await this.findOne(patientId, id);
        if (dto.treatmentPlanId !== undefined)
            rx.treatmentPlanId = dto.treatmentPlanId;
        if (dto.items !== undefined)
            rx.items = dto.items;
        if (dto.notes !== undefined)
            rx.notes = dto.notes;
        return this.repo.save(rx);
    }
    async remove(patientId, id) {
        const rx = await this.findOne(patientId, id);
        await this.repo.remove(rx);
        return { success: true };
    }
};
exports.PrescriptionsService = PrescriptionsService;
exports.PrescriptionsService = PrescriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(prescription_entity_1.Prescription)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PrescriptionsService);
//# sourceMappingURL=prescriptions.service.js.map