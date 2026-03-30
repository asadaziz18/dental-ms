import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  StaffSchedule,
  StaffAttendance,
  StaffLeave,
  DoctorCommissionRate,
  Invoice,
} from '../../database/entities';
import { StaffService } from './staff.service';
import { StaffScheduleService } from './staff-schedule.service';
import { StaffAttendanceService } from './staff-attendance.service';
import { StaffLeaveService } from './staff-leave.service';
import { DoctorCommissionService } from './doctor-commission.service';
import { StaffController } from './staff.controller';
import { StaffScheduleController } from './staff-schedule.controller';
import { StaffAttendanceController } from './staff-attendance.controller';
import { StaffLeaveController } from './staff-leave.controller';
import { DoctorCommissionController } from './doctor-commission.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      StaffSchedule,
      StaffAttendance,
      StaffLeave,
      DoctorCommissionRate,
      Invoice,
    ]),
  ],
  controllers: [
    StaffAttendanceController,
    StaffLeaveController,
    DoctorCommissionController,
    StaffScheduleController,
    StaffController,
  ],
  providers: [
    StaffService,
    StaffScheduleService,
    StaffAttendanceService,
    StaffLeaveService,
    DoctorCommissionService,
  ],
  exports: [
    StaffService,
    StaffScheduleService,
    StaffAttendanceService,
    StaffLeaveService,
    DoctorCommissionService,
  ],
})
export class StaffModule {}
