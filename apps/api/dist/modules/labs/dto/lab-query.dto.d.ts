export declare class LabVendorQueryDto {
    isActive?: string;
    city?: string;
    specialization?: string;
}
export declare class LabOrderQueryDto {
    patientId?: string;
    vendorId?: string;
    status?: string;
    branchId?: string;
    from?: string;
    to?: string;
    priority?: string;
    doctorId?: string;
    page?: number;
    limit?: number;
    search?: string;
}
