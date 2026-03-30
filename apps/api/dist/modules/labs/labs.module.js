"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const entities_1 = require("../../database/entities");
const lab_vendors_controller_1 = require("./lab-vendors.controller");
const lab_vendors_service_1 = require("./lab-vendors.service");
const lab_orders_controller_1 = require("./lab-orders.controller");
const lab_orders_service_1 = require("./lab-orders.service");
const lab_notification_service_1 = require("./lab-notification.service");
const lab_notification_processor_1 = require("./lab-notification.processor");
const lab_notification_sender_service_1 = require("./lab-notification-sender.service");
const lab_scheduler_service_1 = require("./lab-scheduler.service");
const lab_notification_service_2 = require("./lab-notification.service");
const imaging_module_1 = require("../imaging/imaging.module");
let LabsModule = class LabsModule {
};
exports.LabsModule = LabsModule;
exports.LabsModule = LabsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.LabVendor,
                entities_1.LabOrder,
                entities_1.LabTrial,
                entities_1.LabNotification,
                entities_1.Branch,
                entities_1.Patient,
                entities_1.User,
            ]),
            bullmq_1.BullModule.registerQueue({ name: lab_notification_service_2.LAB_NOTIFICATIONS_QUEUE }),
            imaging_module_1.ImagingModule,
        ],
        controllers: [lab_vendors_controller_1.LabVendorsController, lab_orders_controller_1.LabOrdersController],
        providers: [
            lab_vendors_service_1.LabVendorsService,
            lab_orders_service_1.LabOrdersService,
            lab_notification_service_1.LabNotificationService,
            lab_notification_sender_service_1.LabNotificationSender,
            lab_notification_processor_1.LabNotificationProcessor,
            lab_scheduler_service_1.LabSchedulerService,
        ],
        exports: [lab_vendors_service_1.LabVendorsService, lab_orders_service_1.LabOrdersService],
    })
], LabsModule);
//# sourceMappingURL=labs.module.js.map