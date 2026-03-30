import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Response } from 'express';
import { User } from '../../database/entities/user.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import type { AuthUser, UserRole } from '@dental-ms/shared-types';
import { Branch } from '../../database/entities/branch.entity';
import { PermissionsService } from '../permissions/permissions.service';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
};

export type { AuthUser };

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly permissionsService: PermissionsService,
  ) {}

  private getAccessExpires(): string {
    return this.config.get('JWT_ACCESS_EXPIRES', '15m');
  }

  private getRefreshExpires(): string {
    return this.config.get('JWT_REFRESH_EXPIRES', '7d');
  }

  private parseExpiry(expires: string): number {
    const match = expires.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60;
    const [, num, unit] = match;
    const n = parseInt(num!, 10);
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    return n * (multipliers[unit!] ?? 60);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase(), isActive: true },
      relations: ['branch'],
    });
    if (!user || !user.passwordHash) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  async getAllowedBranchIds(user: User): Promise<string[]> {
    if (user.role === 'SuperAdmin') {
      const branches = await this.branchRepo.find({
        select: ['id'],
        order: { name: 'ASC' },
      });
      return branches.map((b) => b.id);
    }
    if (user.branchId) return [user.branchId];
    return [];
  }

  async login(dto: LoginDto, res: Response): Promise<AuthUser> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const allowedBranches = await this.getAllowedBranchIds(user);
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      branchId: user.branchId ?? (allowedBranches[0] ?? null),
      allowedBranches,
    };
    const accessExpires = this.getAccessExpires();
    const refreshExpires = this.getRefreshExpires();
    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      { secret: this.config.get('JWT_SECRET'), expiresIn: accessExpires },
    );
    const refreshTokenValue = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshTokenValue)
      .digest('hex');
    const refreshExpiresSec = this.parseExpiry(refreshExpires);
    const expiresAt = new Date(Date.now() + refreshExpiresSec * 1000);
    await this.refreshTokenRepo.insert({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, hash: refreshTokenHash, type: 'refresh' },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpires,
      },
    );
    const accessMaxAge = this.parseExpiry(accessExpires);
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: accessMaxAge * 1000,
    });
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: refreshExpiresSec * 1000,
    });
    return await this.toAuthUser(user, allowedBranches);
  }

  async refresh(res: Response, refreshTokenFromCookie: string): Promise<AuthUser> {
    if (!refreshTokenFromCookie) {
      throw new UnauthorizedException('Refresh token required');
    }
    let payload: { sub: string; hash?: string; type?: string };
    try {
      payload = this.jwtService.verify(refreshTokenFromCookie, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (payload.type !== 'refresh' || !payload.hash) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const stored = await this.refreshTokenRepo.findOne({
      where: {
        userId: payload.sub,
        tokenHash: payload.hash,
      },
      relations: ['user', 'user.branch'],
    });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.refreshTokenRepo.remove(stored);
      throw new UnauthorizedException('Refresh token expired or revoked');
    }
    const user = stored.user as User;
    if (!user.isActive) {
      await this.refreshTokenRepo.remove(stored);
      throw new ForbiddenException('Account is disabled');
    }
    const allowedBranches = await this.getAllowedBranchIds(user);
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      branchId: user.branchId ?? allowedBranches[0] ?? null,
      allowedBranches,
    };
    const accessExpires = this.getAccessExpires();
    const accessToken = this.jwtService.sign(
      { ...tokenPayload, type: 'access' },
      { secret: this.config.get('JWT_SECRET'), expiresIn: accessExpires },
    );
    const accessMaxAge = this.parseExpiry(accessExpires);
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: accessMaxAge * 1000,
    });
    return await this.toAuthUser(user, allowedBranches);
  }

  async getMe(user: User, allowedBranches: string[]): Promise<AuthUser> {
    return this.toAuthUser(user, allowedBranches);
  }

  async logout(res: Response, refreshTokenFromCookie?: string): Promise<void> {
    if (refreshTokenFromCookie) {
      try {
        const payload = this.jwtService.verify(refreshTokenFromCookie, {
          secret: this.config.get('JWT_REFRESH_SECRET'),
        });
        if (payload.hash) {
          await this.refreshTokenRepo.delete({
            userId: payload.sub,
            tokenHash: payload.hash,
          });
        }
      } catch {
        // ignore invalid token
      }
    }
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
  }

  async toAuthUser(user: User, allowedBranches: string[]): Promise<AuthUser> {
    const branchId = user.branchId ?? allowedBranches[0] ?? null;
    const screenPermissions = await this.permissionsService.getEffectivePermissions(
      user.id,
      user.role as UserRole,
      branchId,
    );
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId,
      allowedBranches,
      screenPermissions,
    };
  }
}
