import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockLevel } from '../../database/entities/stock-level.entity';
import { StockTransaction } from '../../database/entities/stock-transaction.entity';
import { InventoryItem } from '../../database/entities/inventory-item.entity';
import { CreateStockTransactionDto } from './dto/stock-transaction.dto';
import { InventoryGateway } from './inventory.gateway';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockLevel)
    private readonly levelRepo: Repository<StockLevel>,
    @InjectRepository(StockTransaction)
    private readonly txRepo: Repository<StockTransaction>,
    @InjectRepository(InventoryItem)
    private readonly itemRepo: Repository<InventoryItem>,
    private readonly gateway: InventoryGateway,
  ) {}

  async getLevel(branchId: string, itemId: string): Promise<StockLevel> {
    const level = await this.levelRepo.findOne({
      where: { branchId, itemId },
      relations: ['item'],
    });
    if (!level) throw new NotFoundException('Stock level not found');
    return level;
  }

  async getLevelsByBranch(branchId: string): Promise<StockLevel[]> {
    return this.levelRepo
      .createQueryBuilder('sl')
      .innerJoinAndSelect('sl.item', 'item')
      .where('sl.branchId = :branchId', { branchId })
      .orderBy('item.name', 'ASC')
      .getMany();
  }

  async recordTransaction(
    branchId: string,
    dto: CreateStockTransactionDto,
  ): Promise<StockTransaction> {
    const item = await this.itemRepo.findOne({
      where: { id: dto.itemId, branchId },
    });
    if (!item) throw new NotFoundException('Inventory item not found');

    let level = await this.levelRepo.findOne({
      where: { branchId, itemId: dto.itemId },
    });
    if (!level) {
      level = this.levelRepo.create({ branchId, itemId: dto.itemId, quantity: 0 });
      await this.levelRepo.save(level);
    }

    const sign = dto.type === 'in' ? 1 : -1;
    const newQty = level.quantity + sign * dto.quantity;
    if (newQty < 0) throw new BadRequestException('Insufficient stock');

    level.quantity = newQty;
    await this.levelRepo.save(level);

    const tx = this.txRepo.create({
      branchId,
      itemId: dto.itemId,
      type: dto.type,
      quantity: dto.quantity,
      referenceType: dto.referenceType ?? null,
      referenceId: dto.referenceId ?? null,
      notes: dto.notes ?? null,
    });
    const saved = await this.txRepo.save(tx);
    await this.checkLowStockAndEmit(branchId, dto.itemId);
    return this.txRepo.findOneOrFail({
      where: { id: saved.id },
      relations: ['item'],
    });
  }

  async getTransactions(
    branchId: string,
    itemId?: string,
    limit = 50,
  ): Promise<StockTransaction[]> {
    const qb = this.txRepo
      .createQueryBuilder('t')
      .where('t.branchId = :branchId', { branchId })
      .orderBy('t.createdAt', 'DESC')
      .take(limit);
    if (itemId) qb.andWhere('t.itemId = :itemId', { itemId });
    return qb.getMany();
  }

  async checkLowStockAndEmit(branchId: string, itemId?: string): Promise<void> {
    const qb = this.levelRepo
      .createQueryBuilder('sl')
      .innerJoinAndSelect('sl.item', 'item')
      .where('sl.branchId = :branchId', { branchId })
      .andWhere('sl.quantity <= item.reorderThreshold')
      .andWhere('item.reorderThreshold > 0');
    if (itemId) qb.andWhere('sl.itemId = :itemId', { itemId });
    const low = await qb.getMany();
    if (low.length > 0) {
      this.gateway.emitLowStockAlert(
        branchId,
        low.map((sl) => ({
          itemId: sl.itemId,
          itemName: sl.item.name,
          sku: sl.item.sku,
          quantity: sl.quantity,
          reorderThreshold: sl.item.reorderThreshold,
        })),
      );
    }
  }
}
