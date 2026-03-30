import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientQueryDto } from './dto/patient-query.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { SubscriptionGuard } from '../subscription/guards/subscription.guard';

@Controller('patients')
@UseGuards(BranchGuard, SubscriptionGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  create(
    @BranchId() branchId: string,
    @Body() dto: CreatePatientDto,
  ) {
    return this.patientsService.create(branchId, dto);
  }

  @Get()
  findAll(
    @BranchId() branchId: string,
    @Query() query: PatientQueryDto,
  ) {
    return this.patientsService.findAll(branchId, query);
  }

  @Get(':id')
  findOne(
    @BranchId() branchId: string,
    @Param('id') id: string,
  ) {
    return this.patientsService.findOne(branchId, id);
  }

  @Patch(':id')
  update(
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patientsService.update(branchId, id, dto);
  }

  @Delete(':id')
  remove(
    @BranchId() branchId: string,
    @Param('id') id: string,
  ) {
    return this.patientsService.remove(branchId, id);
  }

  @Get(':id/timeline')
  getTimeline(
    @BranchId() branchId: string,
    @Param('id') id: string,
  ) {
    return this.patientsService.getTimeline(branchId, id);
  }
}
