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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("../../database/entities/invoice.entity");
const invoice_line_item_entity_1 = require("../../database/entities/invoice-line-item.entity");
const patient_entity_1 = require("../../database/entities/patient.entity");
function toNum(s) {
    return parseFloat(s) || 0;
}
function toStr(n) {
    return String(Number(n.toFixed(2)));
}
let InvoicesService = class InvoicesService {
    invoiceRepo;
    lineItemRepo;
    patientRepo;
    constructor(invoiceRepo, lineItemRepo, patientRepo) {
        this.invoiceRepo = invoiceRepo;
        this.lineItemRepo = lineItemRepo;
        this.patientRepo = patientRepo;
    }
    async recalcTotals(invoiceId) {
        const invoice = await this.invoiceRepo.findOne({
            where: { id: invoiceId },
            relations: ['lineItems'],
        });
        if (!invoice)
            return;
        let subtotal = 0;
        let discountAmount = 0;
        for (const line of invoice.lineItems || []) {
            const qty = toNum(line.quantity);
            const unit = toNum(line.unitPrice);
            const lineDisc = toNum(line.discountAmount);
            subtotal += qty * unit;
            discountAmount += lineDisc;
        }
        const afterDiscount = subtotal - discountAmount;
        const taxRate = toNum(invoice.taxRatePercent) / 100;
        const taxAmount = afterDiscount * taxRate;
        const total = afterDiscount + taxAmount;
        invoice.subtotal = toStr(subtotal);
        invoice.discountAmount = toStr(discountAmount);
        invoice.taxAmount = toStr(taxAmount);
        invoice.total = toStr(total);
        await this.invoiceRepo.save(invoice);
    }
    async findByPatient(branchId, patientId) {
        const patient = await this.patientRepo.findOne({
            where: { id: patientId, branchId },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        return this.invoiceRepo.find({
            where: { patientId, branchId },
            relations: ['lineItems', 'lineItems.procedure', 'payments'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(branchId, id) {
        const invoice = await this.invoiceRepo.findOne({
            where: { id, branchId },
            relations: ['lineItems', 'lineItems.procedure', 'payments', 'patient', 'treatmentPlan'],
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return invoice;
    }
    async create(branchId, dto) {
        const patient = await this.patientRepo.findOne({
            where: { id: dto.patientId, branchId },
        });
        if (!patient)
            throw new common_1.BadRequestException('Patient not found in this branch');
        const invoice = this.invoiceRepo.create({
            patientId: dto.patientId,
            branchId,
            treatmentPlanId: dto.treatmentPlanId ?? null,
            doctorId: dto.doctorId ?? null,
            status: dto.status ?? 'Draft',
            dueDate: dto.dueDate ?? null,
            taxRatePercent: dto.taxRatePercent != null ? String(dto.taxRatePercent) : '0',
            notes: dto.notes ?? null,
            subtotal: '0',
            discountAmount: '0',
            taxAmount: '0',
            total: '0',
        });
        const saved = await this.invoiceRepo.save(invoice);
        return this.findOne(branchId, saved.id);
    }
    async update(branchId, id, dto) {
        const invoice = await this.findOne(branchId, id);
        if (dto.status !== undefined)
            invoice.status = dto.status;
        if (dto.dueDate !== undefined)
            invoice.dueDate = dto.dueDate;
        if (dto.taxRatePercent !== undefined)
            invoice.taxRatePercent = String(dto.taxRatePercent);
        if (dto.notes !== undefined)
            invoice.notes = dto.notes;
        if (dto.doctorId !== undefined)
            invoice.doctorId = dto.doctorId;
        await this.invoiceRepo.save(invoice);
        await this.recalcTotals(id);
        return this.findOne(branchId, id);
    }
    async remove(branchId, id) {
        const invoice = await this.findOne(branchId, id);
        await this.invoiceRepo.remove(invoice);
    }
    async addLineItem(branchId, invoiceId, dto) {
        const invoice = await this.findOne(branchId, invoiceId);
        const qty = dto.quantity ?? 1;
        const unit = dto.unitPrice;
        const disc = dto.discountAmount ?? 0;
        const lineTotal = qty * unit - disc;
        const line = this.lineItemRepo.create({
            invoiceId: invoice.id,
            procedureId: dto.procedureId ?? null,
            description: dto.description,
            quantity: String(qty),
            unitPrice: String(unit),
            discountAmount: String(disc),
            lineTotal: String(lineTotal),
        });
        const saved = await this.lineItemRepo.save(line);
        await this.recalcTotals(invoiceId);
        return this.lineItemRepo.findOneOrFail({
            where: { id: saved.id },
            relations: ['procedure'],
        });
    }
    async updateLineItem(branchId, invoiceId, itemId, dto) {
        await this.findOne(branchId, invoiceId);
        const line = await this.lineItemRepo.findOne({
            where: { id: itemId, invoiceId },
        });
        if (!line)
            throw new common_1.NotFoundException('Line item not found');
        if (dto.description !== undefined)
            line.description = dto.description;
        if (dto.procedureId !== undefined)
            line.procedureId = dto.procedureId;
        if (dto.quantity !== undefined)
            line.quantity = String(dto.quantity);
        if (dto.unitPrice !== undefined)
            line.unitPrice = String(dto.unitPrice);
        if (dto.discountAmount !== undefined)
            line.discountAmount = String(dto.discountAmount);
        const qty = parseFloat(line.quantity) || 1;
        const unit = parseFloat(line.unitPrice) || 0;
        const disc = parseFloat(line.discountAmount) || 0;
        line.lineTotal = toStr(qty * unit - disc);
        await this.lineItemRepo.save(line);
        await this.recalcTotals(invoiceId);
        return this.lineItemRepo.findOneOrFail({
            where: { id: line.id },
            relations: ['procedure'],
        });
    }
    async removeLineItem(branchId, invoiceId, itemId) {
        await this.findOne(branchId, invoiceId);
        const line = await this.lineItemRepo.findOne({
            where: { id: itemId, invoiceId },
        });
        if (!line)
            throw new common_1.NotFoundException('Line item not found');
        await this.lineItemRepo.remove(line);
        await this.recalcTotals(invoiceId);
    }
    async getOutstandingBalance(patientId, branchId) {
        const patient = await this.patientRepo.findOne({
            where: { id: patientId, branchId },
        });
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        const invoices = await this.invoiceRepo.find({
            where: { patientId, branchId },
            relations: ['payments'],
        });
        let total = 0;
        let paid = 0;
        for (const inv of invoices) {
            if (inv.status === 'Cancelled')
                continue;
            total += toNum(inv.total);
            for (const p of inv.payments || []) {
                paid += toNum(p.amount);
            }
        }
        return { total, paid, outstanding: Math.max(0, total - paid) };
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_line_item_entity_1.InvoiceLineItem)),
    __param(2, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map