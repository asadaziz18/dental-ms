import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabOrder } from '../../database/entities/lab-order.entity';
import { LabTrial } from '../../database/entities/lab-trial.entity';
import { LabNotification } from '../../database/entities/lab-notification.entity';
import { LAB_NOTIFICATIONS_QUEUE, type LabNotificationJobPayload } from './lab-notification.service';
import { LabNotificationSender } from './lab-notification-sender.service';

@Processor(LAB_NOTIFICATIONS_QUEUE, {
  concurrency: 2,
})
@Injectable()
export class LabNotificationProcessor extends WorkerHost {
  constructor(
    @InjectRepository(LabOrder)
    private readonly orderRepo: Repository<LabOrder>,
    @InjectRepository(LabTrial)
    private readonly trialRepo: Repository<LabTrial>,
    @InjectRepository(LabNotification)
    private readonly notificationRepo: Repository<LabNotification>,
    private readonly sender: LabNotificationSender,
  ) {
    super();
  }

  async process(job: Job<LabNotificationJobPayload>): Promise<void> {
    const payload = job.data;
    const order = await this.orderRepo.findOne({
      where: { id: payload.orderId },
      relations: ['patient', 'branch', 'vendor'],
    });
    if (!order) {
      throw new Error(`Order not found: ${payload.orderId}`);
    }
    const patient = order.patient;
    const branch = order.branch;
    const branchName = branch?.name ?? 'our clinic';
    const branchPhone = branch?.phone ?? '';
    const patientName = patient
      ? `${(patient as any).firstName ?? ''} ${(patient as any).lastName ?? ''}`.trim() || 'Patient'
      : 'Patient';

    if (payload.type === 'trial_scheduled') {
      const trial = await this.trialRepo.findOne({
        where: { id: payload.trialId, labOrderId: payload.orderId },
      });
      if (!trial) throw new Error(`Trial not found: ${payload.trialId}`);
      const workType = (order.customWorkType || order.workType?.replace('_', ' ')) ?? 'dental work';
      const trialDate = typeof trial.trialDate === 'string' ? trial.trialDate : (trial.trialDate as Date).toISOString().slice(0, 10);
      const message =
        payload.customMessage ??
        `Dear ${patientName}, your dental lab trial (Trial #${trial.trialNumber}) for ${workType} has been scheduled on ${trialDate} at ${branchName}. Please arrive 10 minutes early. For queries call ${branchPhone}.`;

      await this.sendAndLog(
        order.id,
        trial.id,
        order.patientId,
        payload.channel,
        'trial_scheduled',
        message,
        order,
        patientName,
        branchName,
        branchPhone,
        trialDate,
        trial.trialNumber,
        workType,
      );
    } else if (payload.type === 'trial_reminder') {
      const trial = await this.trialRepo.findOne({
        where: { id: payload.trialId, labOrderId: payload.orderId },
      });
      if (!trial) throw new Error(`Trial not found: ${payload.trialId}`);
      const trialDate = typeof trial.trialDate === 'string' ? trial.trialDate : (trial.trialDate as Date).toISOString().slice(0, 10);
      const message = `Dear ${patientName}, reminder: your dental lab trial #${trial.trialNumber} is scheduled on ${trialDate} at ${branchName}. Contact us: ${branchPhone}.`;

      await this.sendAndLog(
        order.id,
        trial.id,
        order.patientId,
        payload.channel,
        'trial_reminder',
        message,
        order,
        patientName,
        branchName,
        branchPhone,
        trialDate,
        trial.trialNumber,
        '',
      );
    } else if (payload.type === 'order_ready') {
      const workType = (order.customWorkType || order.workType?.replace('_', ' ')) ?? 'dental work';
      const labName = (order as any).vendor?.name ?? 'the lab';
      const message = `Dear ${patientName}, your ${workType} from ${labName} is ready for fitting. Please book your appointment at ${branchName}. Call us: ${branchPhone}`;

      await this.sendAndLog(
        order.id,
        null,
        order.patientId,
        payload.channel,
        'order_ready',
        message,
        order,
        patientName,
        branchName,
        branchPhone,
        '',
        0,
        workType,
      );
    }
  }

  private async sendAndLog(
    orderId: string,
    trialId: string | null,
    patientId: string,
    channel: 'whatsapp' | 'email' | 'both',
    type: 'trial_scheduled' | 'trial_reminder' | 'order_ready',
    message: string,
    order: LabOrder,
    patientName: string,
    branchName: string,
    branchPhone: string,
    trialDate: string,
    trialNumber: number,
    workType: string,
  ): Promise<void> {
    const channels: ('whatsapp' | 'email')[] =
      channel === 'both' ? ['whatsapp', 'email'] : [channel];
    const phone = (order.patient as any)?.phone ?? null;
    const email = (order.patient as any)?.email ?? null;

    for (const ch of channels) {
      const record = this.notificationRepo.create({
        labOrderId: orderId,
        labTrialId: trialId,
        patientId,
        channel: ch,
        type,
        message,
        status: 'pending',
      });
      await this.notificationRepo.save(record);
      try {
        if (ch === 'whatsapp' && phone) {
          await this.sender.sendWhatsApp(phone, message);
        } else if (ch === 'email' && email) {
          const subject =
            type === 'trial_scheduled'
              ? `Trial Appointment Scheduled — ${branchName}`
              : type === 'trial_reminder'
                ? `Reminder: Trial #${trialNumber} on ${trialDate}`
                : `Your ${workType} is ready for fitting`;
          await this.sender.sendEmail(email, subject, message, {
            patientName,
            trialDate,
            trialNumber,
            workType,
            branchName,
            branchPhone,
          });
        } else {
          record.status = 'failed';
          record.errorMessage = ch === 'whatsapp' ? 'No phone number' : 'No email address';
          record.sentAt = new Date();
          await this.notificationRepo.save(record);
          continue;
        }
        record.status = 'sent';
        record.sentAt = new Date();
        await this.notificationRepo.save(record);
      } catch (err) {
        record.status = 'failed';
        record.errorMessage = err instanceof Error ? err.message : String(err);
        record.sentAt = new Date();
        await this.notificationRepo.save(record);
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes('not configured')) throw err;
      }
    }
  }
}
