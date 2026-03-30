import { Repository } from 'typeorm';
import { Supplier } from '../../database/entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersService {
    private readonly repo;
    constructor(repo: Repository<Supplier>);
    findByBranch(branchId: string): Promise<Supplier[]>;
    findOne(branchId: string, id: string): Promise<Supplier>;
    create(branchId: string, dto: CreateSupplierDto): Promise<Supplier>;
    update(branchId: string, id: string, dto: UpdateSupplierDto): Promise<Supplier>;
    remove(branchId: string, id: string): Promise<void>;
}
