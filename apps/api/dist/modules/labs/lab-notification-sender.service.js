"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LabNotificationSender_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabNotificationSender = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let LabNotificationSender = LabNotificationSender_1 = class LabNotificationSender {
    config;
    logger = new common_1.Logger(LabNotificationSender_1.name);
    twilioClient = null;
    whatsappFrom = null;
    nodemailerTransporter = null;
    smtpFrom = null;
    constructor(config) {
        this.config = config;
        const sid = this.config.get('TWILIO_ACCOUNT_SID');
        const token = this.config.get('TWILIO_AUTH_TOKEN');
        this.whatsappFrom = this.config.get('TWILIO_WHATSAPP_FROM') ?? null;
        if (sid && token) {
            try {
                const twilio = require('twilio');
                this.twilioClient = twilio(sid, token);
            }
            catch {
                this.logger.warn('Twilio package not installed. Run: pnpm add twilio');
            }
        }
        else {
            this.logger.warn('WhatsApp (Twilio) not configured: TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN missing');
        }
        const smtpHost = this.config.get('SMTP_HOST');
        const smtpPort = this.config.get('SMTP_PORT');
        const smtpUser = this.config.get('SMTP_USER');
        const smtpPass = this.config.get('SMTP_PASS');
        this.smtpFrom = this.config.get('SMTP_FROM') ?? null;
        if (smtpHost && smtpUser && smtpPass) {
            try {
                const nodemailer = require('nodemailer');
                this.nodemailerTransporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: parseInt(String(smtpPort), 10) || 587,
                    secure: false,
                    auth: { user: smtpUser, pass: smtpPass },
                });
            }
            catch {
                this.logger.warn('Nodemailer not installed. Run: pnpm add nodemailer');
            }
        }
        else {
            this.logger.warn('Email (SMTP) not configured: SMTP_HOST / SMTP_USER / SMTP_PASS missing');
        }
    }
    isWhatsAppConfigured() {
        return !!(this.twilioClient && this.whatsappFrom);
    }
    isEmailConfigured() {
        return !!(this.nodemailerTransporter && this.smtpFrom);
    }
    async sendWhatsApp(to, body) {
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
    async sendEmail(to, subject, text, _context) {
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
};
exports.LabNotificationSender = LabNotificationSender;
exports.LabNotificationSender = LabNotificationSender = LabNotificationSender_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LabNotificationSender);
//# sourceMappingURL=lab-notification-sender.service.js.map