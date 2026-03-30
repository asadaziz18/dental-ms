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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabNotificationProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lab_order_entity_1 = require("../../database/entities/lab-order.entity");
const lab_trial_entity_1 = require("../../database/entities/lab-trial.entity");
const lab_notification_entity_1 = require("../../database/entities/lab-notification.entity");
const lab_notification_service_1 = require("./lab-notification.service");
const lab_notification_sender_service_1 = require("./lab-notification-sender.service");
let LabNotificationProcessor = class LabNotificationProcessor extends bullmq_1.WorkerHost {
    orderRepo;
    trialRepo;
    notificationRepo;
    sender;
    constructor(orderRepo, trialRepo, notificationRepo, sender) {
        super();
        this.orderRepo = orderRepo;
        this.trialRepo = trialRepo;
        this.notificationRepo = notificationRepo;
        this.sender = sender;
    }
    async process(job) {
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
            ? `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim() || 'Patient'
            : 'Patient';
        if (payload.type === 'trial_scheduled') {
            const trial = await this.trialRepo.findOne({
                where: { id: payload.trialId, labOrderId: payload.orderId },
            });
            if (!trial)
                throw new Error(`Trial not found: ${payload.trialId}`);
            const workType = (order.customWorkType || order.workType?.replace('_', ' ')) ?? 'dental work';
            const trialDate = typeof trial.trialDate === 'string' ? trial.trialDate : trial.trialDate.toISOString().slice(0, 10);
            const message = payload.customMessage ??
                `Dear ${patientName}, your dental lab trial (Trial #${trial.trialNumber}) for ${workType} has been scheduled on ${trialDate} at ${branchName}. Please arrive 10 minutes early. For queries call ${branchPhone}.`;
            await this.sendAndLog(order.id, trial.id, order.patientId, payload.channel, 'trial_scheduled', message, order, patientName, branchName, branchPhone, trialDate, trial.trialNumber, workType);
        }
        else if (payload.type === 'trial_reminder') {
            const trial = await this.trialRepo.findOne({
                where: { id: payload.trialId, labOrderId: payload.orderId },
            });
            if (!trial)
                throw new Error(`Trial not found: ${payload.trialId}`);
            const trialDate = typeof trial.trialDate === 'string' ? trial.trialDate : trial.trialDate.toISOString().slice(0, 10);
            const message = `Dear ${patientName}, reminder: your dental lab trial #${trial.trialNumber} is scheduled on ${trialDate} at ${branchName}. Contact us: ${branchPhone}.`;
            await this.sendAndLog(order.id, trial.id, order.patientId, payload.channel, 'trial_reminder', message, order, patientName, branchName, branchPhone, trialDate, trial.trialNumber, '');
        }
        else if (payload.type === 'order_ready') {
            const workType = (order.customWorkType || order.workType?.replace('_', ' ')) ?? 'dental work';
            const labName = order.vendor?.name ?? 'the lab';
            const message = `Dear ${patientName}, your ${workType} from ${labName} is ready for fitting. Please book your appointment at ${branchName}. Call us: ${branchPhone}`;
            await this.sendAndLog(order.id, null, order.patientId, payload.channel, 'order_ready', message, order, patientName, branchName, branchPhone, '', 0, workType);
        }
    }
    async sendAndLog(orderId, trialId, patientId, channel, type, message, order, patientName, branchName, branchPhone, trialDate, trialNumber, workType) {
        const channels = channel === 'both' ? ['whatsapp', 'email'] : [channel];
        const phone = order.patient?.phone ?? null;
        const email = order.patient?.email ?? null;
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
                }
                else if (ch === 'email' && email) {
                    const subject = type === 'trial_scheduled'
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
                }
                else {
                    record.status = 'failed';
                    record.errorMessage = ch === 'whatsapp' ? 'No phone number' : 'No email address';
                    record.sentAt = new Date();
                    await this.notificationRepo.save(record);
                    continue;
                }
                record.status = 'sent';
                record.sentAt = new Date();
                await this.notificationRepo.save(record);
            }
            catch (err) {
                record.status = 'failed';
                record.errorMessage = err instanceof Error ? err.message : String(err);
                record.sentAt = new Date();
                await this.notificationRepo.save(record);
                const msg = err instanceof Error ? err.message : String(err);
                if (!msg.includes('not configured'))
                    throw err;
            }
        }
    }
};
exports.LabNotificationProcessor = LabNotificationProcessor;
exports.LabNotificationProcessor = LabNotificationProcessor = __decorate([
    (0, bullmq_1.Processor)(lab_notification_service_1.LAB_NOTIFICATIONS_QUEUE, {
        concurrency: 2,
    }),
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lab_order_entity_1.LabOrder)),
    __param(1, (0, typeorm_1.InjectRepository)(lab_trial_entity_1.LabTrial)),
    __param(2, (0, typeorm_1.InjectRepository)(lab_notification_entity_1.LabNotification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        lab_notification_sender_service_1.LabNotificationSender])
], LabNotificationProcessor);
//# sourceMappingURL=lab-notification.processor.js.map