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
exports.PlanLimitsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const branch_subscription_entity_1 = require("../../database/entities/branch-subscription.entity");
const patient_entity_1 = require("../../database/entities/patient.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const ALLOWED_STATUSES = ['active', 'trialing'];
let PlanLimitsService = class PlanLimitsService {
    subRepo;
    patientRepo;
    userRepo;
    constructor(subRepo, patientRepo, userRepo) {
        this.subRepo = subRepo;
        this.patientRepo = patientRepo;
        this.userRepo = userRepo;
    }
    async getLimitsAndUsage(branchId) {
        const sub = await this.subRepo.findOne({
            where: { branchId, status: (0, typeorm_2.In)([...ALLOWED_STATUSES]) },
            relations: ['plan'],
        });
        if (!sub?.plan)
            return null;
        const features = sub.plan.features ?? {};
        const maxPatients = typeof features.maxPatients === 'number' ? features.maxPatients : 1000;
        const maxStaff = typeof features.maxStaff === 'number' ? features.maxStaff : 50;
        const maxBranches = typeof features.maxBranches === 'number' ? features.maxBranches : 1;
        const imaging = features.imaging !== false;
        const reports = features.reports !== false;
        const inventory = features.inventory !== false;
        const patientRow = await this.patientRepo
            .createQueryBuilder('p')
            .where('p.branchId = :branchId', { branchId })
            .andWhere('p.deletedAt IS NULL')
            .select('COUNT(p.id)', 'c')
            .getRawOne();
        const staffRow = await this.userRepo
            .createQueryBuilder('u')
            .where('u.branchId = :branchId', { branchId })
            .andWhere('u.isActive = true')
            .select('COUNT(u.id)', 'c')
            .getRawOne();
        const patients = parseInt(patientRow?.c ?? '0', 10);
        const staff = parseInt(staffRow?.c ?? '0', 10);
        return {
            planId: sub.plan.id,
            planName: sub.plan.name,
            features,
            limits: { maxPatients, maxStaff, maxBranches, imaging, reports, inventory },
            usage: { patients, staff, branches: 1 },
            canAddPatient: patients < maxPatients,
            canAddStaff: staff < maxStaff,
        };
    }
    async canUseFeature(branchId, feature) {
        const limits = await this.getLimitsAndUsage(branchId);
        if (!limits)
            return true;
        const val = limits.limits[feature];
        if (typeof val === 'number')
            return limits.usage[feature] < val;
        return val === true;
    }
};
exports.PlanLimitsService = PlanLimitsService;
exports.PlanLimitsService = PlanLimitsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(branch_subscription_entity_1.BranchSubscription)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PlanLimitsService);
//# sourceMappingURL=plan-limits.service.js.map