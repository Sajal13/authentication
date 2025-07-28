import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import refreshConfig from '../config/refresh.config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../types/auth-jwt';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt'
) {
  constructor(
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh'),
      secretOrKey: refreshTokenConfig.secret ?? '',
      ignoreExpiration: false,
      passReqToCallback: true
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const userId = payload.sub;
    const refreshToken = (req.body as { refresh: string }).refresh;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}
