import { PermissionsService } from './permissions.service';
import { RequestUser } from '../auth/decorators/current-user.decorator';
import { UpdateRolePermissionsDto } from './dto/role-permissions.dto';
import { SetUserOverridesDto } from './dto/user-overrides.dto';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    getAllRolePermissions(): Promise<Record<import("@dental-ms/shared-types").UserRole, Record<import("@dental-ms/shared-types").ScreenKey, boolean>>>;
    updateRolePermissions(dto: UpdateRolePermissionsDto): Promise<Record<import("@dental-ms/shared-types").ScreenKey, boolean>>;
    getUserOverrides(user: RequestUser, branchId: string, userId: string): Promise<Partial<Record<import("@dental-ms/shared-types").ScreenKey, boolean>>>;
    setUserOverrides(user: RequestUser, branchId: string, userId: string, dto: SetUserOverridesDto): Promise<Partial<Record<import("@dental-ms/shared-types").ScreenKey, boolean>>>;
    private assertCanManageUserPermissions;
}
