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
exports.SubscriptionSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const subscription_processor_1 = require("./subscription.processor");
let SubscriptionSchedulerService = class SubscriptionSchedulerService {
    queue;
    constructor(queue) {
        this.queue = queue;
    }
    async onModuleInit() {
        await this.queue.add('issue-invoices', { type: 'issue-invoices' }, { repeat: { pattern: '0 0 1 * *' } });
        await this.queue.add('grace-period', { type: 'grace-period' }, { repeat: { pattern: '0 2 * * *' } });
        await this.queue.add('suspension', { type: 'suspension' }, { repeat: { pattern: '0 3 * * *' } });
    }
};
exports.SubscriptionSchedulerService = SubscriptionSchedulerService;
exports.SubscriptionSchedulerService = SubscriptionSchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(subscription_processor_1.SUBSCRIPTION_QUEUE)),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], SubscriptionSchedulerService);
//# sourceMappingURL=subscription-scheduler.service.js.map