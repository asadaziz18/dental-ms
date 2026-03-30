import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentPlan } from '../../database/entities/treatment-plan.entity';
import { TreatmentPlanItem } from '../../database/entities/treatment-plan-item.entity';
import { Patient } from '../../database/entities/patient.entity';
import { TreatmentsController } from './treatments.controller';
import { TreatmentsService } from './treatments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TreatmentPlan, TreatmentPlanItem, Patient]),
  ],
  controllers: [TreatmentsController],
  providers: [TreatmentsService],
  exports: [TreatmentsService],
})
export class TreatmentsModule {}
