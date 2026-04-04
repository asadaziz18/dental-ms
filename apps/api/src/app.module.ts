import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database/typeorm.config';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AuthModule } from './modules/auth/auth.module';
import { BranchesModule } from './modules/branches/branches.module';
import { ProceduresModule } from './modules/procedures/procedures.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { BillingModule } from './modules/billing/billing.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { StaffModule } from './modules/staff/staff.module';
import { SyncModule } from './modules/sync/sync.module';
import { ImagingModule } from './modules/imaging/imaging.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { LabsModule } from './modules/labs/labs.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { PlatformSettingsModule } from './modules/platform-settings/platform-settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
    }),
    AuthModule,
    BranchesModule,
    PatientsModule,
    AppointmentsModule,
    ProceduresModule,
    TreatmentsModule,
    PrescriptionsModule,
    BillingModule,
    InventoryModule,
    StaffModule,
    SyncModule,
    ImagingModule,
    ReportsModule,
    SubscriptionModule,
    DashboardModule,
    LabsModule,
    PermissionsModule,
    PlatformSettingsModule,
  ],
})
export class AppModule {}
