import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { SyncService, type SyncPushResult } from './sync.service';
import { PushSyncDto } from './dto/push-sync.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BranchGuard } from '../../common/guards/branch.guard';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';

@Controller('sync')
@UseGuards(JwtAuthGuard, BranchGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  async push(
    @BranchId() branchId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: PushSyncDto,
  ): Promise<{ results: SyncPushResult[] }> {
    const results = await this.syncService.push(
      branchId,
      user.role as 'SuperAdmin' | 'BranchAdmin' | 'Doctor' | 'Receptionist' | 'Nurse',
      user.allowedBranches ?? [],
      body.operations.map((op) => ({
        entity: op.entity,
        operation: op.operation,
        payload: op.payload,
        clientId: op.clientId,
      })),
    );
    return { results };
  }

  @Get('pull')
  async pull(
    @BranchId() branchId: string,
    @Query('lastSyncedAt') lastSyncedAt?: string,
  ) {
    return this.syncService.pull(branchId, lastSyncedAt);
  }
}
