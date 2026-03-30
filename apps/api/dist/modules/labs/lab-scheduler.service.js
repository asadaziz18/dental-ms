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
exports.LabSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lab_trial_entity_1 = require("../../database/entities/lab-trial.entity");
const lab_order_entity_1 = require("../../database/entities/lab-order.entity");
const lab_notification_service_1 = require("./lab-notification.service");
let LabSchedulerService = class LabSchedulerService {
    trialRepo;
    orderRepo;
    notificationService;
    constructor(trialRepo, orderRepo, notificationService) {
        this.trialRepo = trialRepo;
        this.orderRepo = orderRepo;
        this.notificationService = notificationService;
    }
    async sendTrialReminders() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().slice(0, 10);
        const trials = await this.trialRepo.find({
            where: {
                trialDate: tomorrowStr,
                status: 'scheduled',
            },
            relations: ['labOrder'],
        });
        for (const trial of trials) {
            try {
                await this.notificationService.sendTrialReminderNotification(trial.id, trial.labOrderId, 'both');
            }
            catch (e) {
            }
        }
    }
    async flagOverdueOrders() {
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
        }
    }
};
exports.LabSchedulerService = LabSchedulerService;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LabSchedulerService.prototype, "sendTrialReminders", null);
__decorate([
    (0, schedule_1.Cron)('0 9 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LabSchedulerService.prototype, "flagOverdueOrders", null);
exports.LabSchedulerService = LabSchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lab_trial_entity_1.LabTrial)),
    __param(1, (0, typeorm_1.InjectRepository)(lab_order_entity_1.LabOrder)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        lab_notification_service_1.LabNotificationService])
], LabSchedulerService);
//# sourceMappingURL=lab-scheduler.service.js.map