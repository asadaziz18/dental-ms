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
exports.LabNotificationService = exports.LAB_NOTIFICATIONS_QUEUE = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
exports.LAB_NOTIFICATIONS_QUEUE = 'lab-notifications';
let LabNotificationService = class LabNotificationService {
    queue;
    constructor(queue) {
        this.queue = queue;
    }
    async sendTrialScheduledNotification(trial, order, channel, customMessage) {
        await this.queue.add('trial_scheduled', {
            type: 'trial_scheduled',
            orderId: order.id,
            trialId: trial.id,
            channel,
            customMessage,
        }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
        });
    }
    async sendTrialReminderNotification(trialId, orderId, channel) {
        await this.queue.add('trial_reminder', { type: 'trial_reminder', orderId, trialId, channel }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
        });
    }
    async sendOrderReadyNotification(orderId, channel) {
        await this.queue.add('order_ready', { type: 'order_ready', orderId, channel }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
        });
    }
};
exports.LabNotificationService = LabNotificationService;
exports.LabNotificationService = LabNotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(exports.LAB_NOTIFICATIONS_QUEUE)),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], LabNotificationService);
//# sourceMappingURL=lab-notification.service.js.map