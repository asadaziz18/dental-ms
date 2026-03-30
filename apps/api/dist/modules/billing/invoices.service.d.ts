import { Repository } from 'typeorm';
import { Invoice } from '../../database/entities/invoice.entity';
import { InvoiceLineItem } from '../../database/entities/invoice-line-item.entity';
import { Patient } from '../../database/entities/patient.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreateInvoiceLineItemDto } from './dto/create-invoice-line-item.dto';
import { UpdateInvoiceLineItemDto } from './dto/update-invoice-line-item.dto';
export declare class InvoicesService {
    private readonly invoiceRepo;
    private readonly lineItemRepo;
    private readonly patientRepo;
    constructor(invoiceRepo: Repository<Invoice>, lineItemRepo: Repository<InvoiceLineItem>, patientRepo: Repository<Patient>);
    recalcTotals(invoiceId: string): Promise<void>;
    findByPatient(branchId: string, patientId: string): Promise<Invoice[]>;
    findOne(branchId: string, id: string): Promise<Invoice>;
    create(branchId: string, dto: CreateInvoiceDto): Promise<Invoice>;
    update(branchId: string, id: string, dto: UpdateInvoiceDto): Promise<Invoice>;
    remove(branchId: string, id: string): Promise<void>;
    addLineItem(branchId: string, invoiceId: string, dto: CreateInvoiceLineItemDto): Promise<InvoiceLineItem>;
    updateLineItem(branchId: string, invoiceId: string, itemId: string, dto: UpdateInvoiceLineItemDto): Promise<InvoiceLineItem>;
    removeLineItem(branchId: string, invoiceId: string, itemId: string): Promise<void>;
    getOutstandingBalance(patientId: string, branchId: string): Promise<{
        total: number;
        paid: number;
        outstanding: number;
    }>;
}
