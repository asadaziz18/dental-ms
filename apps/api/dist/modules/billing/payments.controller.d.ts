import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findByInvoice(branchId: string, invoiceId: string): Promise<import("../../database/entities").Payment[]>;
    create(branchId: string, dto: CreatePaymentDto): Promise<import("../../database/entities").Payment>;
}
