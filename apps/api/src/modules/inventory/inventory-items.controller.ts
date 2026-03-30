import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InventoryItemsService } from './inventory-items.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('inventory/items')
@UseGuards(JwtAuthGuard, BranchGuard)
export class InventoryItemsController {
  constructor(private readonly itemsService: InventoryItemsService) {}

  @Get()
  findByBranch(@BranchId() branchId: string) {
    return this.itemsService.findByBranch(branchId);
  }

  @Get(':id')
  findOne(@BranchId() branchId: string, @Param('id') id: string) {
    return this.itemsService.findOne(branchId, id);
  }

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateInventoryItemDto) {
    return this.itemsService.create(branchId, dto);
  }

  @Patch(':id')
  update(
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInventoryItemDto,
  ) {
    return this.itemsService.update(branchId, id, dto);
  }

  @Delete(':id')
  remove(@BranchId() branchId: string, @Param('id') id: string) {
    return this.itemsService.remove(branchId, id);
  }
}
