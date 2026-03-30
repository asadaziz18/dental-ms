"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../../database/entities");
const staff_service_1 = require("./staff.service");
const staff_schedule_service_1 = require("./staff-schedule.service");
const staff_attendance_service_1 = require("./staff-attendance.service");
const staff_leave_service_1 = require("./staff-leave.service");
const doctor_commission_service_1 = require("./doctor-commission.service");
const staff_controller_1 = require("./staff.controller");
const staff_schedule_controller_1 = require("./staff-schedule.controller");
const staff_attendance_controller_1 = require("./staff-attendance.controller");
const staff_leave_controller_1 = require("./staff-leave.controller");
const doctor_commission_controller_1 = require("./doctor-commission.controller");
let StaffModule = class StaffModule {
};
exports.StaffModule = StaffModule;
exports.StaffModule = StaffModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.User,
                entities_1.StaffSchedule,
                entities_1.StaffAttendance,
                entities_1.StaffLeave,
                entities_1.DoctorCommissionRate,
                entities_1.Invoice,
            ]),
        ],
        controllers: [
            staff_attendance_controller_1.StaffAttendanceController,
            staff_leave_controller_1.StaffLeaveController,
            doctor_commission_controller_1.DoctorCommissionController,
            staff_schedule_controller_1.StaffScheduleController,
            staff_controller_1.StaffController,
        ],
        providers: [
            staff_service_1.StaffService,
            staff_schedule_service_1.StaffScheduleService,
            staff_attendance_service_1.StaffAttendanceService,
            staff_leave_service_1.StaffLeaveService,
            doctor_commission_service_1.DoctorCommissionService,
        ],
        exports: [
            staff_service_1.StaffService,
            staff_schedule_service_1.StaffScheduleService,
            staff_attendance_service_1.StaffAttendanceService,
            staff_leave_service_1.StaffLeaveService,
            doctor_commission_service_1.DoctorCommissionService,
        ],
    })
], StaffModule);
//# sourceMappingURL=staff.module.js.map