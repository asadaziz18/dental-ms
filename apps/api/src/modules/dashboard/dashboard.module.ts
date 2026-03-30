import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Appointment,
  Invoice,
  Payment,
  Patient,
  InventoryItem,
  StockLevel,
  Branch,
} from '../../database/entities';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ReportsModule } from '../reports/reports.module';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Invoice,
      Payment,
      Patient,
      InventoryItem,
      StockLevel,
      Branch,
    ]),
    ReportsModule,
    AppointmentsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
