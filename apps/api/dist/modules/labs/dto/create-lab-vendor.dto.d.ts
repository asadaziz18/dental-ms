export declare class CreateLabVendorDto {
    name: string;
    contactPerson: string;
    phone: string;
    whatsapp?: string | null;
    email?: string | null;
    address?: string | null;
    city: string;
    specializations: string[];
    isActive?: boolean;
    notes?: string | null;
}
