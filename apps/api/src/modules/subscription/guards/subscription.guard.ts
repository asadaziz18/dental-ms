import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchSubscription } from '../../../database/entities/branch-subscription.entity';
import type { SubscriptionStatus } from '../../../database/entities/branch-subscription.entity';

const ALLOWED_STATUSES: SubscriptionStatus[] = ['active', 'trialing'];

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    @InjectRepository(BranchSubscription)
    private readonly subRepo: Repository<BranchSubscription>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    // No subscription record = allow (branch not yet on subscription system, or dev)
    if (!sub) {
      return true;
    }

    if (!ALLOWED_STATUSES.includes(sub.status)) {
      const message =
        sub.status === 'grace'
          ? 'Your subscription is past due. Please pay the outstanding invoice to avoid suspension.'
          : sub.status === 'suspended'
            ? 'This branch is suspended. Please contact support to restore access.'
            : 'Subscription is not active.';
      throw new ForbiddenException(message);
    }

    return true;
  }
}
