import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreateInvoiceLineItemDto } from './dto/create-invoice-line-item.dto';
import { UpdateInvoiceLineItemDto } from './dto/update-invoice-line-item.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard, BranchGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get('patient/:patientId/balance')
  getBalance(
    @BranchId() branchId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.invoicesService.getOutstandingBalance(patientId, branchId);
  }

  @Get('patient/:patientId')
  findByPatient(
    @BranchId() branchId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.invoicesService.findByPatient(branchId, patientId);
  }

  @Get(':id')
  findOne(@BranchId() branchId: string, @Param('id') id: string) {
    return this.invoicesService.findOne(branchId, id);
  }

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(branchId, dto);
  }

  @Patch(':id')
  update(
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(branchId, id, dto);
  }

  @Delete(':id')
  remove(@BranchId() branchId: string, @Param('id') id: string) {
    return this.invoicesService.remove(branchId, id);
  }

  @Post(':id/line-items')
  addLineItem(
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Body() dto: CreateInvoiceLineItemDto,
  ) {
    return this.invoicesService.addLineItem(branchId, id, dto);
  }

  @Patch(':id/line-items/:itemId')
  updateLineItem(
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateInvoiceLineItemDto,
  ) {
    return this.invoicesService.updateLineItem(branchId, id, itemId, dto);
  }

  @Delete(':id/line-items/:itemId')
  removeLineItem(
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.invoicesService.removeLineItem(branchId, id, itemId);
  }
}
