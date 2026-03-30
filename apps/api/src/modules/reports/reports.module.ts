import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Appointment,
  Invoice,
  Payment,
  Patient,
  TreatmentPlanItem,
  InvoiceLineItem,
  Procedure,
  User,
} from '../../database/entities';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Invoice,
      Payment,
      Patient,
      TreatmentPlanItem,
      InvoiceLineItem,
      Procedure,
      User,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
