import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { AccessTokenPayload } from '../interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    } as any);
  }

  async validate(payload: AccessTokenPayload) {
    try {
      const user = await this.authService.findCurrentUserById(payload.sub);
      return {
        ...user,
        role: payload.role,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
