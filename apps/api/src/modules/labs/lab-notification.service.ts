import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LabOrder } from '../../database/entities/lab-order.entity';
import { LabTrial } from '../../database/entities/lab-trial.entity';
import type { LabNotificationType } from '../../database/entities/lab-notification.entity';

export const LAB_NOTIFICATIONS_QUEUE = 'lab-notifications';

export interface TrialScheduledPayload {
  type: 'trial_scheduled';
  orderId: string;
  trialId: string;
  channel: 'whatsapp' | 'email' | 'both';
  customMessage?: string;
}

export interface TrialReminderPayload {
  type: 'trial_reminder';
  orderId: string;
  trialId: string;
  channel: 'whatsapp' | 'email' | 'both';
}

export interface OrderReadyPayload {
  type: 'order_ready';
  orderId: string;
  channel: 'whatsapp' | 'email' | 'both';
}

export type LabNotificationJobPayload =
  | TrialScheduledPayload
  | TrialReminderPayload
  | OrderReadyPayload;

@Injectable()
export class LabNotificationService {
  constructor(
    @InjectQueue(LAB_NOTIFICATIONS_QUEUE)
    private readonly queue: Queue<LabNotificationJobPayload>,
  ) {}

  async sendTrialScheduledNotification(
    trial: LabTrial,
    order: LabOrder & { patient?: { firstName: string; lastName: string; phone?: string | null; email?: string | null }; branch?: { name: string; phone?: string | null } },
    channel: 'whatsapp' | 'email' | 'both',
    customMessage?: string,
  ): Promise<void> {
    await this.queue.add(
      'trial_scheduled',
      {
        type: 'trial_scheduled',
        orderId: order.id,
        trialId: trial.id,
        channel,
        customMessage,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
  }

  async sendTrialReminderNotification(
    trialId: string,
    orderId: string,
    channel: 'whatsapp' | 'email' | 'both',
  ): Promise<void> {
    await this.queue.add(
      'trial_reminder',
      { type: 'trial_reminder', orderId, trialId, channel },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
  }

  async sendOrderReadyNotification(
    orderId: string,
    channel: 'whatsapp' | 'email' | 'both',
  ): Promise<void> {
    await this.queue.add(
      'order_ready',
      { type: 'order_ready', orderId, channel },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
  }
}
