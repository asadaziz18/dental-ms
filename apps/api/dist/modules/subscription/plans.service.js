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
exports.PlansService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_plan_entity_1 = require("../../database/entities/subscription-plan.entity");
let PlansService = class PlansService {
    planRepo;
    constructor(planRepo) {
        this.planRepo = planRepo;
    }
    async create(dto) {
        const existing = await this.planRepo.findOne({ where: { slug: dto.slug } });
        if (existing)
            throw new common_1.ConflictException('Plan slug already exists');
        const plan = this.planRepo.create({
            name: dto.name,
            slug: dto.slug,
            description: dto.description ?? null,
            priceMonthly: String(dto.priceMonthly ?? 0),
            priceYearly: String(dto.priceYearly ?? 0),
            billingInterval: dto.billingInterval ?? 'month',
            features: dto.features ?? null,
            isActive: dto.isActive ?? true,
        });
        return this.planRepo.save(plan);
    }
    async findAll(activeOnly) {
        const where = activeOnly ? { isActive: true } : {};
        return this.planRepo.find({
            where,
            order: { name: 'ASC' },
        });
    }
    async findOne(id) {
        const plan = await this.planRepo.findOne({ where: { id } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        return plan;
    }
    async update(id, dto) {
        const plan = await this.findOne(id);
        if (dto.slug !== undefined) {
            const existing = await this.planRepo.findOne({ where: { slug: dto.slug } });
            if (existing && existing.id !== id)
                throw new common_1.ConflictException('Plan slug already exists');
            plan.slug = dto.slug;
        }
        if (dto.name !== undefined)
            plan.name = dto.name;
        if (dto.description !== undefined)
            plan.description = dto.description;
        if (dto.priceMonthly !== undefined)
            plan.priceMonthly = String(dto.priceMonthly);
        if (dto.priceYearly !== undefined)
            plan.priceYearly = String(dto.priceYearly);
        if (dto.billingInterval !== undefined)
            plan.billingInterval = dto.billingInterval;
        if (dto.features !== undefined)
            plan.features = dto.features;
        if (dto.isActive !== undefined)
            plan.isActive = dto.isActive;
        return this.planRepo.save(plan);
    }
    async remove(id) {
        const plan = await this.findOne(id);
        await this.planRepo.remove(plan);
        return { deleted: true };
    }
};
exports.PlansService = PlansService;
exports.PlansService = PlansService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PlansService);
//# sourceMappingURL=plans.service.js.map