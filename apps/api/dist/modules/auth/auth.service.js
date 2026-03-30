"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const user_entity_1 = require("../../database/entities/user.entity");
const refresh_token_entity_1 = require("../../database/entities/refresh-token.entity");
const branch_entity_1 = require("../../database/entities/branch.entity");
const permissions_service_1 = require("../permissions/permissions.service");
const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
};
let AuthService = class AuthService {
    userRepo;
    refreshTokenRepo;
    branchRepo;
    jwtService;
    config;
    permissionsService;
    constructor(userRepo, refreshTokenRepo, branchRepo, jwtService, config, permissionsService) {
        this.userRepo = userRepo;
        this.refreshTokenRepo = refreshTokenRepo;
        this.branchRepo = branchRepo;
        this.jwtService = jwtService;
        this.config = config;
        this.permissionsService = permissionsService;
    }
    getAccessExpires() {
        return this.config.get('JWT_ACCESS_EXPIRES', '15m');
    }
    getRefreshExpires() {
        return this.config.get('JWT_REFRESH_EXPIRES', '7d');
    }
    parseExpiry(expires) {
        const match = expires.match(/^(\d+)([smhd])$/);
        if (!match)
            return 15 * 60;
        const [, num, unit] = match;
        const n = parseInt(num, 10);
        const multipliers = {
            s: 1,
            m: 60,
            h: 3600,
            d: 86400,
        };
        return n * (multipliers[unit] ?? 60);
    }
    async validateUser(email, password) {
        const user = await this.userRepo.findOne({
            where: { email: email.toLowerCase(), isActive: true },
            relations: ['branch'],
        });
        if (!user || !user.passwordHash)
            return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        return ok ? user : null;
    }
    async getAllowedBranchIds(user) {
        if (user.role === 'SuperAdmin') {
            const branches = await this.branchRepo.find({
                select: ['id'],
                order: { name: 'ASC' },
            });
            return branches.map((b) => b.id);
        }
        if (user.branchId)
            return [user.branchId];
        return [];
    }
    async login(dto, res) {
        const user = await this.validateUser(dto.email, dto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
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
        const accessToken = this.jwtService.sign({ ...payload, type: 'access' }, { secret: this.config.get('JWT_SECRET'), expiresIn: accessExpires });
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
        const refreshToken = this.jwtService.sign({ sub: user.id, hash: refreshTokenHash, type: 'refresh' }, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: refreshExpires,
        });
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
    async refresh(res, refreshTokenFromCookie) {
        if (!refreshTokenFromCookie) {
            throw new common_1.UnauthorizedException('Refresh token required');
        }
        let payload;
        try {
            payload = this.jwtService.verify(refreshTokenFromCookie, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        if (payload.type !== 'refresh' || !payload.hash) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const stored = await this.refreshTokenRepo.findOne({
            where: {
                userId: payload.sub,
                tokenHash: payload.hash,
            },
            relations: ['user', 'user.branch'],
        });
        if (!stored || stored.expiresAt < new Date()) {
            if (stored)
                await this.refreshTokenRepo.remove(stored);
            throw new common_1.UnauthorizedException('Refresh token expired or revoked');
        }
        const user = stored.user;
        if (!user.isActive) {
            await this.refreshTokenRepo.remove(stored);
            throw new common_1.ForbiddenException('Account is disabled');
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
        const accessToken = this.jwtService.sign({ ...tokenPayload, type: 'access' }, { secret: this.config.get('JWT_SECRET'), expiresIn: accessExpires });
        const accessMaxAge = this.parseExpiry(accessExpires);
        res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: accessMaxAge * 1000,
        });
        return await this.toAuthUser(user, allowedBranches);
    }
    async getMe(user, allowedBranches) {
        return this.toAuthUser(user, allowedBranches);
    }
    async logout(res, refreshTokenFromCookie) {
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
            }
            catch {
            }
        }
        res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
        res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
    }
    async toAuthUser(user, allowedBranches) {
        const branchId = user.branchId ?? allowedBranches[0] ?? null;
        const screenPermissions = await this.permissionsService.getEffectivePermissions(user.id, user.role, branchId);
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __param(2, (0, typeorm_1.InjectRepository)(branch_entity_1.Branch)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        permissions_service_1.PermissionsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map