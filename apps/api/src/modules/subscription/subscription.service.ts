import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchSubscription } from '../../database/entities/branch-subscription.entity';
import type { SubscriptionStatus } from '../../database/entities/branch-subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(BranchSubscription)
    private readonly subRepo: Repository<BranchSubscription>,
  ) {}

  async getByBranchId(branchId: string) {
    const sub = await this.subRepo.findOne({
      where: { branchId },
      relations: ['plan', 'branch'],
      order: { updatedAt: 'DESC' },
    });
    if (!sub) return null;
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

  async updateStatus(branchId: string, status: SubscriptionStatus) {
    const sub = await this.subRepo.findOne({ where: { branchId } });
    if (!sub) throw new NotFoundException('Subscription not found');
    sub.status = status;
    await this.subRepo.save(sub);
    return this.getByBranchId(branchId);
  }
}
