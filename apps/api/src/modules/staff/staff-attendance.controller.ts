import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { StaffAttendanceService } from './staff-attendance.service';
import { CreateOrUpdateAttendanceDto } from './dto/staff-attendance.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('staff/attendance')
@UseGuards(JwtAuthGuard, BranchGuard)
export class StaffAttendanceController {
  constructor(private readonly attendanceService: StaffAttendanceService) {}

  @Get()
  getByBranch(
    @BranchId() branchId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.attendanceService.getByBranch(branchId, fromDate, toDate);
  }

  @Get('user/:userId')
  getByUser(
    @BranchId() branchId: string,
    @Param('userId') userId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.attendanceService.getByUser(branchId, userId, fromDate, toDate);
  }

  @Post('user/:userId')
  upsert(
    @BranchId() branchId: string,
    @Param('userId') userId: string,
    @Body() dto: CreateOrUpdateAttendanceDto,
  ) {
    return this.attendanceService.upsert(branchId, userId, dto);
  }
}
