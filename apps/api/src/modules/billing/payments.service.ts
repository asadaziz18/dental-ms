import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../database/entities/payment.entity';
import { Invoice } from '../../database/entities/invoice.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  async findByInvoice(branchId: string, invoiceId: string): Promise<Payment[]> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId, branchId },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return this.paymentRepo.find({
      where: { invoiceId },
      order: { paidAt: 'DESC' },
    });
  }

  async create(branchId: string, dto: CreatePaymentDto): Promise<Payment> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: dto.invoiceId, branchId },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

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
}
