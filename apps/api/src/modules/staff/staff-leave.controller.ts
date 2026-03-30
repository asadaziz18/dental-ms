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
import { StaffLeaveService } from './staff-leave.service';
import { CreateStaffLeaveDto } from './dto/staff-leave.dto';
import { UpdateStaffLeaveDto } from './dto/staff-leave.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('staff/leaves')
@UseGuards(JwtAuthGuard, BranchGuard)
export class StaffLeaveController {
  constructor(private readonly leaveService: StaffLeaveService) {}

  @Get()
  findByBranch(
    @BranchId() branchId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.leaveService.findByBranch(branchId, fromDate, toDate);
  }

  @Get('user/:userId')
  findByUser(@BranchId() branchId: string, @Param('userId') userId: string) {
    return this.leaveService.findByUser(branchId, userId);
  }

  @Get(':id')
  findOne(@BranchId() branchId: string, @Param('id') id: string) {
    return this.leaveService.findOne(branchId, id);
  }

  @Post()
  create(@BranchId() branchId: string, @Body() dto: CreateStaffLeaveDto) {
    return this.leaveService.create(branchId, dto);
  }

  @Patch(':id')
  update(
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStaffLeaveDto,
  ) {
    return this.leaveService.update(branchId, id, dto);
  }

  @Delete(':id')
  remove(@BranchId() branchId: string, @Param('id') id: string) {
    return this.leaveService.remove(branchId, id);
  }
}
