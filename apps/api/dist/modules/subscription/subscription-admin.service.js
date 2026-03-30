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
exports.SubscriptionAdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const branch_entity_1 = require("../../database/entities/branch.entity");
const branch_subscription_entity_1 = require("../../database/entities/branch-subscription.entity");
const subscription_plan_entity_1 = require("../../database/entities/subscription-plan.entity");
let SubscriptionAdminService = class SubscriptionAdminService {
    branchRepo;
    subRepo;
    planRepo;
    constructor(branchRepo, subRepo, planRepo) {
        this.branchRepo = branchRepo;
        this.subRepo = subRepo;
        this.planRepo = planRepo;
    }
    async listTenants() {
        const branches = await this.branchRepo.find({ order: { name: 'ASC' } });
        const subs = await this.subRepo.find({
            relations: ['plan'],
            order: { updatedAt: 'DESC' },
        });
        const byBranch = new Map();
        subs.forEach((s) => byBranch.set(s.branchId, s));
        return branches.map((b) => {
            const sub = byBranch.get(b.id);
            const plan = sub?.plan;
            return {
                branchId: b.id,
                branchName: b.name,
                branchAddress: b.address,
                planId: plan?.id ?? null,
                planName: plan?.name ?? null,
                planSlug: plan?.slug ?? null,
                status: sub?.status ?? null,
                currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() ?? null,
                trialEndsAt: sub?.trialEndsAt?.toISOString() ?? null,
            };
        });
    }
    async assignPlan(branchId, planId, trialDays) {
        const branch = await this.branchRepo.findOne({ where: { id: branchId } });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        const plan = await this.planRepo.findOne({ where: { id: planId } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        let sub = await this.subRepo.findOne({ where: { branchId }, relations: ['plan'] });
        const now = new Date();
        const periodStart = sub?.currentPeriodEnd && new Date(sub.currentPeriodEnd) > now
            ? sub.currentPeriodEnd
            : now;
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        const trialEndsAt = trialDays ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;
        if (sub) {
            sub.planId = planId;
            sub.status = trialEndsAt ? 'trialing' : 'active';
            sub.trialEndsAt = trialEndsAt;
            sub.currentPeriodStart = periodStart;
            sub.currentPeriodEnd = periodEnd;
            await this.subRepo.save(sub);
        }
        else {
            sub = this.subRepo.create({
                branchId,
                planId,
                status: trialEndsAt ? 'trialing' : 'active',
                trialEndsAt,
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
            });
            await this.subRepo.save(sub);
        }
        return this.subRepo.findOne({
            where: { id: sub.id },
            relations: ['plan', 'branch'],
        });
    }
};
exports.SubscriptionAdminService = SubscriptionAdminService;
exports.SubscriptionAdminService = SubscriptionAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(branch_entity_1.Branch)),
    __param(1, (0, typeorm_1.InjectRepository)(branch_subscription_entity_1.BranchSubscription)),
    __param(2, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionAdminService);
//# sourceMappingURL=subscription-admin.service.js.map