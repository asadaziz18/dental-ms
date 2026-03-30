import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class SuperAdminOnlyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: { role?: string } }>();
    const role = request.user?.role;
    if (role !== 'SuperAdmin') {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Only Super Admins can create or delete branches.',
      });
    }
    return true;
  }
}
