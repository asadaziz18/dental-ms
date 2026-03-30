import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LabNotificationSender {
  private readonly logger = new Logger(LabNotificationSender.name);
  private readonly twilioClient: any = null;
  private readonly whatsappFrom: string | null = null;
  private readonly nodemailerTransporter: any = null;
  private readonly smtpFrom: string | null = null;

  constructor(private config: ConfigService) {
    const sid = this.config.get('TWILIO_ACCOUNT_SID');
    const token = this.config.get('TWILIO_AUTH_TOKEN');
    this.whatsappFrom = this.config.get('TWILIO_WHATSAPP_FROM') ?? null;
    if (sid && token) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const twilio = require('twilio');
        this.twilioClient = twilio(sid, token);
      } catch {
        this.logger.warn('Twilio package not installed. Run: pnpm add twilio');
      }
    } else {
      this.logger.warn('WhatsApp (Twilio) not configured: TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN missing');
    }

    const smtpHost = this.config.get('SMTP_HOST');
    const smtpPort = this.config.get('SMTP_PORT');
    const smtpUser = this.config.get('SMTP_USER');
    const smtpPass = this.config.get('SMTP_PASS');
    this.smtpFrom = this.config.get('SMTP_FROM') ?? null;
    if (smtpHost && smtpUser && smtpPass) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nodemailer = require('nodemailer');
        this.nodemailerTransporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(String(smtpPort), 10) || 587,
          secure: false,
          auth: { user: smtpUser, pass: smtpPass },
        });
      } catch {
        this.logger.warn('Nodemailer not installed. Run: pnpm add nodemailer');
      }
    } else {
      this.logger.warn('Email (SMTP) not configured: SMTP_HOST / SMTP_USER / SMTP_PASS missing');
    }
  }

  isWhatsAppConfigured(): boolean {
    return !!(this.twilioClient && this.whatsappFrom);
  }

  isEmailConfigured(): boolean {
    return !!(this.nodemailerTransporter && this.smtpFrom);
  }

  async sendWhatsApp(to: string, body: string): Promise<void> {
    if (!this.twilioClient || !this.whatsappFrom) {
      throw new Error('WhatsApp (Twilio) not configured');
    }
    const normalized = to.replace(/^0/, '92').replace(/\D/g, '');
    const toWhatsApp = normalized.startsWith('92') ? `whatsapp:+${normalized}` : `whatsapp:+92${normalized}`;
    await this.twilioClient.messages.create({
      from: this.whatsappFrom,
      to: toWhatsApp,
      body,
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    _context?: {
      patientName: string;
      trialDate: string;
      trialNumber: number;
      workType: string;
      branchName: string;
      branchPhone: string;
    },
  ): Promise<void> {
    if (!this.nodemailerTransporter || !this.smtpFrom) {
      throw new Error('Email (SMTP) not configured');
    }
    const html = `<!DOCTYPE html><html><body style="font-family: sans-serif;"><p>${text.replace(/\n/g, '<br>')}</p><p>If you need to reschedule, contact us at the number above.</p></body></html>`;
    await this.nodemailerTransporter.sendMail({
      from: this.smtpFrom,
      to,
      subject,
      text,
      html,
    });
  }
}
