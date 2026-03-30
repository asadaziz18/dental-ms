"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("../../database/entities");
const invoices_service_1 = require("./invoices.service");
const payments_service_1 = require("./payments.service");
const insurance_claims_service_1 = require("./insurance-claims.service");
const invoices_controller_1 = require("./invoices.controller");
const payments_controller_1 = require("./payments.controller");
const insurance_claims_controller_1 = require("./insurance-claims.controller");
let BillingModule = class BillingModule {
};
exports.BillingModule = BillingModule;
exports.BillingModule = BillingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.Invoice,
                entities_1.InvoiceLineItem,
                entities_1.Payment,
                entities_1.InsuranceClaim,
                entities_1.Patient,
            ]),
        ],
        controllers: [
            invoices_controller_1.InvoicesController,
            payments_controller_1.PaymentsController,
            insurance_claims_controller_1.InsuranceClaimsController,
        ],
        providers: [invoices_service_1.InvoicesService, payments_service_1.PaymentsService, insurance_claims_service_1.InsuranceClaimsService],
        exports: [invoices_service_1.InvoicesService, payments_service_1.PaymentsService, insurance_claims_service_1.InsuranceClaimsService],
    })
], BillingModule);
//# sourceMappingURL=billing.module.js.map