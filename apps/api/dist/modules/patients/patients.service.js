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
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_entity_1 = require("../../database/entities/patient.entity");
let PatientsService = class PatientsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(branchId, dto) {
        const patient = this.repo.create({ ...dto, branchId });
        const saved = await this.repo.save(patient);
        return this.repo.findOneByOrFail({ id: saved.id });
    }
    async findAll(branchId, query) {
        const { search, page = 1, limit = 20 } = query;
        const qb = this.repo
            .createQueryBuilder('patient')
            .where('patient.branchId = :branchId', { branchId })
            .andWhere('patient.deletedAt IS NULL');
        if (search?.trim()) {
            const like = `%${search.trim()}%`;
            qb.andWhere(`(
          patient."firstName" ILIKE :like
          OR patient."lastName" ILIKE :like
          OR patient.phone ILIKE :like
          OR patient.email ILIKE :like
          OR patient."insuranceId" ILIKE :like
        )`, { like });
        }
        const [data, total] = await qb
            .orderBy('patient.updatedAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { data, total, page, limit };
    }
    async findOne(branchId, id) {
        const patient = await this.repo.findOne({
            where: { id, branchId },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        return patient;
    }
    async update(branchId, id, dto) {
        const patient = await this.findOne(branchId, id);
        Object.assign(patient, dto);
        await this.repo.save(patient);
        return this.findOne(branchId, id);
    }
    async remove(branchId, id, deletedBy) {
        const patient = await this.findOne(branchId, id);
        patient.deletedBy = deletedBy ?? null;
        await this.repo.softRemove(patient);
    }
    async getTimeline(branchId, patientId) {
        await this.findOne(branchId, patientId);
        const events = [];
        return { patientId, events };
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PatientsService);
//# sourceMappingURL=patients.service.js.map