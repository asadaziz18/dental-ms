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
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentPlanDto } from './dto/create-treatment-plan.dto';
import { UpdateTreatmentPlanDto } from './dto/update-treatment-plan.dto';
import { CreateTreatmentPlanItemDto } from './dto/create-treatment-plan-item.dto';
import { UpdateTreatmentPlanItemDto } from './dto/update-treatment-plan-item.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('treatments')
@UseGuards(JwtAuthGuard, BranchGuard)
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Get('patient/:patientId')
  findByPatient(
    @BranchId() branchId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.treatmentsService.findByPatient(branchId, patientId);
  }

  @Get(':id')
  findOne(@BranchId() branchId: string, @Param('id') id: string) {
    return this.treatmentsService.findOne(branchId, id);
  }

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateTreatmentPlanDto) {
    return this.treatmentsService.create(branchId, dto);
  }

  @Patch(':id')
  update(
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTreatmentPlanDto,
  ) {
    return this.treatmentsService.update(branchId, id, dto);
  }

  @Delete(':id')
  remove(@BranchId() branchId: string, @Param('id') id: string) {
    return this.treatmentsService.remove(branchId, id);
  }

  @Post(':id/items')
  addItem(
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Body() dto: CreateTreatmentPlanItemDto,
  ) {
    return this.treatmentsService.addItem(branchId, id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateTreatmentPlanItemDto,
  ) {
    return this.treatmentsService.updateItem(branchId, id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.treatmentsService.removeItem(branchId, id, itemId);
  }
}
