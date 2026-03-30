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
exports.TreatmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const treatment_plan_entity_1 = require("../../database/entities/treatment-plan.entity");
const treatment_plan_item_entity_1 = require("../../database/entities/treatment-plan-item.entity");
const patient_entity_1 = require("../../database/entities/patient.entity");
let TreatmentsService = class TreatmentsService {
    planRepo;
    itemRepo;
    patientRepo;
    constructor(planRepo, itemRepo, patientRepo) {
        this.planRepo = planRepo;
        this.itemRepo = itemRepo;
        this.patientRepo = patientRepo;
    }
    async findByPatient(branchId, patientId) {
        const patient = await this.patientRepo.findOne({
            where: { id: patientId, branchId },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        return this.planRepo.find({
            where: { patientId, branchId },
            relations: ['items', 'items.procedure', 'doctor'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(branchId, id) {
        const plan = await this.planRepo.findOne({
            where: { id, branchId },
            relations: ['items', 'items.procedure', 'items.doctor', 'doctor', 'patient'],
        });
        if (!plan)
            throw new common_1.NotFoundException('Treatment plan not found');
        return plan;
    }
    async create(branchId, dto) {
        const patient = await this.patientRepo.findOne({
            where: { id: dto.patientId, branchId },
        });
        if (!patient)
            throw new common_1.BadRequestException('Patient not found in this branch');
        const plan = this.planRepo.create({
            patientId: dto.patientId,
            branchId,
            status: dto.status ?? 'Planned',
            doctorId: dto.doctorId ?? null,
            clinicalNotes: dto.clinicalNotes ?? null,
        });
        return this.planRepo.save(plan);
    }
    async update(branchId, id, dto) {
        const plan = await this.findOne(branchId, id);
        if (dto.status !== undefined)
            plan.status = dto.status;
        if (dto.doctorId !== undefined)
            plan.doctorId = dto.doctorId;
        if (dto.clinicalNotes !== undefined)
            plan.clinicalNotes = dto.clinicalNotes;
        return this.planRepo.save(plan);
    }
    async remove(branchId, id) {
        const plan = await this.findOne(branchId, id);
        await this.planRepo.remove(plan);
        return { success: true };
    }
    async addItem(branchId, treatmentPlanId, dto) {
        const plan = await this.findOne(branchId, treatmentPlanId);
        const item = this.itemRepo.create({
            treatmentPlanId: plan.id,
            toothNumber: dto.toothNumber,
            procedureId: dto.procedureId,
            conditionTag: (dto.conditionTag ?? null),
            status: dto.status ?? 'Planned',
            doctorId: dto.doctorId ?? null,
            estimatedCost: dto.estimatedCost != null ? String(dto.estimatedCost) : null,
            priority: dto.priority ?? 0,
        });
        return this.itemRepo.save(item);
    }
    async updateItem(branchId, treatmentPlanId, itemId, dto) {
        await this.findOne(branchId, treatmentPlanId);
        const item = await this.itemRepo.findOne({
            where: { id: itemId, treatmentPlanId },
        });
        if (!item)
            throw new common_1.NotFoundException('Treatment plan item not found');
        if (dto.toothNumber !== undefined)
            item.toothNumber = dto.toothNumber;
        if (dto.procedureId !== undefined)
            item.procedureId = dto.procedureId;
        if (dto.conditionTag !== undefined)
            item.conditionTag = dto.conditionTag;
        if (dto.status !== undefined)
            item.status = dto.status;
        if (dto.doctorId !== undefined)
            item.doctorId = dto.doctorId;
        if (dto.estimatedCost !== undefined)
            item.estimatedCost = dto.estimatedCost != null ? String(dto.estimatedCost) : null;
        if (dto.priority !== undefined)
            item.priority = dto.priority;
        return this.itemRepo.save(item);
    }
    async removeItem(branchId, treatmentPlanId, itemId) {
        await this.findOne(branchId, treatmentPlanId);
        const item = await this.itemRepo.findOne({
            where: { id: itemId, treatmentPlanId },
        });
        if (!item)
            throw new common_1.NotFoundException('Treatment plan item not found');
        await this.itemRepo.remove(item);
        return { success: true };
    }
};
exports.TreatmentsService = TreatmentsService;
exports.TreatmentsService = TreatmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(treatment_plan_entity_1.TreatmentPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(treatment_plan_item_entity_1.TreatmentPlanItem)),
    __param(2, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TreatmentsService);
//# sourceMappingURL=treatments.service.js.map