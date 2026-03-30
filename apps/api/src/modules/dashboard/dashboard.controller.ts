import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, BranchGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@BranchId() branchId: string) {
    return this.dashboardService.getSummary(branchId);
  }

  @Get('appointments/today')
  getTodayAppointments(
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Query('doctorId') doctorId?: string,
  ) {
    const filterDoctorId =
      user?.role === 'Doctor' ? user.userId : doctorId ?? undefined;
    return this.dashboardService.getTodayAppointments(
      branchId,
      filterDoctorId,
    );
  }

  @Get('revenue-chart')
  getRevenueChart(
    @BranchId() branchId: string,
    @Query('range') range?: '30d' | '12m',
  ) {
    return this.dashboardService.getRevenueChart(
      branchId,
      range === '12m' ? '12m' : '30d',
    );
  }

  @Get('upcoming-appointments')
  getUpcomingAppointments(
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Query('days') days?: string,
    @Query('doctorId') doctorId?: string,
  ) {
    const filterDoctorId =
      user?.role === 'Doctor' ? user.userId : doctorId ?? undefined;
    return this.dashboardService.getUpcomingAppointments(
      branchId,
      parseInt(days ?? '7', 10) || 7,
      filterDoctorId,
    );
  }

  @Get('low-stock')
  getLowStock(@BranchId() branchId: string) {
    return this.dashboardService.getLowStock(branchId);
  }

  @Get('doctor-performance')
  getDoctorPerformance(
    @BranchId() branchId: string,
    @Query('month') month?: string,
  ) {
    return this.dashboardService.getDoctorPerformance(branchId, month);
  }
}
