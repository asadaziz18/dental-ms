import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreateInvoiceLineItemDto } from './dto/create-invoice-line-item.dto';
import { UpdateInvoiceLineItemDto } from './dto/update-invoice-line-item.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    getBalance(branchId: string, patientId: string): Promise<{
        total: number;
        paid: number;
        outstanding: number;
    }>;
    findByPatient(branchId: string, patientId: string): Promise<import("../../database/entities").Invoice[]>;
    findOne(branchId: string, id: string): Promise<import("../../database/entities").Invoice>;
    create(branchId: string, dto: CreateInvoiceDto): Promise<import("../../database/entities").Invoice>;
    update(branchId: string, id: string, dto: UpdateInvoiceDto): Promise<import("../../database/entities").Invoice>;
    remove(branchId: string, id: string): Promise<void>;
    addLineItem(branchId: string, id: string, dto: CreateInvoiceLineItemDto): Promise<import("../../database/entities").InvoiceLineItem>;
    updateLineItem(branchId: string, id: string, itemId: string, dto: UpdateInvoiceLineItemDto): Promise<import("../../database/entities").InvoiceLineItem>;
    removeLineItem(branchId: string, id: string, itemId: string): Promise<void>;
}
