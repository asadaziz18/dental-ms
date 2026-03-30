import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from '../../database/entities/inventory-item.entity';
import { StockLevel } from '../../database/entities/stock-level.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@Injectable()
export class InventoryItemsService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly itemRepo: Repository<InventoryItem>,
    @InjectRepository(StockLevel)
    private readonly stockRepo: Repository<StockLevel>,
  ) {}

  async findByBranch(branchId: string): Promise<InventoryItem[]> {
    return this.itemRepo.find({
      where: { branchId },
      relations: ['stockLevels'],
      order: { name: 'ASC' },
    });
  }

  async findOne(branchId: string, id: string): Promise<InventoryItem> {
    const item = await this.itemRepo.findOne({
      where: { id, branchId },
      relations: ['stockLevels'],
    });
    if (!item) throw new NotFoundException('Inventory item not found');
    return item;
  }

  async create(branchId: string, dto: CreateInventoryItemDto): Promise<InventoryItem> {
    const existing = await this.itemRepo.findOne({
      where: { branchId, sku: dto.sku },
    });
    if (existing) throw new BadRequestException(`SKU "${dto.sku}" already exists in this branch`);
    const item = this.itemRepo.create({
      ...dto,
      branchId,
      unit: dto.unit ?? 'unit',
      reorderThreshold: dto.reorderThreshold ?? 0,
    });
    const saved = await this.itemRepo.save(item);
    const level = this.stockRepo.create({
      branchId,
      itemId: saved.id,
      quantity: 0,
    });
    await this.stockRepo.save(level);
    return this.findOne(branchId, saved.id);
  }

  async update(branchId: string, id: string, dto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const item = await this.findOne(branchId, id);
    if (dto.sku !== undefined && dto.sku !== item.sku) {
      const existing = await this.itemRepo.findOne({
        where: { branchId, sku: dto.sku },
      });
      if (existing) throw new BadRequestException(`SKU "${dto.sku}" already exists`);
    }
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async remove(branchId: string, id: string): Promise<void> {
    const item = await this.findOne(branchId, id);
    await this.itemRepo.remove(item);
  }
}
