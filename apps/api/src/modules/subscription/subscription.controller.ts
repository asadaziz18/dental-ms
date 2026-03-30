import { Controller, Get, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { PlanLimitsService } from './plan-limits.service';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('subscription')
@UseGuards(JwtAuthGuard, BranchGuard)
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly planLimitsService: PlanLimitsService,
  ) {}

  @Get()
  getMySubscription(@BranchId() branchId: string) {
    return this.subscriptionService.getByBranchId(branchId);
  }

  @Get('usage')
  getUsage(@BranchId() branchId: string) {
    return this.planLimitsService.getLimitsAndUsage(branchId);
  }
}
