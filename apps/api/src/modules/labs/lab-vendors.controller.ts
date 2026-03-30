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
import { LabVendorsService } from './lab-vendors.service';
import { CreateLabVendorDto } from './dto/create-lab-vendor.dto';
import { UpdateLabVendorDto } from './dto/update-lab-vendor.dto';
import { VendorStatusDto } from './dto/vendor-status.dto';
import { LabVendorQueryDto } from './dto/lab-query.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';
import { LabOrdersService } from './lab-orders.service';

@Controller('lab/vendors')
@UseGuards(JwtAuthGuard, BranchGuard)
export class LabVendorsController {
  constructor(
    private readonly vendorsService: LabVendorsService,
    private readonly ordersService: LabOrdersService,
  ) {}

  private async getTenantId(branchId: string, user: RequestUser): Promise<string | null> {
    if (user.role === 'SuperAdmin') return null;
    return this.ordersService.getTenantIdFromBranch(branchId);
  }

  @Get()
  async findAll(
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Query() query: LabVendorQueryDto,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    return this.vendorsService.findAll(tenantId, query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin')
  async create(
    @BranchId() branchId: string,
    @CurrentUser() _user: RequestUser,
    @Body() dto: CreateLabVendorDto,
  ) {
    const tenantId = await this.ordersService.getTenantIdFromBranch(branchId);
    if (!tenantId) throw new Error('Branch must belong to a tenant to create vendor');
    return this.vendorsService.create(tenantId, dto);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    return this.vendorsService.findOneWithOrderSummary(id, tenantId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin')
  async update(
    @Param('id') id: string,
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateLabVendorDto,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    return this.vendorsService.update(id, tenantId, dto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin')
  async updateStatus(
    @Param('id') id: string,
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: VendorStatusDto,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    return this.vendorsService.updateStatus(id, tenantId, dto.isActive);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin')
  async remove(
    @Param('id') id: string,
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const tenantId = user.role === 'SuperAdmin' ? null : await this.getTenantId(branchId, user);
    await this.vendorsService.remove(id, tenantId);
  }
}
