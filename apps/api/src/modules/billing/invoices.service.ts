import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../database/entities/invoice.entity';
import { InvoiceLineItem } from '../../database/entities/invoice-line-item.entity';
import { Patient } from '../../database/entities/patient.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreateInvoiceLineItemDto } from './dto/create-invoice-line-item.dto';
import { UpdateInvoiceLineItemDto } from './dto/update-invoice-line-item.dto';

function toNum(s: string): number {
  return parseFloat(s) || 0;
}

function toStr(n: number): string {
  return String(Number(n.toFixed(2)));
}

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(InvoiceLineItem)
    private readonly lineItemRepo: Repository<InvoiceLineItem>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async recalcTotals(invoiceId: string): Promise<void> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: ['lineItems'],
    });
    if (!invoice) return;

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

  async findByPatient(branchId: string, patientId: string): Promise<Invoice[]> {
    const patient = await this.patientRepo.findOne({
      where: { id: patientId, branchId },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return this.invoiceRepo.find({
      where: { patientId, branchId },
      relations: ['lineItems', 'lineItems.procedure', 'payments'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(branchId: string, id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id, branchId },
      relations: ['lineItems', 'lineItems.procedure', 'payments', 'patient', 'treatmentPlan'],
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async create(branchId: string, dto: CreateInvoiceDto): Promise<Invoice> {
    const patient = await this.patientRepo.findOne({
      where: { id: dto.patientId, branchId },
    });
    if (!patient) throw new BadRequestException('Patient not found in this branch');

    const invoice = this.invoiceRepo.create({
      patientId: dto.patientId,
      branchId,
      treatmentPlanId: dto.treatmentPlanId ?? null,
      doctorId: dto.doctorId ?? null,
      status: (dto.status as Invoice['status']) ?? 'Draft',
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

  async update(branchId: string, id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(branchId, id);
    if (dto.status !== undefined) invoice.status = dto.status as Invoice['status'];
    if (dto.dueDate !== undefined) invoice.dueDate = dto.dueDate;
    if (dto.taxRatePercent !== undefined) invoice.taxRatePercent = String(dto.taxRatePercent);
    if (dto.notes !== undefined) invoice.notes = dto.notes;
    if (dto.doctorId !== undefined) invoice.doctorId = dto.doctorId;
    await this.invoiceRepo.save(invoice);
    await this.recalcTotals(id);
    return this.findOne(branchId, id);
  }

  async remove(branchId: string, id: string): Promise<void> {
    const invoice = await this.findOne(branchId, id);
    await this.invoiceRepo.remove(invoice);
  }

  async addLineItem(
    branchId: string,
    invoiceId: string,
    dto: CreateInvoiceLineItemDto,
  ): Promise<InvoiceLineItem> {
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

  async updateLineItem(
    branchId: string,
    invoiceId: string,
    itemId: string,
    dto: UpdateInvoiceLineItemDto,
  ): Promise<InvoiceLineItem> {
    await this.findOne(branchId, invoiceId);
    const line = await this.lineItemRepo.findOne({
      where: { id: itemId, invoiceId },
    });
    if (!line) throw new NotFoundException('Line item not found');

    if (dto.description !== undefined) line.description = dto.description;
    if (dto.procedureId !== undefined) line.procedureId = dto.procedureId;
    if (dto.quantity !== undefined) line.quantity = String(dto.quantity);
    if (dto.unitPrice !== undefined) line.unitPrice = String(dto.unitPrice);
    if (dto.discountAmount !== undefined) line.discountAmount = String(dto.discountAmount);

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

  async removeLineItem(
    branchId: string,
    invoiceId: string,
    itemId: string,
  ): Promise<void> {
    await this.findOne(branchId, invoiceId);
    const line = await this.lineItemRepo.findOne({
      where: { id: itemId, invoiceId },
    });
    if (!line) throw new NotFoundException('Line item not found');
    await this.lineItemRepo.remove(line);
    await this.recalcTotals(invoiceId);
  }

  async getOutstandingBalance(patientId: string, branchId: string): Promise<{ total: number; paid: number; outstanding: number }> {
    const patient = await this.patientRepo.findOne({
      where: { id: patientId, branchId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const invoices = await this.invoiceRepo.find({
      where: { patientId, branchId },
      relations: ['payments'],
    });
    let total = 0;
    let paid = 0;
    for (const inv of invoices) {
      if (inv.status === 'Cancelled') continue;
      total += toNum(inv.total);
      for (const p of inv.payments || []) {
        paid += toNum(p.amount);
      }
    }
    return { total, paid, outstanding: Math.max(0, total - paid) };
  }
}
