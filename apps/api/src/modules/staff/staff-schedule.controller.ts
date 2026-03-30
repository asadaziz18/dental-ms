import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { StaffScheduleService } from './staff-schedule.service';
import { UpsertStaffScheduleDto } from './dto/staff-schedule.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('staff/:userId/schedule')
@UseGuards(JwtAuthGuard, BranchGuard)
export class StaffScheduleController {
  constructor(private readonly scheduleService: StaffScheduleService) {}

  @Get()
  getByUser(@BranchId() branchId: string, @Param('userId') userId: string) {
    return this.scheduleService.getByUser(branchId, userId);
  }

  @Put()
  setSchedule(
    @BranchId() branchId: string,
    @Param('userId') userId: string,
    @Body() body: { slots: UpsertStaffScheduleDto[] },
  ) {
    return this.scheduleService.setSchedule(branchId, userId, body.slots ?? []);
  }
}
