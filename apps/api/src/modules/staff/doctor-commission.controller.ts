import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DoctorCommissionService } from './doctor-commission.service';
import { SetCommissionRateDto } from './dto/doctor-commission.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('staff/commission')
@UseGuards(JwtAuthGuard, BranchGuard)
export class DoctorCommissionController {
  constructor(private readonly commissionService: DoctorCommissionService) {}

  @Get('summary')
  getSummary(
    @BranchId() branchId: string,
    @Query('doctorId') doctorId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.commissionService.getCommissionSummary(branchId, doctorId, fromDate, toDate);
  }

  @Get('doctor/:doctorId')
  getRate(@BranchId() branchId: string, @Param('doctorId') doctorId: string) {
    return this.commissionService.getRate(branchId, doctorId);
  }

  @Put('doctor/:doctorId')
  setRate(
    @BranchId() branchId: string,
    @Param('doctorId') doctorId: string,
    @Body() dto: SetCommissionRateDto,
  ) {
    return this.commissionService.setRate(branchId, doctorId, dto);
  }
}
