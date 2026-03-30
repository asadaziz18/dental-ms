import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';
import { BranchId } from '../../common/decorators/branch-id.decorator';
import { UpdateRolePermissionsDto } from './dto/role-permissions.dto';
import { SetUserOverridesDto } from './dto/user-overrides.dto';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /** SuperAdmin: get all role default permissions. */
  @Get('roles')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin')
  getAllRolePermissions() {
    return this.permissionsService.getAllRolePermissions();
  }

  /** SuperAdmin: update default permissions for a role. */
  @Put('roles')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin')
  async updateRolePermissions(@Body() dto: UpdateRolePermissionsDto) {
    return this.permissionsService.setRolePermissions(dto.role, dto.permissions);
  }

  /** BranchAdmin (or SuperAdmin): get screen overrides for a user in current branch. */
  @Get('users/:userId')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin')
  async getUserOverrides(
    @CurrentUser() user: RequestUser,
    @BranchId() branchId: string,
    @Param('userId') userId: string,
  ) {
    this.assertCanManageUserPermissions(user, branchId, userId);
    return this.permissionsService.getUserOverrides(userId, branchId);
  }

  /** BranchAdmin (or SuperAdmin): set screen overrides for a user in current branch. */
  @Put('users/:userId')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin', 'BranchAdmin')
  async setUserOverrides(
    @CurrentUser() user: RequestUser,
    @BranchId() branchId: string,
    @Param('userId') userId: string,
    @Body() dto: SetUserOverridesDto,
  ) {
    this.assertCanManageUserPermissions(user, branchId, userId);
    return this.permissionsService.setUserOverrides(userId, branchId, dto.overrides);
  }

  private assertCanManageUserPermissions(
    user: RequestUser,
    branchId: string,
    targetUserId: string,
  ): void {
    if (user.role === 'SuperAdmin') return;
    if (user.role !== 'BranchAdmin') {
      throw new ForbiddenException('Only BranchAdmin or SuperAdmin can manage user screen access');
    }
    const allowed = user.allowedBranches ?? (user.branchId ? [user.branchId] : []);
    if (!allowed.includes(branchId)) {
      throw new ForbiddenException('You can only manage permissions for staff in your branch');
    }
    if (user.userId === targetUserId) {
      throw new ForbiddenException('You cannot change your own screen overrides');
    }
  }
}
