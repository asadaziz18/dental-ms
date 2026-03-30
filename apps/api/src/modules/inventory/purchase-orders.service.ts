import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseOrderLine } from '../../database/entities/purchase-order-line.entity';
import { StockLevel } from '../../database/entities/stock-level.entity';
import { StockTransaction } from '../../database/entities/stock-transaction.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
import { StockService } from './stock.service';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepo: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderLine)
    private readonly lineRepo: Repository<PurchaseOrderLine>,
    @InjectRepository(StockLevel)
    private readonly stockRepo: Repository<StockLevel>,
    @InjectRepository(StockTransaction)
    private readonly txRepo: Repository<StockTransaction>,
    private readonly stockService: StockService,
  ) {}

  async findByBranch(branchId: string): Promise<PurchaseOrder[]> {
    return this.poRepo.find({
      where: { branchId },
      relations: ['supplier', 'lines', 'lines.item'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(branchId: string, id: string): Promise<PurchaseOrder> {
    const po = await this.poRepo.findOne({
      where: { id, branchId },
      relations: ['supplier', 'lines', 'lines.item'],
    });
    if (!po) throw new NotFoundException('Purchase order not found');
    return po;
  }

  async create(branchId: string, dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const po = this.poRepo.create({
      branchId,
      supplierId: dto.supplierId,
      orderNumber: dto.orderNumber ?? null,
      status: 'Draft',
      expectedDate: dto.expectedDate ?? null,
      notes: dto.notes ?? null,
    });
    const saved = await this.poRepo.save(po);
    for (const line of dto.lines) {
      const pol = this.lineRepo.create({
        purchaseOrderId: saved.id,
        itemId: line.itemId,
        quantityOrdered: line.quantityOrdered,
        quantityReceived: 0,
        unitPrice: line.unitPrice != null ? String(line.unitPrice) : null,
      });
      await this.lineRepo.save(pol);
    }
    return this.findOne(branchId, saved.id);
  }

  async update(branchId: string, id: string, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const po = await this.findOne(branchId, id);
    if (po.status !== 'Draft') throw new BadRequestException('Can only edit draft orders');
    if (dto.status !== undefined) po.status = dto.status as PurchaseOrder['status'];
    if (dto.orderNumber !== undefined) po.orderNumber = dto.orderNumber;
    if (dto.expectedDate !== undefined) po.expectedDate = dto.expectedDate;
    if (dto.notes !== undefined) po.notes = dto.notes;
    if (dto.lines !== undefined) {
      await this.lineRepo.delete({ purchaseOrderId: id });
      for (const line of dto.lines) {
        const pol = this.lineRepo.create({
          purchaseOrderId: id,
          itemId: line.itemId,
          quantityOrdered: line.quantityOrdered,
          quantityReceived: 0,
          unitPrice: line.unitPrice != null ? String(line.unitPrice) : null,
        });
        await this.lineRepo.save(pol);
      }
    }
    await this.poRepo.save(po);
    return this.findOne(branchId, id);
  }

  async remove(branchId: string, id: string): Promise<void> {
    const po = await this.findOne(branchId, id);
    if (po.status !== 'Draft') throw new BadRequestException('Can only delete draft orders');
    await this.poRepo.remove(po);
  }

  async receive(branchId: string, id: string, dto: ReceivePurchaseOrderDto): Promise<PurchaseOrder> {
    const po = await this.findOne(branchId, id);
    if (po.status === 'Cancelled') throw new BadRequestException('Order is cancelled');

    for (const rec of dto.lines) {
      const line = po.lines?.find((l) => l.itemId === rec.itemId);
      if (!line) continue;
      const receiveQty = Math.min(rec.quantityReceived, line.quantityOrdered - line.quantityReceived);
      if (receiveQty <= 0) continue;

      let level = await this.stockRepo.findOne({
        where: { branchId, itemId: line.itemId },
      });
      if (!level) {
        level = this.stockRepo.create({ branchId, itemId: line.itemId, quantity: 0 });
        await this.stockRepo.save(level);
      }
      level.quantity += receiveQty;
      await this.stockRepo.save(level);

      const tx = this.txRepo.create({
        branchId,
        itemId: line.itemId,
        type: 'in',
        quantity: receiveQty,
        referenceType: 'purchase',
        referenceId: id,
        notes: `PO ${po.orderNumber ?? id}`,
      });
      await this.txRepo.save(tx);

      line.quantityReceived += receiveQty;
      await this.lineRepo.save(line);
    }

    const allReceived = po.lines?.every((l) => l.quantityReceived >= l.quantityOrdered) ?? true;
    po.status = allReceived ? 'Received' : 'PartiallyReceived';
    await this.poRepo.save(po);

    await this.stockService.checkLowStockAndEmit(branchId);
    return this.findOne(branchId, id);
  }
}
