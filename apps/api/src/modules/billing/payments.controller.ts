import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard, BranchGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('invoice/:invoiceId')
  findByInvoice(
    @BranchId() branchId: string,
    @Param('invoiceId') invoiceId: string,
  ) {
    return this.paymentsService.findByInvoice(branchId, invoiceId);
  }

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(branchId, dto);
  }
}
