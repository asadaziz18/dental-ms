"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_config_1 = require("./database/typeorm.config");
const patients_module_1 = require("./modules/patients/patients.module");
const appointments_module_1 = require("./modules/appointments/appointments.module");
const auth_module_1 = require("./modules/auth/auth.module");
const branches_module_1 = require("./modules/branches/branches.module");
const procedures_module_1 = require("./modules/procedures/procedures.module");
const treatments_module_1 = require("./modules/treatments/treatments.module");
const prescriptions_module_1 = require("./modules/prescriptions/prescriptions.module");
const billing_module_1 = require("./modules/billing/billing.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const staff_module_1 = require("./modules/staff/staff.module");
const sync_module_1 = require("./modules/sync/sync.module");
const imaging_module_1 = require("./modules/imaging/imaging.module");
const reports_module_1 = require("./modules/reports/reports.module");
const subscription_module_1 = require("./modules/subscription/subscription.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const bullmq_1 = require("@nestjs/bullmq");
const schedule_1 = require("@nestjs/schedule");
const labs_module_1 = require("./modules/labs/labs.module");
const permissions_module_1 = require("./modules/permissions/permissions.module");
const platform_settings_module_1 = require("./modules/platform-settings/platform-settings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            schedule_1.ScheduleModule.forRoot(),
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST ?? 'localhost',
                    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
                },
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: typeorm_config_1.typeOrmConfig,
            }),
            auth_module_1.AuthModule,
            branches_module_1.BranchesModule,
            patients_module_1.PatientsModule,
            appointments_module_1.AppointmentsModule,
            procedures_module_1.ProceduresModule,
            treatments_module_1.TreatmentsModule,
            prescriptions_module_1.PrescriptionsModule,
            billing_module_1.BillingModule,
            inventory_module_1.InventoryModule,
            staff_module_1.StaffModule,
            sync_module_1.SyncModule,
            imaging_module_1.ImagingModule,
            reports_module_1.ReportsModule,
            subscription_module_1.SubscriptionModule,
            dashboard_module_1.DashboardModule,
            labs_module_1.LabsModule,
            permissions_module_1.PermissionsModule,
            platform_settings_module_1.PlatformSettingsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map