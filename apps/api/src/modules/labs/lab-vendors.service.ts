import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { LabVendor } from '../../database/entities/lab-vendor.entity';
import { LabOrder } from '../../database/entities/lab-order.entity';
import { CreateLabVendorDto } from './dto/create-lab-vendor.dto';
import { UpdateLabVendorDto } from './dto/update-lab-vendor.dto';
import { LabVendorQueryDto } from './dto/lab-query.dto';

@Injectable()
export class LabVendorsService {
  constructor(
    @InjectRepository(LabVendor)
    private readonly vendorRepo: Repository<LabVendor>,
    @InjectRepository(LabOrder)
    private readonly orderRepo: Repository<LabOrder>,
  ) {}

  async findAll(
    tenantId: string | null,
    query: LabVendorQueryDto,
  ): Promise<LabVendor[]> {
    const qb = this.vendorRepo.createQueryBuilder('v');
    if (tenantId != null) {
      qb.andWhere('v.tenantId = :tenantId', { tenantId });
    }
    if (query.isActive !== undefined && query.isActive !== '') {
      const active = query.isActive === 'true';
      qb.andWhere('v.isActive = :active', { active });
    }
    if (query.city?.trim()) {
      qb.andWhere('v.city ILIKE :city', { city: `%${query.city.trim()}%` });
    }
    if (query.specialization?.trim()) {
      qb.andWhere(
        "EXISTS (SELECT 1 FROM jsonb_array_elements_text(v.specializations) AS s WHERE s ILIKE :spec)",
        { spec: `%${query.specialization.trim()}%` },
      );
    }
    qb.orderBy('v.name', 'ASC');
    return qb.getMany();
  }

  async findOne(id: string, tenantId: string | null): Promise<LabVendor> {
    const qb = this.vendorRepo
      .createQueryBuilder('v')
      .where('v.id = :id', { id });
    if (tenantId != null) {
      qb.andWhere('v.tenantId = :tenantId', { tenantId });
    }
    const vendor = await qb.getOne();
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async findOneWithOrderSummary(
    id: string,
    tenantId: string | null,
  ): Promise<{ vendor: LabVendor; activeOrdersCount: number }> {
    const vendor = await this.findOne(id, tenantId);
    const activeOrdersCount = await this.orderRepo.count({
      where: {
        vendorId: id,
        status: Not(In(['delivered', 'cancelled', 'rejected'])),
      },
    });
    return { vendor, activeOrdersCount };
  }

  async create(tenantId: string, dto: CreateLabVendorDto): Promise<LabVendor> {
    const vendor = this.vendorRepo.create({
      ...dto,
      tenantId,
      isActive: dto.isActive ?? true,
    });
    return this.vendorRepo.save(vendor);
  }

  async update(
    id: string,
    tenantId: string | null,
    dto: UpdateLabVendorDto,
  ): Promise<LabVendor> {
    const vendor = await this.findOne(id, tenantId);
    Object.assign(vendor, dto);
    return this.vendorRepo.save(vendor);
  }

  async updateStatus(
    id: string,
    tenantId: string | null,
    isActive: boolean,
  ): Promise<LabVendor> {
    const vendor = await this.findOne(id, tenantId);
    vendor.isActive = isActive;
    return this.vendorRepo.save(vendor);
  }

  async remove(id: string, tenantId: string | null): Promise<void> {
    const vendor = await this.findOne(id, tenantId);
    const activeCount = await this.orderRepo.count({
      where: {
        vendorId: id,
        status: Not(In(['delivered', 'cancelled', 'rejected'])),
      },
    });
    if (activeCount > 0) {
      throw new BadRequestException(
        `Cannot delete vendor: ${activeCount} active order(s) exist.`,
      );
    }
    await this.vendorRepo.remove(vendor);
  }
}
