import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report-query.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard, BranchGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboard(
    @BranchId() branchId: string,
    @Query('date') date?: string,
  ) {
    return this.reportsService.getDashboard(branchId, date);
  }

  @Get('revenue')
  getRevenueTrend(
    @BranchId() branchId: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day',
    @Query('doctorId') doctorId?: string,
  ) {
    const from = fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const to = toDate || new Date().toISOString().slice(0, 10);
    return this.reportsService.getRevenueTrend(branchId, from, to, groupBy, doctorId);
  }

  @Get('treatment-distribution')
  getTreatmentDistribution(
    @BranchId() branchId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.reportsService.getTreatmentDistribution(branchId, fromDate, toDate);
  }

  @Get('doctor-performance')
  getDoctorPerformance(
    @BranchId() branchId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.reportsService.getDoctorPerformance(branchId, fromDate, toDate);
  }

  @Get('no-show-rate')
  getNoShowRate(
    @BranchId() branchId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('doctorId') doctorId?: string,
  ) {
    return this.reportsService.getNoShowRate(branchId, fromDate, toDate, doctorId);
  }
}
