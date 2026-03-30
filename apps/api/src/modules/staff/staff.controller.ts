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
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';

@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin')
  findAll(
    @CurrentUser() user: RequestUser,
    @BranchId() branchId: string,
    @Query('branchId') branchIdFilter?: string,
  ) {
    return this.staffService.findAll(
      user.role as 'SuperAdmin' | 'BranchAdmin' | 'Doctor' | 'Receptionist' | 'Nurse',
      user.branchId,
      user.allowedBranches ?? [],
      branchIdFilter,
    );
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: RequestUser,
    @BranchId() branchId: string,
    @Param('id') id: string,
  ) {
    return this.staffService.findOne(
      user.role as 'SuperAdmin' | 'BranchAdmin' | 'Doctor' | 'Receptionist' | 'Nurse',
      user.branchId,
      user.allowedBranches ?? [],
      id,
    );
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin')
  create(
    @CurrentUser() user: RequestUser,
    @BranchId() branchId: string,
    @Body() dto: CreateStaffDto,
  ) {
    return this.staffService.create(
      user.role as 'SuperAdmin' | 'BranchAdmin',
      user.branchId,
      dto,
    );
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin')
  update(
    @CurrentUser() user: RequestUser,
    @BranchId() branchId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.staffService.update(
      user.role as 'SuperAdmin' | 'BranchAdmin' | 'Doctor' | 'Receptionist' | 'Nurse',
      user.branchId,
      user.allowedBranches ?? [],
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin')
  remove(
    @CurrentUser() user: RequestUser,
    @BranchId() branchId: string,
    @Param('id') id: string,
  ) {
    return this.staffService.remove(
      user.role as 'SuperAdmin' | 'BranchAdmin',
      user.branchId,
      user.allowedBranches ?? [],
      id,
    );
  }
}
