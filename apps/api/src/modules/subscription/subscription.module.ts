import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import {
  Branch,
  BranchSubscription,
  SubscriptionPlan,
  SubscriptionInvoice,
  Patient,
  User,
} from '../../database/entities';
import { SUBSCRIPTION_QUEUE } from './subscription.processor';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionAdminController } from './subscription-admin.controller';
import { SubscriptionAdminService } from './subscription-admin.service';
import { SubscriptionInvoicesController } from './subscription-invoices.controller';
import { SubscriptionInvoicesService } from './subscription-invoices.service';
import { PlanLimitsService } from './plan-limits.service';
import { SubscriptionGuard } from './guards/subscription.guard';
import { SubscriptionProcessor } from './subscription.processor';
import { SubscriptionSchedulerService } from './subscription-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Branch,
      BranchSubscription,
      SubscriptionPlan,
      SubscriptionInvoice,
      Patient,
      User,
    ]),
    BullModule.registerQueue({
      name: SUBSCRIPTION_QUEUE,
    }),
  ],
  controllers: [
    PlansController,
    SubscriptionController,
    SubscriptionAdminController,
    SubscriptionInvoicesController,
  ],
  providers: [
    PlansService,
    SubscriptionService,
    SubscriptionAdminService,
    SubscriptionInvoicesService,
    PlanLimitsService,
    SubscriptionGuard,
    SubscriptionProcessor,
    SubscriptionSchedulerService,
  ],
  exports: [
    TypeOrmModule.forFeature([BranchSubscription]),
    PlanLimitsService,
    SubscriptionGuard,
    SubscriptionService,
  ],
})
export class SubscriptionModule {}
