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
exports.SubscriptionGuard = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const branch_subscription_entity_1 = require("../../../database/entities/branch-subscription.entity");
const ALLOWED_STATUSES = ['active', 'trialing'];
let SubscriptionGuard = class SubscriptionGuard {
    subRepo;
    constructor(subRepo) {
        this.subRepo = subRepo;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const branchId = request.branchId ?? request.user?.branchId;
        const role = request.user?.role;
        if (!branchId) {
            return true;
        }
        if (role === 'SuperAdmin') {
            return true;
        }
        const sub = await this.subRepo.findOne({
            where: { branchId },
            order: { updatedAt: 'DESC' },
        });
        if (!sub) {
            return true;
        }
        if (!ALLOWED_STATUSES.includes(sub.status)) {
            const message = sub.status === 'grace'
                ? 'Your subscription is past due. Please pay the outstanding invoice to avoid suspension.'
                : sub.status === 'suspended'
                    ? 'This branch is suspended. Please contact support to restore access.'
                    : 'Subscription is not active.';
            throw new common_1.ForbiddenException(message);
        }
        return true;
    }
};
exports.SubscriptionGuard = SubscriptionGuard;
exports.SubscriptionGuard = SubscriptionGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(branch_subscription_entity_1.BranchSubscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SubscriptionGuard);
//# sourceMappingURL=subscription.guard.js.map