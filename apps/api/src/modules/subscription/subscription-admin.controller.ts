import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SubscriptionAdminService } from './subscription-admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('subscription/tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SuperAdmin')
export class SubscriptionAdminController {
  constructor(private readonly adminService: SubscriptionAdminService) {}

  @Get()
  listTenants() {
    return this.adminService.listTenants();
  }

  @Patch(':branchId/plan')
  assignPlan(
    @Param('branchId') branchId: string,
    @Body() body: { planId: string; trialDays?: number },
  ) {
    return this.adminService.assignPlan(branchId, body.planId, body.trialDays);
  }
}
