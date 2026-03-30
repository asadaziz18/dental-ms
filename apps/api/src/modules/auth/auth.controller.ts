import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService, AuthUser } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';

const REFRESH_TOKEN_COOKIE = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: false }) res: Response,
  ): Promise<void> {
    const user = await this.authService.login(dto, res);
    res.status(200).json({ user });
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: false }) res: Response,
  ): Promise<void> {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
    const user = await this.authService.refresh(res, token);
    res.status(200).json({ user });
  }

  @Public()
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: false }) res: Response,
  ): Promise<void> {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
    await this.authService.logout(res, token);
    res.status(200).json({ success: true });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() reqUser: RequestUser): Promise<AuthUser> {
    return this.authService.getMe(reqUser.user, reqUser.allowedBranches ?? []);
  }
}
