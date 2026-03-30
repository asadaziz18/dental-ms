import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockTransactionDto } from './dto/stock-transaction.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inventory/stock')
@UseGuards(JwtAuthGuard, BranchGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  getLevels(@BranchId() branchId: string) {
    return this.stockService.getLevelsByBranch(branchId);
  }

  @Get('item/:itemId')
  getLevel(
    @BranchId() branchId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.stockService.getLevel(branchId, itemId);
  }

  @Post('transaction')
  recordTransaction(
    @BranchId() branchId: string,
    @Body() dto: CreateStockTransactionDto,
  ) {
    return this.stockService.recordTransaction(branchId, dto);
  }

  @Get('transactions')
  getTransactions(
    @BranchId() branchId: string,
    @Query('itemId') itemId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stockService.getTransactions(
      branchId,
      itemId,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}
