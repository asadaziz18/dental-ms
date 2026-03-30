import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { SubscriptionInvoicesService } from './subscription-invoices.service';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('subscription/invoices')
@UseGuards(JwtAuthGuard)
export class SubscriptionInvoicesController {
  constructor(private readonly invoicesService: SubscriptionInvoicesService) {}

  @Get()
  @UseGuards(BranchGuard)
  listMyInvoices(@BranchId() branchId: string) {
    return this.invoicesService.listByBranch(branchId);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin')
  listAll() {
    return this.invoicesService.listAll();
  }

  @Patch(':id/mark-paid')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin')
  markAsPaid(@Param('id') id: string) {
    return this.invoicesService.markAsPaid(id);
  }
}
