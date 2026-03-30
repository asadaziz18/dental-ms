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
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';

@Controller('appointments')
@UseGuards(BranchGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(
    @BranchId() branchId: string,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(branchId, dto);
  }

  @Get()
  findAll(
    @BranchId() branchId: string,
    @Query() query: AppointmentQueryDto,
  ) {
    return this.appointmentsService.findAll(branchId, query);
  }

  @Get('doctors')
  getDoctors(@BranchId() branchId: string) {
    return this.appointmentsService.getDoctors(branchId);
  }

  @Get(':id')
  findOne(
    @BranchId() branchId: string,
    @Param('id') id: string,
  ) {
    return this.appointmentsService.findOne(branchId, id);
  }

  @Patch(':id/status')
  updateStatus(
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.appointmentsService.updateStatus(branchId, id, dto);
  }

  @Delete(':id')
  remove(
    @BranchId() branchId: string,
    @Param('id') id: string,
  ) {
    return this.appointmentsService.remove(branchId, id);
  }
}
