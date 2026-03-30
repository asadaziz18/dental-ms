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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionProcessor = exports.SUBSCRIPTION_QUEUE = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const subscription_invoices_service_1 = require("./subscription-invoices.service");
exports.SUBSCRIPTION_QUEUE = 'subscription';
let SubscriptionProcessor = class SubscriptionProcessor extends bullmq_1.WorkerHost {
    invoicesService;
    constructor(invoicesService) {
        super();
        this.invoicesService = invoicesService;
    }
    async process(job) {
        switch (job.name) {
            case 'issue-invoices':
                await this.invoicesService.issueInvoicesForPeriod();
                break;
            case 'grace-period':
                await this.invoicesService.moveOverdueToGrace();
                break;
            case 'suspension':
                await this.invoicesService.suspendAfterGrace(7);
                break;
            default:
                throw new Error(`Unknown job type: ${job.name}`);
        }
    }
};
exports.SubscriptionProcessor = SubscriptionProcessor;
exports.SubscriptionProcessor = SubscriptionProcessor = __decorate([
    (0, bullmq_1.Processor)(exports.SUBSCRIPTION_QUEUE),
    __metadata("design:paramtypes", [subscription_invoices_service_1.SubscriptionInvoicesService])
], SubscriptionProcessor);
//# sourceMappingURL=subscription.processor.js.map