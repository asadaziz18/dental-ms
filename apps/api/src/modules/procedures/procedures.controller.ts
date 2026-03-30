import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BranchGuard } from '../../common/guards/branch.guard';

@Controller('procedures')
@UseGuards(JwtAuthGuard, BranchGuard)
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @Get()
  findAll() {
    return this.proceduresService.findAll();
  }
}
