import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { CookieService } from 'src/common/cookie.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import type { TCurrentUser } from 'src/auth/types/current-user.type';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
    @CurrentUser() user: TCurrentUser<null>,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'] ?? '';

    const { access, refresh } = await this.authService.login(
      user,
      ipAddress,
      userAgent,
    );

    this.cookieService.set(res, 'accessToken', access.token, {
      expires: access.expiresAt,
    });

    this.cookieService.set(res, 'refreshToken', refresh.token, {
      expires: refresh.expiresAt,
    });

    return { message: 'Login successful' };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Res() res: FastifyReply, @CurrentUser() user: TCurrentUser) {
    const { access, refresh } = await this.authService.refreshToken(user);

    this.cookieService.set(res, 'accessToken', access.token, {
      expires: access.expiresAt,
    });

    this.cookieService.set(res, 'refreshToken', refresh.token, {
      expires: refresh.expiresAt,
    });

    return { message: 'Login successful' };
  }
}
