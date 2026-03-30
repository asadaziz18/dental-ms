import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts branchId from request.
 * Explicit selection (header/query) wins so branch switcher works for SuperAdmin/multi-branch users.
 * Fallback: JWT user.branchId for single-branch users who don't send header.
 */
export const BranchId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{
      headers: { 'x-branch-id'?: string };
      query?: { branchId?: string };
      user?: { branchId?: string; allowedBranches?: string[] };
    }>();
    const fromHeader = request.headers['x-branch-id'];
    const fromQuery = request.query?.branchId;
    const fromUser = request.user?.branchId;
    return (fromHeader ?? fromQuery ?? fromUser) || '';
  },
);
