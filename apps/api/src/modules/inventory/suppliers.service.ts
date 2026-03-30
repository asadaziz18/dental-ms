import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../../database/entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repo: Repository<Supplier>,
  ) {}

  async findByBranch(branchId: string): Promise<Supplier[]> {
    return this.repo.find({
      where: { branchId },
      order: { name: 'ASC' },
    });
  }

  async findOne(branchId: string, id: string): Promise<Supplier> {
    const supplier = await this.repo.findOne({
      where: { id, branchId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async create(branchId: string, dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.repo.create({
      ...dto,
      branchId,
    });
    return this.repo.save(supplier);
  }

  async update(branchId: string, id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(branchId, id);
    Object.assign(supplier, dto);
    return this.repo.save(supplier);
  }

  async remove(branchId: string, id: string): Promise<void> {
    const supplier = await this.findOne(branchId, id);
    await this.repo.remove(supplier);
  }
}
