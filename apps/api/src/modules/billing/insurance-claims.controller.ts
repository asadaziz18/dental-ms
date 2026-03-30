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
import { InsuranceClaimsService } from './insurance-claims.service';
import { CreateInsuranceClaimDto } from './dto/create-insurance-claim.dto';
import { UpdateInsuranceClaimDto } from './dto/update-insurance-claim.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('insurance/claims')
@UseGuards(JwtAuthGuard, BranchGuard)
export class InsuranceClaimsController {
  constructor(private readonly claimsService: InsuranceClaimsService) {}

  @Get('patient/:patientId')
  findByPatient(
    @BranchId() branchId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.claimsService.findByPatient(branchId, patientId);
  }

  @Get(':id')
  findOne(@BranchId() branchId: string, @Param('id') id: string) {
    return this.claimsService.findOne(branchId, id);
  }

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateInsuranceClaimDto) {
    return this.claimsService.create(branchId, dto);
  }

  @Patch(':id')
  update(
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInsuranceClaimDto,
  ) {
    return this.claimsService.update(branchId, id, dto);
  }

  @Delete(':id')
  remove(@BranchId() branchId: string, @Param('id') id: string) {
    return this.claimsService.remove(branchId, id);
  }
}
