import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../../database/entities/branch.entity';
import { BranchSubscription } from '../../database/entities/branch-subscription.entity';
import { SubscriptionPlan } from '../../database/entities/subscription-plan.entity';

@Injectable()
export class SubscriptionAdminService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(BranchSubscription)
    private readonly subRepo: Repository<BranchSubscription>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
  ) {}

  async listTenants() {
    const branches = await this.branchRepo.find({ order: { name: 'ASC' } });
    const subs = await this.subRepo.find({
      relations: ['plan'],
      order: { updatedAt: 'DESC' },
    });
    const byBranch = new Map<string, BranchSubscription>();
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

  async assignPlan(branchId: string, planId: string, trialDays?: number) {
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch) throw new NotFoundException('Branch not found');
    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

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
    } else {
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
}
