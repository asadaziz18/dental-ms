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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("../../database/entities/payment.entity");
const invoice_entity_1 = require("../../database/entities/invoice.entity");
let PaymentsService = class PaymentsService {
    paymentRepo;
    invoiceRepo;
    constructor(paymentRepo, invoiceRepo) {
        this.paymentRepo = paymentRepo;
        this.invoiceRepo = invoiceRepo;
    }
    async findByInvoice(branchId, invoiceId) {
        const invoice = await this.invoiceRepo.findOne({
            where: { id: invoiceId, branchId },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return this.paymentRepo.find({
            where: { invoiceId },
            order: { paidAt: 'DESC' },
        });
    }
    async create(branchId, dto) {
        const invoice = await this.invoiceRepo.findOne({
            where: { id: dto.invoiceId, branchId },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        const paidAt = dto.paidAt ? new Date(dto.paidAt) : new Date();
        const payment = this.paymentRepo.create({
            invoiceId: dto.invoiceId,
            branchId,
            amount: String(dto.amount),
            method: dto.method,
            reference: dto.reference ?? null,
            paidAt,
        });
        return this.paymentRepo.save(payment);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map