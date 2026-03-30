import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../../database/entities/user.entity';

export interface RequestUser {
  userId: string;
  email: string;
  role: string;
  branchId: string | null;
  allowedBranches: string[];
  user: User;
}

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext): RequestUser | unknown => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;
    if (data) return user?.[data];
    return user;
  },
);
