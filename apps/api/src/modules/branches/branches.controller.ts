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
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchStatusDto } from './dto/branch-status.dto';
import { AssignManagerDto } from './dto/assign-manager.dto';
import { SuperAdminOnlyGuard } from './guards/super-admin-only.guard';

@Controller('branches')
@UseGuards(JwtAuthGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @UseGuards(SuperAdminOnlyGuard)
  async createMainBranch(@Body() dto: CreateBranchDto) {
    return this.branchesService.createMainBranch(dto);
  }

  @Post(':id/sub-branches')
  @UseGuards(SuperAdminOnlyGuard)
  async createSubBranch(
    @Param('id') parentId: string,
    @Body() dto: CreateBranchDto,
  ) {
    return this.branchesService.createSubBranchWithParent(parentId, dto);
  }

  @Delete(':id')
  @UseGuards(SuperAdminOnlyGuard)
  async remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist', 'Nurse')
  async list(@CurrentUser() user: RequestUser) {
    return this.branchesService.findTree(
      user?.role ?? '',
      user?.branchId ?? null,
    );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist', 'Nurse')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.branchesService.findOne(
      id,
      user?.role ?? '',
      user?.branchId ?? null,
    );
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBranchDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.branchesService.update(
      id,
      dto,
      user?.role ?? '',
      user?.branchId ?? null,
    );
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: BranchStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.branchesService.updateStatus(
      id,
      dto,
      user?.role ?? '',
      user?.branchId ?? null,
    );
  }

  @Get(':id/staff')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin')
  async getStaff(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.branchesService.getStaff(
      id,
      user?.role ?? '',
      user?.branchId ?? null,
    );
  }

  @Get(':id/stats')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin')
  async getStats(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.branchesService.getStats(
      id,
      user?.role ?? '',
      user?.branchId ?? null,
    );
  }

  @Post(':id/assign-manager')
  @UseGuards(SuperAdminOnlyGuard)
  async assignManager(
    @Param('id') id: string,
    @Body() dto: AssignManagerDto,
  ) {
    return this.branchesService.assignManager(id, dto);
  }
}

