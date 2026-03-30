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
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, BranchGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Get('patient/:patientId')
  findByPatient(
    @BranchId() branchId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.prescriptionsService.findByPatient(branchId, patientId);
  }

  @Get('patient/:patientId/:id')
  findOne(
    @Param('patientId') patientId: string,
    @Param('id') id: string,
  ) {
    return this.prescriptionsService.findOne(patientId, id);
  }

  @Post()
  create(
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreatePrescriptionDto,
  ) {
    return this.prescriptionsService.create(
      branchId,
      user.userId,
      dto,
    );
  }

  @Patch('patient/:patientId/:id')
  update(
    @Param('patientId') patientId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionsService.update(patientId, id, dto);
  }

  @Delete('patient/:patientId/:id')
  remove(@Param('patientId') patientId: string, @Param('id') id: string) {
    return this.prescriptionsService.remove(patientId, id);
  }
}
