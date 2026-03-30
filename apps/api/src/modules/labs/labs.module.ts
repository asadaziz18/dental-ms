import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import {
  LabVendor,
  LabOrder,
  LabTrial,
  LabNotification,
  Branch,
  Patient,
  User,
} from '../../database/entities';
import { LabVendorsController } from './lab-vendors.controller';
import { LabVendorsService } from './lab-vendors.service';
import { LabOrdersController } from './lab-orders.controller';
import { LabOrdersService } from './lab-orders.service';
import { LabNotificationService } from './lab-notification.service';
import { LabNotificationProcessor } from './lab-notification.processor';
import { LabNotificationSender } from './lab-notification-sender.service';
import { LabSchedulerService } from './lab-scheduler.service';
import { LAB_NOTIFICATIONS_QUEUE } from './lab-notification.service';
import { ImagingModule } from '../imaging/imaging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LabVendor,
      LabOrder,
      LabTrial,
      LabNotification,
      Branch,
      Patient,
      User,
    ]),
    BullModule.registerQueue({ name: LAB_NOTIFICATIONS_QUEUE }),
    ImagingModule,
  ],
  controllers: [LabVendorsController, LabOrdersController],
  providers: [
    LabVendorsService,
    LabOrdersService,
    LabNotificationService,
    LabNotificationSender,
    LabNotificationProcessor,
    LabSchedulerService,
  ],
  exports: [LabVendorsService, LabOrdersService],
})
export class LabsModule {}
