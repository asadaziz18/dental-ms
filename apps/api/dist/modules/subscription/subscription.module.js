"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const entities_1 = require("../../database/entities");
const subscription_processor_1 = require("./subscription.processor");
const plans_controller_1 = require("./plans.controller");
const plans_service_1 = require("./plans.service");
const subscription_controller_1 = require("./subscription.controller");
const subscription_service_1 = require("./subscription.service");
const subscription_admin_controller_1 = require("./subscription-admin.controller");
const subscription_admin_service_1 = require("./subscription-admin.service");
const subscription_invoices_controller_1 = require("./subscription-invoices.controller");
const subscription_invoices_service_1 = require("./subscription-invoices.service");
const plan_limits_service_1 = require("./plan-limits.service");
const subscription_guard_1 = require("./guards/subscription.guard");
const subscription_processor_2 = require("./subscription.processor");
const subscription_scheduler_service_1 = require("./subscription-scheduler.service");
let SubscriptionModule = class SubscriptionModule {
};
exports.SubscriptionModule = SubscriptionModule;
exports.SubscriptionModule = SubscriptionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.Branch,
                entities_1.BranchSubscription,
                entities_1.SubscriptionPlan,
                entities_1.SubscriptionInvoice,
                entities_1.Patient,
                entities_1.User,
            ]),
            bullmq_1.BullModule.registerQueue({
                name: subscription_processor_1.SUBSCRIPTION_QUEUE,
            }),
        ],
        controllers: [
            plans_controller_1.PlansController,
            subscription_controller_1.SubscriptionController,
            subscription_admin_controller_1.SubscriptionAdminController,
            subscription_invoices_controller_1.SubscriptionInvoicesController,
        ],
        providers: [
            plans_service_1.PlansService,
            subscription_service_1.SubscriptionService,
            subscription_admin_service_1.SubscriptionAdminService,
            subscription_invoices_service_1.SubscriptionInvoicesService,
            plan_limits_service_1.PlanLimitsService,
            subscription_guard_1.SubscriptionGuard,
            subscription_processor_2.SubscriptionProcessor,
            subscription_scheduler_service_1.SubscriptionSchedulerService,
        ],
        exports: [
            typeorm_1.TypeOrmModule.forFeature([entities_1.BranchSubscription]),
            plan_limits_service_1.PlanLimitsService,
            subscription_guard_1.SubscriptionGuard,
            subscription_service_1.SubscriptionService,
        ],
    })
], SubscriptionModule);
//# sourceMappingURL=subscription.module.js.map