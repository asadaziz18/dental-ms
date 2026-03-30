import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import type { JwtPayload } from '@dental-ms/shared-types';

function extractFromCookieOrHeader(req: Request): string | null {
  const cookie = req?.cookies?.access_token;
  if (cookie) return cookie;
  const auth = req?.headers?.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractFromCookieOrHeader]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload & { type?: string }) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }
    const user = await this.userRepo.findOne({
      where: { id: payload.userId, isActive: true },
      relations: ['branch'],
    });
    if (!user) throw new UnauthorizedException('User not found or inactive');
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      branchId: payload.branchId ?? user.branchId,
      allowedBranches: payload.allowedBranches ?? [],
      user,
    };
  }
}
