export declare const PAYMENT_METHODS: readonly ["Cash", "Card", "Insurance", "Partial", "Other"];
export declare class CreatePaymentDto {
    invoiceId: string;
    amount: number;
    method: (typeof PAYMENT_METHODS)[number];
    reference?: string | null;
    paidAt?: string;
}
