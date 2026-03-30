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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const branch_subscription_entity_1 = require("../../database/entities/branch-subscription.entity");
let SubscriptionService = class SubscriptionService {
    subRepo;
    constructor(subRepo) {
        this.subRepo = subRepo;
    }
    async getByBranchId(branchId) {
        const sub = await this.subRepo.findOne({
            where: { branchId },
            relations: ['plan', 'branch'],
            order: { updatedAt: 'DESC' },
        });
        if (!sub)
            return null;
        return {
            id: sub.id,
            branchId: sub.branchId,
            planId: sub.planId,
            planName: sub.plan?.name,
            planSlug: sub.plan?.slug,
            status: sub.status,
            trialEndsAt: sub.trialEndsAt?.toISOString() ?? null,
            currentPeriodStart: sub.currentPeriodStart.toISOString(),
            currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
            cancelledAt: sub.cancelledAt?.toISOString() ?? null,
            features: sub.plan?.features ?? null,
        };
    }
    async updateStatus(branchId, status) {
        const sub = await this.subRepo.findOne({ where: { branchId } });
        if (!sub)
            throw new common_1.NotFoundException('Subscription not found');
        sub.status = status;
        await this.subRepo.save(sub);
        return this.getByBranchId(branchId);
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(branch_subscription_entity_1.BranchSubscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map