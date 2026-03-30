import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { LabOrdersService } from './lab-orders.service';
import { CreateLabOrderDto } from './dto/create-lab-order.dto';
import { UpdateLabOrderDto } from './dto/update-lab-order.dto';
import { OrderStatusDto } from './dto/order-status.dto';
import { OrderPaymentDto } from './dto/order-payment.dto';
import { CreateLabTrialDto } from './dto/create-lab-trial.dto';
import { UpdateLabTrialDto } from './dto/update-lab-trial.dto';
import { CompleteTrialDto } from './dto/complete-trial.dto';
import { TrialNotifyDto } from './dto/trial-notify.dto';
import { LabOrderQueryDto } from './dto/lab-query.dto';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { BranchGuard } from '../../common/guards/branch.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';
import { STORAGE_SERVICE } from '../imaging/storage/storage.interface';
import type { IStorageService } from '../imaging/storage/storage.interface';
import { ConfigService } from '@nestjs/config';

interface MulterFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('lab/orders')
@UseGuards(JwtAuthGuard, BranchGuard)
export class LabOrdersController {
  constructor(
    private readonly ordersService: LabOrdersService,
    private readonly config: ConfigService,
    @Inject(STORAGE_SERVICE)
    private readonly storage: IStorageService,
  ) {}

  private async getTenantId(branchId: string, user: RequestUser): Promise<string | null> {
    if (user.role === 'SuperAdmin') return null;
    return this.ordersService.getTenantIdFromBranch(branchId);
  }

  @Get('dashboard')
  async getDashboard(
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    return this.ordersService.getDashboardStats(branchId, tenantId);
  }

  @Get()
  async findAll(
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Query() query: LabOrderQueryDto,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    return this.ordersService.findAll(branchId, tenantId, query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist')
  async create(
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateLabOrderDto,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    if (!tenantId) throw new Error('Branch tenant required to create order');
    return this.ordersService.create(tenantId, branchId, user.userId, dto);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    return this.ordersService.findOne(id, branchId, tenantId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist')
  async update(
    @Param('id') id: string,
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateLabOrderDto,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    return this.ordersService.update(id, branchId, tenantId, dto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist')
  async updateStatus(
    @Param('id') id: string,
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: OrderStatusDto,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    return this.ordersService.updateStatus(id, branchId, tenantId, dto.status);
  }

  @Patch(':id/payment')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin')
  async updatePayment(
    @Param('id') id: string,
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: OrderPaymentDto,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    return this.ordersService.updatePayment(
      id,
      branchId,
      tenantId,
      dto.isPaid,
      dto.labFee,
    );
  }

  @Post(':id/attachments')
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Roles('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist')
  async addAttachment(
    @Param('id') id: string,
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @UploadedFile() file: MulterFile,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    const key = `lab-orders/${id}/${Date.now()}-${(file?.originalname ?? 'file').replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    await this.storage.upload(key, file!.buffer, file!.mimetype);
    const driver = this.config.get('STORAGE_DRIVER', 's3');
    let url: string;
    if (driver === 'local') {
      const baseUrl = this.config.get('APP_PUBLIC_URL', 'http://localhost:3000').replace(/\/$/, '');
      url = `${baseUrl}/lab/orders/${id}/attachments/serve?key=${encodeURIComponent(key)}`;
    } else {
      const baseUrl = this.config.get('S3_PUBLIC_BASE_URL');
      url = baseUrl ? `${baseUrl}/${key}` : key;
    }
    return this.ordersService.addAttachment(id, branchId, tenantId, url);
  }

  @Get(':id/attachments/serve')
  async serveAttachment(
    @Param('id') id: string,
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Query('key') key: string,
    @Res() res: Response,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    await this.ordersService.findOne(id, branchId, tenantId);
    if (!key || !key.startsWith(`lab-orders/${id}/`)) {
      return res.status(400).json({ message: 'Invalid key' });
    }
    if (!this.storage.getReadStream) {
      return res.status(501).json({ message: 'Storage does not support streaming' });
    }
    const stream = await this.storage.getReadStream(key);
    if (!stream) return res.status(404).json({ message: 'File not found' });
    res.setHeader('Content-Disposition', 'inline');
    stream.pipe(res);
  }

  @Get(':orderId/trials')
  async getTrials(
    @Param('orderId') orderId: string,
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    return this.ordersService.getTrials(orderId, branchId, tenantId);
  }

  @Post(':orderId/trials')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist')
  async createTrial(
    @Param('orderId') orderId: string,
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateLabTrialDto,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    return this.ordersService.createTrial(orderId, branchId, tenantId, user.userId, dto);
  }

  @Patch(':orderId/trials/:trialId')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist')
  async updateTrial(
    @Param('orderId') orderId: string,
    @Param('trialId') trialId: string,
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateLabTrialDto,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    return this.ordersService.updateTrial(orderId, trialId, branchId, tenantId, dto);
  }

  @Patch(':orderId/trials/:trialId/complete')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin', 'Doctor')
  async completeTrial(
    @Param('orderId') orderId: string,
    @Param('trialId') trialId: string,
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CompleteTrialDto,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    return this.ordersService.completeTrial(
      orderId,
      trialId,
      branchId,
      tenantId,
      user.userId,
      dto,
    );
  }

  @Post(':orderId/trials/:trialId/notify')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist')
  async notifyTrial(
    @Param('orderId') orderId: string,
    @Param('trialId') trialId: string,
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: TrialNotifyDto,
  ) {
    const tenantId = await this.getTenantId(branchId, user);
    await this.ordersService.notifyTrial(
      orderId,
      trialId,
      branchId,
      tenantId,
      dto.channel,
      dto.message,
    );
  }
}
