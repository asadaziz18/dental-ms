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
exports.SubscriptionInvoicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_invoice_entity_1 = require("../../database/entities/subscription-invoice.entity");
const branch_subscription_entity_1 = require("../../database/entities/branch-subscription.entity");
const branch_entity_1 = require("../../database/entities/branch.entity");
const subscription_plan_entity_1 = require("../../database/entities/subscription-plan.entity");
let SubscriptionInvoicesService = class SubscriptionInvoicesService {
    invoiceRepo;
    subRepo;
    branchRepo;
    planRepo;
    constructor(invoiceRepo, subRepo, branchRepo, planRepo) {
        this.invoiceRepo = invoiceRepo;
        this.subRepo = subRepo;
        this.branchRepo = branchRepo;
        this.planRepo = planRepo;
    }
    async listByBranch(branchId) {
        return this.invoiceRepo.find({
            where: { branchId },
            relations: ['plan'],
            order: { dueDate: 'DESC' },
        });
    }
    async listAll() {
        return this.invoiceRepo.find({
            relations: ['plan', 'branch'],
            order: { dueDate: 'DESC' },
        });
    }
    async markAsPaid(id) {
        const inv = await this.invoiceRepo.findOne({
            where: { id },
            relations: ['plan'],
        });
        if (!inv)
            throw new common_1.NotFoundException('Invoice not found');
        inv.status = 'paid';
        inv.paidAt = new Date();
        await this.invoiceRepo.save(inv);
        const sub = await this.subRepo.findOne({ where: { branchId: inv.branchId } });
        if (sub && (sub.status === 'past_due' || sub.status === 'grace')) {
            sub.status = 'active';
            await this.subRepo.save(sub);
        }
        return inv;
    }
    async getNextInvoiceNumber() {
        const prefix = 'INV-' + new Date().getFullYear() + '-';
        const last = await this.invoiceRepo
            .createQueryBuilder('i')
            .where('i.invoiceNumber LIKE :prefix', { prefix: prefix + '%' })
            .orderBy('i.invoiceNumber', 'DESC')
            .getOne();
        const nextNum = last
            ? parseInt(last.invoiceNumber.replace(prefix, ''), 10) + 1
            : 1;
        return prefix + String(nextNum).padStart(5, '0');
    }
    async issueInvoicesForPeriod() {
        const now = new Date();
        const subs = await this.subRepo.find({
            where: { status: (0, typeorm_2.In)(['active', 'trialing']) },
            relations: ['plan'],
        });
        const created = [];
        for (const sub of subs) {
            const periodEnd = new Date(sub.currentPeriodEnd);
            if (periodEnd > now)
                continue;
            const nextStart = new Date(periodEnd);
            const nextEnd = new Date(nextStart);
            nextEnd.setMonth(nextEnd.getMonth() + 1);
            const amount = sub.plan.billingInterval === 'year' ? sub.plan.priceYearly : sub.plan.priceMonthly;
            const dueDate = new Date(nextStart);
            dueDate.setDate(dueDate.getDate() + 14);
            const invoiceNumber = await this.getNextInvoiceNumber();
            const inv = this.invoiceRepo.create({
                branchId: sub.branchId,
                planId: sub.planId,
                invoiceNumber,
                amount,
                status: 'sent',
                dueDate,
                periodStart: nextStart,
                periodEnd: nextEnd,
            });
            await this.invoiceRepo.save(inv);
            sub.currentPeriodStart = nextStart;
            sub.currentPeriodEnd = nextEnd;
            await this.subRepo.save(sub);
            created.push(inv);
        }
        return created;
    }
    async moveOverdueToGrace() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const unpaid = await this.invoiceRepo.find({
            where: { status: 'sent', dueDate: (0, typeorm_2.LessThanOrEqual)(today) },
        });
        const branchIds = [...new Set(unpaid.map((i) => i.branchId))];
        await this.subRepo.update({ branchId: (0, typeorm_2.In)(branchIds), status: 'active' }, { status: 'grace' });
        return branchIds.length;
    }
    async suspendAfterGrace(graceDays = 7) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - graceDays);
        const subs = await this.subRepo.find({
            where: { status: 'grace' },
        });
        let suspended = 0;
        for (const sub of subs) {
            const unpaid = await this.invoiceRepo.findOne({
                where: { branchId: sub.branchId, status: 'sent' },
            });
            if (unpaid && new Date(unpaid.dueDate) <= cutoff) {
                sub.status = 'suspended';
                await this.subRepo.save(sub);
                suspended++;
            }
        }
        return suspended;
    }
};
exports.SubscriptionInvoicesService = SubscriptionInvoicesService;
exports.SubscriptionInvoicesService = SubscriptionInvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_invoice_entity_1.SubscriptionInvoice)),
    __param(1, (0, typeorm_1.InjectRepository)(branch_subscription_entity_1.BranchSubscription)),
    __param(2, (0, typeorm_1.InjectRepository)(branch_entity_1.Branch)),
    __param(3, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionInvoicesService);
//# sourceMappingURL=subscription-invoices.service.js.map