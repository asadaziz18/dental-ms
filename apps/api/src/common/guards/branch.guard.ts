import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const BRANCH_OPTIONAL_KEY = 'branchOptional';

@Injectable()
export class BranchGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const optional = this.reflector.get<boolean>(
      BRANCH_OPTIONAL_KEY,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    const branchId =
      request.user?.branchId ??
      request.headers['x-branch-id'] ??
      request.query?.branchId;
    if (!branchId && !optional) {
      throw new BadRequestException(
        'Branch context required. Provide X-Branch-Id header or branchId query (or use JWT with branchId when auth is enabled).',
      );
    }
    request.branchId = branchId;
    return true;
  }
}
