import { Repository } from 'typeorm';
import { Payment } from '../../database/entities/payment.entity';
import { Invoice } from '../../database/entities/invoice.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsService {
    private readonly paymentRepo;
    private readonly invoiceRepo;
    constructor(paymentRepo: Repository<Payment>, invoiceRepo: Repository<Invoice>);
    findByInvoice(branchId: string, invoiceId: string): Promise<Payment[]>;
    create(branchId: string, dto: CreatePaymentDto): Promise<Payment>;
}
