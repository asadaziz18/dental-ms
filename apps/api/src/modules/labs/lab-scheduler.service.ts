import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabTrial } from '../../database/entities/lab-trial.entity';
import { LabOrder } from '../../database/entities/lab-order.entity';
import { LabNotificationService } from './lab-notification.service';

@Injectable()
export class LabSchedulerService {
  constructor(
    @InjectRepository(LabTrial)
    private readonly trialRepo: Repository<LabTrial>,
    @InjectRepository(LabOrder)
    private readonly orderRepo: Repository<LabOrder>,
    private readonly notificationService: LabNotificationService,
  ) {}

  /** Daily at 08:00 — send reminders for trials scheduled tomorrow */
  @Cron('0 8 * * *')
  async sendTrialReminders(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    const trials = await this.trialRepo.find({
      where: {
        trialDate: tomorrowStr as any,
        status: 'scheduled',
      },
      relations: ['labOrder'],
    });
    for (const trial of trials) {
      try {
        await this.notificationService.sendTrialReminderNotification(
          trial.id,
          trial.labOrderId,
          'both',
        );
      } catch (e) {
        // log and continue
      }
    }
  }

  /** Daily at 09:00 — flag overdue orders (sentToLabAt > 30 days, no delivery). Dashboard shows count; no status change. */
  @Cron('0 9 * * *')
  async flagOverdueOrders(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const count = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.sentToLabAt <= :cutoff', { cutoff: thirtyDaysAgo })
      .andWhere('o.status NOT IN (:...done)', {
        done: ['delivered', 'cancelled', 'rejected'],
      })
      .getCount();
    if (count > 0) {
      // Could send internal digest email; for now just counted in dashboard
    }
  }
}
